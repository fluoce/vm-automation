// linux-desktop.d.ts
declare module "linux-desktop" {
  interface DesktopItem {
    Type?: string;
    Name?: string;
    Exec?: string;
    Icon?: string;
    Path?: string;
    Comment?: string;
    [key: string]: any; // Allows any other random fields the parser finds
  }

  interface LinuxDesktop {
    indexItems(): Promise<void>;
    items: Record<string, DesktopItem>;
    [key: string]: any;
  }

  const linuxDesktop: LinuxDesktop;
  export default linuxDesktop;
}
