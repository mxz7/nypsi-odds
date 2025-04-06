import { readFileSync } from "fs";
import { isMainThread, parentPort, Worker, workerData } from "worker_threads";
import { getDefaultLootPool, openCrate } from "../utils/loot_pools";

export default function crate(amount: number, crate: string): Promise<Map<string, number>> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(__filename, {
      workerData: [amount, crate],
    });
    worker.on("message", resolve);
    worker.on("error", reject);
    worker.on("exit", (code) => {
      if (code !== 0) reject(new Error(`Worker stopped with exit code ${code}`));
    });
  });
}

if (!isMainThread) {
  const items: { [key: string]: any } = JSON.parse(readFileSync("./items.json").toString());
  const lootPools: { [key: string]: any } = JSON.parse(readFileSync("./loot_pools.json").toString());
  lootPools.basic_crate = getDefaultLootPool(i => i.in_crates, items);
  lootPools.basic_crate.money = { 50000: 100, 100000: 100, 500000: 100 };
  lootPools.basic_crate.xp = { 50: 100, 100: 100, 250: 100 };
  lootPools.workers_crate = getDefaultLootPool(i => i.role === "worker-upgrade", items);
  lootPools.boosters_crate = getDefaultLootPool(i => i.role === "booster", items);

  const found = new Map<string, number>();

  async function run(amount: number, crate: string) {
    for (let i = 0; i < amount; i++) {
      await openCrate(crate, found, items, lootPools);
    }

    parentPort.postMessage(found);
    process.exit(0);
  }

  run(workerData[0], workerData[1]);
}
