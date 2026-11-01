import os from "node:os";
import path from "node:path";
import fs from "node:fs/promises";
import { pathConfig } from "../config/path-config.ts";
import { tryCatchUtil } from "../util/try-catch-util.ts";

export async function osScript() {
  tryCatchUtil(async () => {
    const osInfo = {
      eol: os.EOL,
      availableParallelism: os.availableParallelism(),
      arch: os.arch(),
      // constants: os.constants,
      cpus: os.cpus(),
      devNull: os.devNull,
      endianness: os.endianness(),
      freemem: os.freemem(),
      homedir: os.homedir(),
      hostname: os.hostname(),
      loadavg: os.loadavg(),
      machine: os.machine(),
      networkInterfaces: os.networkInterfaces(),
      platform: os.platform(),
      release: os.release(),
      tmpdir: os.tmpdir(),
      totalmem: os.totalmem(),
      type: os.type(),
      uptime: os.uptime(),
      userInfo: os.userInfo(),
      version: os.version(),
      metadata: {
        scannedAt: new Date(Date.now()).toISOString(),
      },
    };
    const osJosnFilePath = path.resolve(pathConfig.osPath);
    await fs.writeFile(
      osJosnFilePath,
      JSON.stringify(osInfo, null, 2),
      "utf-8",
    );
  });
}
