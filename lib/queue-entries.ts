import type { QueueEntry } from "@/types";

/** Shallow compare — enough to skip redundant React state updates. */
export function queueEntriesEqual(a: QueueEntry[], b: QueueEntry[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    const left = a[i];
    const right = b[i];
    if (left._id !== right._id) return false;
    if (left.status !== right.status) return false;
    if (left.tokenNumber !== right.tokenNumber) return false;
  }
  return true;
}
