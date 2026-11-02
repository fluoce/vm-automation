import { services } from "systeminformation";
import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { tryCatchUtil } from "../util/try-catch-util.ts";
import { pathConfig } from "../config/path-config.ts";

export async function serviceScript() {
  const [s] = await Promise.all([services("*")]);
  const serviceInfo = {
    services: s,
  };
  tryCatchUtil(async () => {
    const serviceJosnFilePath = resolve(pathConfig.servicePath);
    await writeFile(
      serviceJosnFilePath,
      JSON.stringify(serviceInfo, null, 2),
      "utf-8",
    );
  });
}
