import {
  dockerInfo,
  dockerImages,
  dockerContainers,
  dockerVolumes,
} from "systeminformation";
import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { tryCatchUtil } from "../util/try-catch-util.ts";
import { pathConfig } from "../config/path-config.ts";

export async function dockerScript() {
  tryCatchUtil(async () => {
    const [di, dc, dis, dv] = await Promise.all([
      dockerInfo(),
      dockerContainers(),
      dockerImages(),
      dockerVolumes(),
    ]);
    const dockeri = {
      dockerInfo: di,
      dockerContainers: dc,
      dockerImages: dis,
      dockerVolumes: dv,
    };
    const dockerJosnFilePath = resolve(pathConfig.dockerPath);
    await writeFile(
      dockerJosnFilePath,
      JSON.stringify(dockeri, null, 2),
      "utf-8",
    );
  });
}
