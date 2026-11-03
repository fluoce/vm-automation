import fs from "node:fs";
import path from "node:path";
import find from "find";
import util from "node:util";

const readFile = util.promisify(fs.readFile);
const readDir = util.promisify(fs.readdir);

export interface DesktopEntry {
  Name?: string;
  Exec?: string;
  Icon?: string;
  Comment?: string;
  Type?: string;
  Path?: string;
  [key: string]: any;
}

let desktopEntries: DesktopEntry[] = [];

export async function indexItems() {
  const dirs = [
    "/usr/share/applications",
    "/usr/local/share/applications",
    path.join(process.env.HOME || "", "/.local/share/applications"),
  ];

  const desktopFiles: string[] = [];
  desktopEntries = [];

  for (const dir of dirs) {
    try {
      // THIS IS THE FIX: Check if the folder exists before reading it!
      if (!fs.existsSync(dir)) continue;

      const files = await readDir(dir);
      const desktopFilesInDir = files
        .filter((f) => f.includes(".desktop"))
        .map((f) => `${dir}/${f}`);

      desktopFiles.push(...desktopFilesInDir);
    } catch (e) {
      // Ignore permission errors
    }
  }

  for (const file of desktopFiles) {
    try {
      const data = await readFile(file);
      const content = data.toString();
      const desktopAreaMatch = content.match(
        /^\[Desktop Entry\](?:(?!^\[[^\]\r\n]+\]).)*/gms,
      );

      if (!desktopAreaMatch) continue;

      const properties = desktopAreaMatch[0]
        .split("\n")
        .filter((e) => e.includes("="));
      const entry: DesktopEntry = {};

      for (const prop of properties) {
        const match = prop.split("=");
        const key = match[0];
        const value = match.slice(1).join("="); // Safely handle '=' in paths
        entry[key] = value;
      }
      desktopEntries.push(entry);
    } catch (e) {
      // Ignore unreadable files
    }
  }
}

function findIcons(iconName: string, searchDir: string): string[] {
  if (!fs.existsSync(searchDir)) return [];
  const pixmaps = find.fileSync(searchDir);
  return pixmaps.filter((i) =>
    String(i).toLowerCase().includes(String(iconName).toLowerCase()),
  );
}

function rankIcons(iconName: string): string | undefined {
  if (!iconName) return undefined;

  const resultPixmaps = findIcons(iconName, "/usr/share/pixmaps");
  if (resultPixmaps.length !== 0) return resultPixmaps[0];

  const resultIcons = findIcons(iconName, "/usr/share/icons");
  if (resultIcons.length !== 0) {
    if (resultIcons.length === 1) return resultIcons[0];

    const resRegex = /\d{1,4}x\d{1,4}/;
    if (resultIcons.find((i) => i.match(resRegex))) {
      const filter = resultIcons
        .filter((i) => i.match(resRegex))
        .sort((a, b) => {
          const matchA = a.match(/(\d{1,4})x\d{1,4}/);
          const matchB = b.match(/(\d{1,4})x\d{1,4}/);
          return Number(matchB?.[1] || 0) - Number(matchA?.[1] || 0);
        });
      return filter[0];
    }
    return resultIcons[0];
  }
  return undefined;
}

function cleanItem(item: DesktopEntry): DesktopEntry {
  const outputItem: DesktopEntry = {};

  for (const key in item) {
    const value = item[key];
    if (key.includes("[") && key.includes("]")) {
      const match = key.match(/(.+)\[(.+)\]/);
      if (match) {
        const localeKey = `${match[1]}_locale`;
        if (!outputItem[localeKey]) outputItem[localeKey] = {};
        outputItem[localeKey][match[2]] = value;
      }
    } else if (typeof value === "string" && value.includes(";")) {
      outputItem[key] = value.split(";").filter((i) => i.length > 0);
    } else if (value === "true" || value === "false") {
      outputItem[key] = value === "true";
    } else if (key === "Icon") {
      outputItem[key] = rankIcons(value);
    } else {
      outputItem[key] = value;
    }
  }

  return outputItem;
}

export async function linuxGetInstalledApps() {
  await indexItems();
  const items = desktopEntries.map(cleanItem);

  const apps: any[] = [];
  for (const item of items) {
    if (item.Type !== "Application") continue;
    if (!item.Icon || !item.Name) continue;

    apps.push({
      appName: item.Name,
      appIdentifier: item.Exec ? item.Exec.split(" ")[0] : item.Name,
      appVersion: null,
      publisher: null,
      installLocation: item.Path || null,
      displayIcon: item.Icon,
      comments: item.Comment || null,
    });
  }
  return apps;
}
