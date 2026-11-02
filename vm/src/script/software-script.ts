import { getInstalledApps } from "get-installed-apps";
import iconExtractor from "file-icon-extractor";
import { writeFile, mkdir } from "node:fs/promises";
import { resolve, join, basename, extname } from "node:path";
import { tryCatchUtil } from "../util/try-catch-util.ts";
import { pathConfig } from "../config/path-config.ts";

export async function softwareScript() {
  tryCatchUtil(async () => {
    const installedSoftwares = await getInstalledApps();
    const softwareIconsDir = resolve(pathConfig.softwareIconDir);
    await mkdir(softwareIconsDir, { recursive: true });
    const softwares: any[] = [];
    if (Array.isArray(installedSoftwares)) {
      for (const software of installedSoftwares) {
        let iconSrc: string | null = null;
        if (software?.DisplayIcon) {
          const iconPath = software.DisplayIcon.replace(/^"/, "")
            .replace(/",\s*-?\d+$/, "")
            .replace(/,\s*-?\d+$/, "")
            .replace(/"$/, "")
            .trim();
          await iconExtractor.extract(iconPath, softwareIconsDir, "png");
          const iconFileName = `${basename(iconPath, extname(iconPath))}.png`;
          iconSrc = join(softwareIconsDir, iconFileName);
        }
        softwares.push({
          ...software,
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
  });
}
