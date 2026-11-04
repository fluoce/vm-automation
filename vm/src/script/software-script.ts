import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import {
  tryCatchUtil,
  executeCommandUtil,
  isPlatformWindows,
  isPlatformLinux,
} from "../util/index.ts";
import { pathConfig } from "../config/path-config.ts";

export async function softwareScript() {
  await tryCatchUtil(async () => {
    let softwares: string[] = [];

    if (isPlatformWindows()) {
      // 1. Fetch user-installed apps via winget
      const wingetOutput = await executeCommandUtil({
        command: "winget",
        args: ["list", "--source", "winget"],
      });

      if (wingetOutput) {
        // Inline parsing block to completely avoid scope resolution errors
        const lines = wingetOutput.split(/\r?\n/);
        if (lines.length >= 3) {
          let separatorIndex = lines.findIndex((line) =>
            line.startsWith("---"),
          );
          if (separatorIndex === -1) separatorIndex = 1;

          for (let i = separatorIndex + 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            const columns = line.split(/\s{2,}/);
            if (columns && columns[0]) {
              softwares.push(columns[0]);
            }
          }
        }
      } else {
        // Fallback: Use PowerShell Registry filtering if winget is absent
        const psCommand = "powershell";
        const psArgs = [
          "-NoProfile",
          "-ExecutionPolicy",
          "Bypass",
          "-Command",
          "Get-ItemProperty HKLM:\\Software\\Wow6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\*, HKLM:\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\* | Where-Object { $_.DisplayName -and $_.SystemComponent -ne 1 } | Select-Object -ExpandProperty DisplayName",
        ];

        const psOutput = await executeCommandUtil({
          command: psCommand,
          args: psArgs,
        });
        if (psOutput) {
          softwares = psOutput
            .split(/\r?\n/)
            .map((line) => line.trim())
            .filter(Boolean);
        }
      }
    } else if (isPlatformLinux()) {
      const commandsToTry = [
        { cmd: "apt-mark", args: ["showmanual"] },
        { cmd: "pacman", args: ["-Qe"] },
        { cmd: "dnf", args: ["history", "userinstalled"] },
      ];

      for (const target of commandsToTry) {
        const output = await executeCommandUtil({
          command: target.cmd,
          args: target.args,
        });
        if (output) {
          if (target.cmd === "pacman") {
            softwares = output
              .split("\n")
              .map((line) => line.trim().split(" ")[0])
              .filter(Boolean);
          } else {
            softwares = output
              .split("\n")
              .map((line) => line.trim())
              .filter(Boolean);
          }
          break;
        }
      }

      // 3. Append Flatpak apps if platform is utilizing universal packages
      const flatpakOutput = await executeCommandUtil({
        command: "flatpak",
        args: ["list", "--app", "--columns=name"],
      });
      if (flatpakOutput) {
        const flatpaks = flatpakOutput
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean);
        softwares = [...softwares, ...flatpaks];
      }
    }

    const uniqueSoftwares = Array.from(new Set(softwares))
      .map((name) => name.trim())
      .filter(Boolean)
      .sort();

    const softwareInfo = {
      softwares: uniqueSoftwares,
    };
    const softwareJsonFilePath = resolve(pathConfig.softwarePath);
    await writeFile(
      softwareJsonFilePath,
      JSON.stringify(softwareInfo, null, 2),
      "utf-8",
    );
  });
}
