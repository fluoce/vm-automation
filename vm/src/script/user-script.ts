import { users } from "systeminformation";
import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { tryCatchUtil } from "../util/try-catch-util.ts";
import { pathConfig } from "../config/path-config.ts";

export async function userScript() {
  await tryCatchUtil(async () => {
    const [u] = await Promise.all([users()]);
    const userInfo = {
      user: u,
    };
    const userJosnFilePath = resolve(pathConfig.userPath);
    await writeFile(
      userJosnFilePath,
      JSON.stringify(userInfo, null, 2),
      "utf-8",
    );
  });
}
