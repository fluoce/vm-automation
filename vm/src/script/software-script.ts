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
    let softwares: any[] = [];

    if (isPlatformWindows()) {
      // 1. Try winget first (captures name, version, and id)
      const wingetOutput = await executeCommandUtil({
        command: "winget",
        args: ["list", "--source", "winget"],
      });

      if (wingetOutput) {
        const lines = wingetOutput.split(/\r?\n/);
        if (lines.length >= 3) {
          let separatorIndex = lines.findIndex((line) =>
            line.startsWith("---"),
          );
          if (separatorIndex === -1) separatorIndex = 1;

          for (let i = separatorIndex + 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            // Winget columns: Name, Id, Version, Available, Source
            const columns = line.split(/\s{2,}/);
            if (columns && columns.length >= 3) {
              softwares.push({
                name: columns[0],
                icon: "",
                installedPath: "", // Winget does not expose installation path directly via list
                version: columns[2],
              });
            }
          }
        }
      } else {
        // Fallback: PowerShell Registry (captures Name, Version, and sometimes InstallLocation)
        const psCommand = "powershell";
        const psArgs = [
          "-NoProfile",
          "-ExecutionPolicy",
          "Bypass",
          "-Command",
          "Get-ItemProperty HKLM:\\Software\\Wow6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\*, HKLM:\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\* | Where-Object { $_.DisplayName -and $_.SystemComponent -ne 1 } | ConvertTo-Json -Depth 2",
        ];

        const psOutput = await executeCommandUtil({
          command: psCommand,
          args: psArgs,
        });
        if (psOutput) {
          try {
            const parsedJson = JSON.parse(psOutput);
            const items = Array.isArray(parsedJson) ? parsedJson : [parsedJson];

            for (const item of items) {
              if (item.DisplayName) {
                softwares.push({
                  name: item.DisplayName || "",
                  icon: "",
                  installedPath: item.InstallLocation || "",
                  version: item.DisplayVersion || "",
                });
              }
            }
          } catch {
            // Soft fallback to text line separation if JSON parse fails
          }
        }
      }
    } else if (isPlatformLinux()) {
      // 2. Fallthrough check for standard native Linux package managers
      // Note: Linux package managers usually require distinct sub-commands for path/version checks
      if (await executeCommandUtil({ command: "which", args: ["apt-mark"] })) {
        // Ubuntu/Debian approach: get manually installed apps, then query details
        const aptOutput = await executeCommandUtil({
          command: "apt-mark",
          args: ["showmanual"],
        });
        if (aptOutput) {
          const lines = aptOutput
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean);
          for (const pkg of lines) {
            // Quick check for version using dpkg-query
            const details = await executeCommandUtil({
              command: "dpkg-query",
              args: ["-W", "-f=${Version}", pkg],
            });
            softwares.push({
              name: pkg,
              icon: "",
              installedPath: `/usr/share/doc/${pkg}`, // Standard fallback location
              version: details ? details.trim() : "",
            });
          }
        }
      } else if (
        await executeCommandUtil({ command: "which", args: ["pacman"] })
      ) {
        // Arch Linux approach
        const pacmanOutput = await executeCommandUtil({
          command: "pacman",
          args: ["-Qe"],
        });
        if (pacmanOutput) {
          const lines = pacmanOutput
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean);
          for (const line of lines) {
            const [name, version] = line.split(" ");
            softwares.push({
              name: name || "",
              icon: "",
              installedPath: "",
              version: version || "",
            });
          }
        }
      }

      // 3. Append Flatpak apps if present
      const flatpakOutput = await executeCommandUtil({
        command: "flatpak",
        args: ["list", "--app", "--columns=name,version,application"],
      });
      if (flatpakOutput) {
        const lines = flatpakOutput
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean);
        for (const line of lines) {
          const columns = line.split(/\t/); // Flatpak splits columns with tabs
          if (columns && columns.length >= 2) {
            softwares.push({
              name: columns[0],
              icon: "",
              installedPath: columns[2]
                ? `/var/lib/flatpak/app/${columns[2]}`
                : "",
              version: columns[1] || "",
            });
          }
        }
      }
    }

    // Deduplicate array by software name
    const uniqueSoftwares = Array.from(
      new Map(softwares.map((item) => [item.name, item])).values(),
    ).sort((a, b) => a.name.localeCompare(b.name));

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
