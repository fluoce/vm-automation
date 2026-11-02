declare module "file-icon-extractor" {
  export function extract(
    filePath: string,
    destinationPath: string,
    format?: string,
  ): Promise<void>;
}
