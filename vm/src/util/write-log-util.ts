import fs from "node:fs/promises";
import path from "node:path";
import { pathConfig } from "../config/path-config.ts";

export async function writeLogUtil({
  type,
  message,
}: {
  type: "INFO" | "WARN" | "ERROR" | "DEBUG" | "SUCCESS";
  message: string;
}) {
  const vmLogFilePath = path.resolve(pathConfig.vmLogPath);
  await fs.appendFile(
    vmLogFilePath,
    `${[type]} : ${new Date(Date.now()).toISOString()} : ${message}` + "\n",
    "utf-8",
  );
}
