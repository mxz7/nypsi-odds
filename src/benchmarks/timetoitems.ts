import { readFileSync } from "fs";
import { isMainThread, parentPort, Worker, workerData } from "worker_threads";
import { openCrate } from "../utils/openCrate";

export default function lookForCrateItems(crate: string, items: string[]): Promise<number> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(__filename, {
      workerData: [crate, items],
    });
    worker.on("message", resolve);
    worker.on("error", reject);
    worker.on("exit", (code) => {
      if (code !== 0) reject(new Error(`Worker stopped with exit code ${code}`));
    });
  });
}

if (!isMainThread) {
  const itemData: { [key: string]: any } = JSON.parse(readFileSync("./items.json").toString());

  function run(crate: string, items: string[]) {
    let found = false;
    let opens = 0;

    const foundItems = new Map<string, number>();

    while (!found) {
      opens++;
      openCrate(crate, foundItems, itemData);

      let successfullChecks = 0;

      for (const itemId of items) {
        if (Array.from(foundItems.keys()).includes(itemId)) successfullChecks++;
      }

      if (successfullChecks === items.length) break;
    }

    parentPort?.postMessage(opens);
    process.exit(0);
  }

  run(workerData[0], workerData[1]);
}
