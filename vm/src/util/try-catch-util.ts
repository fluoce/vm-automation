import { writeLogUtil } from "./write-log-util.ts";

export async function tryCatchUtil<T>(fn: () => Promise<T>) {
  try {
    return await fn();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    await writeLogUtil({
      type: "ERROR",
      message: errorMessage,
    });
    throw error;
  }
}
