import { execFile } from "node:child_process";
import { promisify } from "node:util";
import type { ExecFileOptions } from "node:child_process";
import { tryCatchUtil } from "./try-catch-util.ts";

const run = promisify(execFile);

export async function executeCommandUtil({
  command,
  args = [],
  options = {
    timeout: 60_000,
    maxBuffer: 10 * 1024 * 1024,
    encoding: "utf8",
  },
}: {
  command: string;
  args?: string[];
  options?: ExecFileOptions;
}) {
  return tryCatchUtil(async () => {
    const { stdout } = await run(command, [...args], { ...options });
    return String(stdout).trim();
  });
}
