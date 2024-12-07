import { readFileSync } from "fs";
import { isMainThread, parentPort, Worker, workerData } from "worker_threads";
import { openCrate } from "../utils/openCrate";

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
  const found = new Map<string, number>();

  function run(amount: number, crate: string) {
    for (let i = 0; i < amount; i++) {
      openCrate(crate, found, items);
    }

    parentPort.postMessage(found);
    process.exit(0);
  }

  run(workerData[0], workerData[1]);
}
