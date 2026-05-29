export function getErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === "object" && "message" in err) {
    const message = (err as { message: string | string[] }).message;
    return Array.isArray(message) ? message.join(", ") : String(message);
  }
  return fallback;
}
