import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  QUEUE_POLL_INTERVAL_SEC,
  useRealtimeQueue,
} from "./use-realtime-queue";

type Handler = (...args: unknown[]) => void;

const mockTeardown = vi.fn();

vi.mock("@/lib/realtime-socket", () => ({
  teardownRealtimeSocket: (...args: unknown[]) => mockTeardown(...args),
}));

vi.mock("@/lib/auth/token-storage", () => ({
  getStoredAccessToken: () => "test-token",
}));

function createMockSocket() {
  const handlers = new Map<string, Handler[]>();
  const socket = {
    connected: false,
    on: vi.fn((event: string, handler: Handler) => {
      const list = handlers.get(event) ?? [];
      list.push(handler);
      handlers.set(event, list);
    }),
  };

  const trigger = (event: string, ...args: unknown[]) => {
    for (const handler of handlers.get(event) ?? []) {
      handler(...args);
    }
  };

  const setConnected = (value: boolean) => {
    socket.connected = value;
  };

  return { socket, trigger, setConnected };
}

let mockSocketBundle = createMockSocket();

vi.mock("socket.io-client", () => ({
  io: vi.fn(() => mockSocketBundle.socket),
}));

describe("useRealtimeQueue fallback", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockSocketBundle = createMockSocket();
    mockTeardown.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("uses socket events when connected (polling off)", () => {
    const onUpdate = vi.fn();

    const { result } = renderHook(() =>
      useRealtimeQueue("clinic-1", onUpdate, true),
    );

    act(() => {
      mockSocketBundle.setConnected(true);
      mockSocketBundle.trigger("connect");
    });

    expect(result.current.isConnected).toBe(true);
    expect(result.current.isPolling).toBe(false);

    onUpdate.mockClear();

    act(() => {
      mockSocketBundle.trigger("queue.updated", { clinicId: "clinic-1" });
      vi.advanceTimersByTime(1_200);
    });

    expect(onUpdate).toHaveBeenCalledTimes(1);
  });

  it("starts polling on disconnect and refreshes on interval", () => {
    const onUpdate = vi.fn();

    const { result } = renderHook(() =>
      useRealtimeQueue("clinic-1", onUpdate, true),
    );

    act(() => {
      mockSocketBundle.setConnected(true);
      mockSocketBundle.trigger("connect");
    });

    onUpdate.mockClear();

    act(() => {
      mockSocketBundle.setConnected(false);
      mockSocketBundle.trigger("disconnect");
    });

    expect(result.current.isConnected).toBe(false);
    expect(result.current.isPolling).toBe(true);
    expect(onUpdate).toHaveBeenCalledTimes(1);

    act(() => {
      vi.advanceTimersByTime(QUEUE_POLL_INTERVAL_SEC * 1_000);
    });

    expect(onUpdate).toHaveBeenCalledTimes(2);
  });

  it("stops polling and resumes socket mode on reconnect", () => {
    const onUpdate = vi.fn();

    const { result } = renderHook(() =>
      useRealtimeQueue("clinic-1", onUpdate, true),
    );

    act(() => {
      mockSocketBundle.trigger("connect_error");
    });

    expect(result.current.isPolling).toBe(true);

    onUpdate.mockClear();

    act(() => {
      mockSocketBundle.setConnected(true);
      mockSocketBundle.trigger("connect");
    });

    expect(result.current.isConnected).toBe(true);
    expect(result.current.isPolling).toBe(false);
    expect(onUpdate).toHaveBeenCalledTimes(1);

    onUpdate.mockClear();

    act(() => {
      vi.advanceTimersByTime(QUEUE_POLL_INTERVAL_SEC * 1_000);
    });

    expect(onUpdate).not.toHaveBeenCalled();
  });

  it("ignores socket events while polling (reconnect flicker)", async () => {
    const onUpdate = vi.fn();

    renderHook(() => useRealtimeQueue("clinic-1", onUpdate, true));

    act(() => {
      mockSocketBundle.trigger("connect_error");
    });

    onUpdate.mockClear();

    act(() => {
      mockSocketBundle.trigger("queue.updated");
      mockSocketBundle.trigger("queue.added");
      vi.advanceTimersByTime(1_200);
    });

    expect(onUpdate).not.toHaveBeenCalled();
  });

  it("creates only one polling interval during rapid disconnects", async () => {
    const setIntervalSpy = vi.spyOn(global, "setInterval");

    renderHook(() => useRealtimeQueue("clinic-1", vi.fn(), true));

    act(() => {
      mockSocketBundle.trigger("disconnect");
      mockSocketBundle.trigger("disconnect");
      mockSocketBundle.trigger("connect_error");
    });

    const pollIntervals = setIntervalSpy.mock.calls.filter(
      ([, ms]) => ms === QUEUE_POLL_INTERVAL_SEC * 1_000,
    );

    expect(pollIntervals).toHaveLength(1);

    setIntervalSpy.mockRestore();
  });
});
