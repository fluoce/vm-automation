import { services } from "systeminformation";
import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { tryCatchUtil } from "../util/index.ts";
import { pathConfig } from "../config/path-config.ts";

export async function serviceScript() {
  await tryCatchUtil(async () => {
    const [s] = await Promise.all([services("*")]);
    const serviceInfo = {
      services: s,
    };
    const serviceJosnFilePath = resolve(pathConfig.servicePath);
    await writeFile(
      serviceJosnFilePath,
      JSON.stringify(serviceInfo, null, 2),
      "utf-8",
    );
  });
}
