import { readdir } from "node:fs/promises";
import { join } from "node:path";

export async function findFallbackExeUtil(
  installLocation: string | null,
  appName: string,
): Promise<string | null> {
  if (!installLocation) return null;
  try {
    const files = await readdir(installLocation);
    const cleanAppName = appName.split(" ")[0].toLowerCase();
    const match = files.find(
      (f) =>
        f.toLowerCase().endsWith(".exe") &&
        f.toLowerCase().includes(cleanAppName),
    );
    if (match) return join(installLocation, match);
    const fallback = files.find(
      (f) =>
        f.toLowerCase().endsWith(".exe") && !f.toLowerCase().includes("unins"),
    );
    if (fallback) return join(installLocation, fallback);
  } catch {}
  return null;
}
