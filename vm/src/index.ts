import {
  osScript,
  userScript,
  hardwareScript,
  networkScript,
  portScript,
} from "./script/index.ts";

async function vmScan() {
  // await osScript();
  await userScript();
  await hardwareScript();
  // await networkScript();
  // await portScript();
}

vmScan().then(() => console.log("VM scan done"));
