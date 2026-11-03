import { extractIcon } from "ico-extract";
import { readFile, writeFile, copyFile } from "node:fs/promises";
import { join, extname } from "node:path";

const PE_EXTS = new Set([".exe", ".dll"]);

export function extractIconUtil(
  jobs: { iconPath: string; iconFileName: string }[],
  dir: string,
  limit = 4,
): Promise<void> {
  return new Promise((resolve) => {
    if (jobs.length === 0) return resolve();
    let index = 0;
    let active = 0;
    const runNext = () => {
      if (index >= jobs.length) {
        if (active === 0) resolve();
        return;
      }
      active++;
      const job = jobs[index++];
      setImmediate(async () => {
        try {
          const ext = extname(job.iconPath).toLowerCase();
          const outputPath = join(dir, job.iconFileName);
          if (PE_EXTS.has(ext)) {
            const peBytes = await readFile(job.iconPath);
            const icoBytes = extractIcon(peBytes, 0);
            await writeFile(outputPath, icoBytes);
          } else {
            await copyFile(job.iconPath, outputPath);
          }
        } catch (e) {
          console.error("icon extract failed:", job.iconPath, e);
        } finally {
          active--;
          runNext();
        }
      });
    };
    for (let i = 0; i < Math.min(limit, jobs.length); i++) runNext();
  });
}
