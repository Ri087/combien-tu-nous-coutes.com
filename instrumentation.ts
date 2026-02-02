/**
 * This function is required by Next.js instrumentation API
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./orpc/server");
  }
}
