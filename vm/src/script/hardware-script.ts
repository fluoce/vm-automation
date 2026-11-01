import os from "node:os";
import fs from "node:fs/promises";
import { tryCatchUtil } from "../util/try-catch-util.ts";
import path from "node:path";
import { pathConfig } from "../config/path-config.ts";

export async function hardwareScript() {
  tryCatchUtil(async () => {
    const cpus = os.cpus();
    const diskPath = os.platform() === "win32" ? "C:\\" : "/";
    const disk = await fs.statfs(diskPath);
    const hardwareInfo = {
      cpu: {
        model: cpus[0]?.model ?? null,
        logicalCores: cpus.length,
        architecture: os.arch(),
        speed: cpus[0]?.speed ?? null,
      },
      memory: {
        total: os.totalmem(),
        free: os.freemem(),
        used: os.totalmem() - os.freemem(),
      },
      disk: {
        total: disk.blocks * disk.bsize,
        free: disk.bfree * disk.bsize,
        available: disk.bavail * disk.bsize,
        used: (disk.blocks - disk.bfree) * disk.bsize,
      },
      metadata: {
        scannedAt: new Date().toISOString(),
      },
    };
    const hardwareJosnFilePath = path.resolve(pathConfig.hardwarePath);
    await fs.writeFile(
      hardwareJosnFilePath,
      JSON.stringify(hardwareInfo, null, 2),
      "utf-8",
    );
  });
}
