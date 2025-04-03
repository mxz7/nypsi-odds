import { readFileSync } from "fs";
import { isMainThread, parentPort, Worker, workerData } from "worker_threads";
import { getDefaultLootPool, openCrate } from "../utils/loot_pools";

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
  const lootPools: { [key: string]: any } = JSON.parse(readFileSync("./loot_pools.json").toString());
  lootPools.basic_crate = getDefaultLootPool(i => i.in_crates, itemData);
  lootPools.basic_crate.money = { 50000: 100, 100000: 100, 500000: 100 };
  lootPools.basic_crate.xp = { 50: 100, 100: 100, 250: 100 };
  lootPools.workers_crate = getDefaultLootPool(i => i.role === "worker-upgrade", itemData);
  lootPools.boosters_crate = getDefaultLootPool(i => i.role === "booster", itemData);

  function run(crate: string, items: string[]) {
    let found = false;
    let opens = 0;

    const foundItems = new Map<string, number>();

    while (!found) {
      opens++;
      openCrate(crate, foundItems, itemData, lootPools);

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
