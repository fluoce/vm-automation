import {
  osScript,
  userScript,
  hardwareScript,
  networkScript,
  portScript,
  dockerScript,
  serviceScript,
} from "./script/index.ts";

async function vmScan() {
  await osScript();
  await userScript();
  await hardwareScript();
  await networkScript();
  await portScript();
  await dockerScript();
  await serviceScript();
}

vmScan().then(() => console.log("VM scan done"));
