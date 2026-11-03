import { getInstalledApps } from "get-installed-apps";
import { writeFile, mkdir } from "node:fs/promises";
import { resolve, join, basename, extname } from "node:path";
import { tryCatchUtil } from "../util/try-catch-util.ts";
import { pathConfig } from "../config/path-config.ts";
import { extractIconUtil } from "../util/extract-icon-util.ts";

export async function softwareScript() {
  await tryCatchUtil(async () => {
    const installedSoftwares = await getInstalledApps();
    const softwareIconsDir = resolve(pathConfig.softwareIconDir);
    await mkdir(softwareIconsDir, { recursive: true });
    const softwares: any[] = [];
    const iconJobs: { iconPath: string; iconFileName: string }[] = [];
    if (Array.isArray(installedSoftwares)) {
      for (const software of installedSoftwares) {
        let iconSrc: string | null = null;
        if (software?.DisplayIcon) {
          const iconPath = software.DisplayIcon.replace(/^"/, "")
            .replace(/",\s*-?\d+$/, "")
            .replace(/,\s*-?\d+$/, "")
            .replace(/"$/, "")
            .trim();
          const iconFileName = `${basename(iconPath, extname(iconPath))}.ico`;
          iconSrc = join(softwareIconsDir, iconFileName);
          iconJobs.push({ iconPath, iconFileName });
        }
        softwares.push({
          appIdentifier: software?.appIdentifier || null,
          name: software?.DisplayName || software?.appName || null,
          version:
            software?.DisplayVersion ||
            software?.appVersion ||
            software?.Version ||
            null,
          publisher: software?.publisher || software?.appPublisher || null,
          installLocation: software?.InstallLocation || null,
          installDate: software?.InstallDate || software?.appInstallDate,
          displayIcon: software?.DisplayIcon || null,
          comments: software?.Comments || null,
          iconSrc,
        });
      }
    }
    const softwareInfo = {
      softwares,
    };
    const softwareJosnFilePath = resolve(pathConfig.softwarePath);
    await writeFile(
      softwareJosnFilePath,
      JSON.stringify(softwareInfo, null, 2),
      "utf-8",
    );
    extractIconUtil(iconJobs, softwareIconsDir);
  });
}
