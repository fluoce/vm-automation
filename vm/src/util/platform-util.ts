import type { PlatformType } from "../types/platform-types.js";

export function platformUtil(): PlatformType {
  switch (process.platform) {
    case "win32":
      return "windows";
    case "linux":
      return "linux";
    default:
      throw new Error(`Unsupported platform: ${process.platform}`);
  }
}

export const isPlatformWindows = (): boolean => platformUtil() === "windows";

export const isPlatformLinux = (): boolean => platformUtil() === "linux";
