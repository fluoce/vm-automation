import linuxDesktop from "linux-desktop";

export async function getInstalledApps() {
  await linuxDesktop.indexItems();
  const items = linuxDesktop.items; 
  const apps: any[] = [];
  for (const key of Object.keys(items)) {
    const item = items[key];
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