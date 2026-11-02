import fs from "node:fs/promises";
import { tryCatchUtil } from "../util/try-catch-util.ts";
import path from "node:path";
import { pathConfig } from "../config/path-config.ts";

export async function hardwareScript() {
  tryCatchUtil(async () => {
    const hardwareInfo = {};
    const hardwareJosnFilePath = path.resolve(pathConfig.hardwarePath);
    await fs.writeFile(
      hardwareJosnFilePath,
      JSON.stringify(hardwareInfo, null, 2),
      "utf-8",
    );
  });
}
