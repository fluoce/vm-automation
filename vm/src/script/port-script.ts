import { networkConnections } from "systeminformation";
import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { tryCatchUtil } from "../util/index.ts";
import { pathConfig } from "../config/path-config.ts";

export async function portScript() {
  await tryCatchUtil(async () => {
    const [nc] = await Promise.all([networkConnections()]);
    const networkInfo = {
      networkConnections: nc,
    };
    const portJosnFilePath = resolve(pathConfig.portPath);
    await writeFile(
      portJosnFilePath,
      JSON.stringify(networkInfo, null, 2),
      "utf-8",
    );
  });
}
