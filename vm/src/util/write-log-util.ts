import { appendFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathConfig } from "../config/path-config.ts";

export async function writeLogUtil({
  type,
  message,
}: {
  type: "INFO" | "WARN" | "ERROR" | "DEBUG" | "SUCCESS";
  message: string;
}) {
  const vmLogFilePath = resolve(pathConfig.vmLogPath);
  await appendFile(
    vmLogFilePath,
    `${[type]} : ${new Date(Date.now()).toISOString()} : ${message}` + "\n",
    "utf-8",
  );
}
