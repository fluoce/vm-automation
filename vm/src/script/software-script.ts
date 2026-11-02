import { getInstalledApps } from "get-installed-apps";
import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { tryCatchUtil } from "../util/try-catch-util.ts";
import { pathConfig } from "../config/path-config.ts";

export async function softwareScript() {
  tryCatchUtil(async () => {
    const software = await getInstalledApps();
    const softwareInfo = {
      software,
    };
    const softwareJosnFilePath = resolve(pathConfig.softwarePath);
    await writeFile(
      softwareJosnFilePath,
      JSON.stringify(softwareInfo, null, 2),
      "utf-8",
    );
  });
}
