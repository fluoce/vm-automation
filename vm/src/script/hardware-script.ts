import {
  system,
  cpu,
  diskLayout,
  blockDevices,
  fsSize,
  mem,
  memLayout,
  baseboard,
  bios,
  chassis,
  graphics,
  usb,
  printer,
  battery,
} from "systeminformation";
import { writeFile } from "node:fs/promises";
import { tryCatchUtil } from "../util/index.ts";
import { resolve } from "node:path";
import { pathConfig } from "../config/path-config.ts";

export async function hardwareScript() {
  await tryCatchUtil(async () => {
    const [s, c, dl, bd, fs, m, ml, bb, b, cs, g, u, p, by] = await Promise.all(
      [
        system(),
        cpu(),
        diskLayout(),
        blockDevices(),
        fsSize(),
        mem(),
        memLayout(),
        baseboard(),
        bios(),
        chassis(),
        graphics(),
        usb(),
        printer(),
        battery(),
      ],
    );
    const hardwareInfo = {
      system: s,
      cpu: c,
      disk: {
        layout: dl,
        devices: bd,
        filesystems: fs,
      },
      memory: {
        ...m,
        layout: ml,
      },
      baseboard: bb,
      bios: b,
      chassis: cs,
      graphics: g,
      usb: u,
      printer: p,
      battery: by,
    };
    const hardwareJosnFilePath = resolve(pathConfig.hardwarePath);
    await writeFile(
      hardwareJosnFilePath,
      JSON.stringify(hardwareInfo, null, 2),
      "utf-8",
    );
  });
}
