import { networkInterfaces, networkGatewayDefault } from "systeminformation";
import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { tryCatchUtil } from "../util/try-catch-util.ts";
import { pathConfig } from "../config/path-config.ts";

export async function networkScript() {
  const [ni, ngd] = await Promise.all([
    networkInterfaces(),
    networkGatewayDefault(),
  ]);
  const networkInfo = {
    networkInterfaces: ni,
    networkGatewayDefault: ngd,
  };
  tryCatchUtil(async () => {
    const netwokJosnFilePath = resolve(pathConfig.networkPath);
    await writeFile(
      netwokJosnFilePath,
      JSON.stringify(networkInfo, null, 2),
      "utf-8",
    );
  });
}
