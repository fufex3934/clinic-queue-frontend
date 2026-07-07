export function getErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === "object" && "statusCode" in err) {
    const statusCode = Number((err as { statusCode?: number }).statusCode);
    if (statusCode === 429) {
      const retryAfter = (err as { retryAfter?: number }).retryAfter;
      if (typeof retryAfter === "number" && retryAfter > 0) {
        return `Too many requests. Please try again in ${retryAfter} second${retryAfter === 1 ? "" : "s"}.`;
      }
      return "Too many requests. Please wait a moment and try again.";
    }
    if (statusCode >= 500) return "Server is temporarily unavailable. Please try again shortly.";
    if (statusCode === 401) return "Your session expired. Please sign in again.";
  }

  if (err && typeof err === "object" && "message" in err) {
    const message = (err as { message: string | string[] }).message;
    return Array.isArray(message) ? message.join(", ") : String(message);
  }
  return fallback;
}
