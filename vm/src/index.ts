import { osScript, hardwareScript } from "./script/index.ts";

async function vmScan() {
  await osScript();
  await hardwareScript();
}

vmScan();
