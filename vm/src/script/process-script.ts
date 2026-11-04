import { processes } from "systeminformation";
import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { tryCatchUtil } from "../util/index.ts";
import { pathConfig } from "../config/path-config.ts";

export async function processScript() {
  await tryCatchUtil(async () => {
    const [p] = await Promise.all([processes()]);
    const networkInfo = {
      processes: p,
    };
    const processJosnFilePath = resolve(pathConfig.processPath);
    await writeFile(
      processJosnFilePath,
      JSON.stringify(networkInfo, null, 2),
      "utf-8",
    );
  });
}
