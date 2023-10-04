import { inPlaceSort } from "fast-sort";
import { readFileSync } from "fs";
import { isMainThread, parentPort, Worker, workerData } from "worker_threads";

const found = new Map<string, number>();

export default function hunt(amount: number, crate: string): Promise<string[]> {
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
  function run(amount: number, crate: string) {
    for (let i = 0; i < amount; i++) {
      openCrate(crate);
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

  const items: { [key: string]: any } = JSON.parse(readFileSync("./items.json").toString());

  function openCrate(gun: string) {
    const huntItems = Array.from(Object.keys(items));

    let times = 1;

    for (let i = 0; i < 15; i++) {
      huntItems.push("nothing");
    }

    const places = [
      "field",
      "forest",
      "african plains",
      "amazon rainforest",
      "field",
      "forest",
      "field",
      "forest",
      "field",
      "forest",
      "nether",
    ];

    const chosenPlace = places[Math.floor(Math.random() * places.length)];

    if (gun == "gun") {
      times = 2;
    } else if (gun == "incredible_gun") {
      times = 3;
    }

    for (let i = 0; i < times; i++) {
      const huntItemsModified = [];

      for (const i of huntItems) {
        if (items[i]) {
          if (items[i].role != "prey") continue;
          if (chosenPlace === "nether") {
            if (!["blaze", "wither_skeleton", "piglin", "ghast"].includes(i)) continue;
          } else {
            if (["blaze", "wither_skeleton", "piglin", "ghast"].includes(i)) continue;
          }
          if (items[i].rarity === 5) {
            const chance = Math.floor(Math.random() * 50);
            if (chance == 7 && gun == "incredible_gun") {
              for (let x = 0; x < Math.floor(Math.random() * 5); x++) {
                huntItemsModified.push(i);
              }
            }
          } else if (items[i].rarity == 4) {
            const chance = Math.floor(Math.random() * 15);
            if (chance == 4 && gun == "incredible_gun") {
              for (let x = 0; x < 4; x++) {
                huntItemsModified.push(i);
              }
            }
          } else if (items[i].rarity == 3) {
            const chance = Math.floor(Math.random() * 3);
            if (chance == 2 && gun != "terrible_gun") {
              for (let x = 0; x < 4; x++) {
                huntItemsModified.push(i);
              }
            }
          } else if (items[i].rarity == 2 && gun != "terrible_gun") {
            for (let x = 0; x < 7; x++) {
              huntItemsModified.push(i);
            }
          } else if (items[i].rarity == 1) {
            for (let x = 0; x < 15; x++) {
              huntItemsModified.push(i);
            }
          } else if (items[i].rarity == 0) {
            if (gun == "incredible_gun") {
              for (let x = 0; x < 7; x++) {
                huntItemsModified.push(i);
              }
            } else {
              for (let x = 0; x < 25; x++) {
                huntItemsModified.push(i);
              }
            }
          }
        }
      }
      const chosen = huntItemsModified[Math.floor(Math.random() * huntItemsModified.length)];

      if (found.has(chosen)) {
        found.set(chosen, found.get(chosen) + 1);
      } else {
        found.set(chosen, 1);
      }
    }

    return;
  }

  run(workerData[0], workerData[1]);
}
