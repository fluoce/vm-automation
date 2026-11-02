import {
  osScript,
  userScript,
  hardwareScript,
  networkScript,
  portScript,
  processScript,
  dockerScript,
  serviceScript,
  softwareScript,
} from "./script/index.ts";

async function vmScan() {
  console.log("ST");
  // await osScript();
  // await userScript();
  // await hardwareScript();
  // await networkScript();
  // await portScript();
  // await processScript();
  // await dockerScript();
  // await serviceScript();
  await softwareScript();
  console.log("End");
}

vmScan().then(() => console.log("VM scan done"));
