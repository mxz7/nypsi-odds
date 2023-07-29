import { inPlaceSort } from "fast-sort";
import { readFileSync } from "fs";
import { openCrate } from "../utils/openCrate";
import { isMainThread, parentPort, Worker, workerData } from "worker_threads";

export default function crate(amount: number, crate: string): Promise<string[]> {
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
  const found = new Map<string, number>();

  function run(amount: number, crate: string) {
    for (let i = 0; i < amount; i++) {
      openCrate(crate, found, items);
    }

    let total = 0;
    const itemNames: string[] = [];
    const percentages = new Map<string, number>();

    for (const [item, amount] of found.entries()) {
      total += amount;
      itemNames.push(item);
    }

    for (const itemId of itemNames) {
      percentages.set(itemId, (found.get(itemId) / total) * 100);
    }

    inPlaceSort(itemNames).desc((i) => percentages.get(i));

    const out: string[] = [];

    for (const itemId of itemNames) {
      const str = `${itemId}: ${percentages.get(itemId)?.toFixed(3)}% (${found.get(itemId)?.toLocaleString()} found)`;
      out.push(str);
    }

    parentPort?.postMessage(out);
    process.exit(0);
  }

  run(workerData[0], workerData[1]);
}
