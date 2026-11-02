import path from "node:path";
import fs from "node:fs/promises";
import { pathConfig } from "../config/path-config.ts";
import { tryCatchUtil } from "../util/try-catch-util.ts";

export async function osScript() {
  tryCatchUtil(async () => {
    const osInfo = {};
    const osJosnFilePath = path.resolve(pathConfig.osPath);
    await fs.writeFile(
      osJosnFilePath,
      JSON.stringify(osInfo, null, 2),
      "utf-8",
    );
  });
}
