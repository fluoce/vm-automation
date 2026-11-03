import { osInfo } from "systeminformation";
import { resolve } from "node:path";
import { writeFile } from "node:fs/promises";
import { pathConfig } from "../config/path-config.ts";
import { tryCatchUtil } from "../util/try-catch-util.ts";

export async function osScript() {
  await tryCatchUtil(async () => {
    const osi = await osInfo();
    const osJosnFilePath = resolve(pathConfig.osPath);
    await writeFile(
      osJosnFilePath,
      JSON.stringify(
        {
          ...osi,
          metadata: {
            scannedAt: new Date().toISOString(),
          },
        },
        null,
        2,
      ),
      "utf-8",
    );
  });
}
