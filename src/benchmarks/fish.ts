import { inPlaceSort } from "fast-sort";
import { readFileSync } from "fs";
import { isMainThread, parentPort, Worker, workerData } from "worker_threads";
import percentChance from "../utils/percentChance";

const found = new Map<string, number>();

export default function fish(amount: number, crate: string): Promise<string[]> {
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

  function openCrate(fishingRod: string) {
    const fishItems = [
      "nothing",
      "nothing",
      "nothing",
      "nothing",
      "nothing",
      "nothing",
      "nothing",
      "nothing",
      "nothing",
      "nothing",
      "nothing",
      "nothing",
      "nothing",
      "nothing",
      "nothing",
      "nothing",
      "nothing",
      "nothing",
    ];

    for (const i of Array.from(Object.keys(items))) {
      if (items[i].role == "prey") continue;
      if (items[i].role == "tool") continue;
      if (items[i].role == "car") continue;
      if (items[i].role == "booster") continue;
      if (items[i].id == "crystal_heart") continue;
      if (items[i].role == "crate" && !percentChance(20)) continue;
      if (items[i].id.includes("gem") && !percentChance(0.77)) continue;

      if (
        [
          "cobblestone",
          "iron_ore",
          "gold_ore",
          "coal",
          "iron_ingot",
          "gold_ingot",
          "obsidian",
          "netherrack",
          "quartz",
          "ancient_debris",
          "netherite_scrap",
          "netherite_ingot",
        ].includes(items[i].id)
      )
        continue;
      fishItems.push(i);
    }

    let times = 1;

    for (let i = 0; i < times; i++) {
      const fishItemsModified = [];

      for (const i of fishItems) {
        if (items[i]) {
          if (items[i].rarity == 4) {
            const chance = Math.floor(Math.random() * 15);
            if (chance == 4 && fishingRod == "incredible_fishing_rod") {
              if (items[i].role == "fish") {
                for (let x = 0; x < 150; x++) {
                  fishItemsModified.push(i);
                }
              }
              fishItemsModified.push(i);
            }
          } else if (items[i].rarity == 3) {
            const chance = Math.floor(Math.random() * 3);
            if (chance == 2 && fishingRod != "terrible_fishing_rod") {
              if (items[i].role == "fish") {
                for (let x = 0; x < 180; x++) {
                  fishItemsModified.push(i);
                }
              }
              fishItemsModified.push(i);
            }
          } else if (items[i].rarity == 2 && fishingRod != "terrible_fishing_rod") {
            if (items[i].role == "fish") {
              for (let x = 0; x < 200; x++) {
                fishItemsModified.push(i);
              }
            } else if (items[i].role == "worker-upgrade") {
              const chance = Math.floor(Math.random() * 10);

              if (chance == 7) {
                fishItemsModified.push(i);
              }
            } else {
              fishItemsModified.push(i);
            }
          } else if (items[i].rarity == 1) {
            if (items[i].role == "fish") {
              for (let x = 0; x < 280; x++) {
                fishItemsModified.push(i);
              }
            } else if (items[i].role == "worker-upgrade") {
              const chance = Math.floor(Math.random() * 10);

              if (chance == 7) {
                for (let x = 0; x < 2; x++) {
                  fishItemsModified.push(i);
                }
              }
            } else {
              for (let x = 0; x < 2; x++) {
                fishItemsModified.push(i);
              }
            }
          } else if (items[i].rarity == 0 && fishingRod != "incredible_fishing_rod") {
            if (items[i].role == "fish") {
              for (let x = 0; x < 400; x++) {
                fishItemsModified.push(i);
              }
            } else {
              fishItemsModified.push(i);
            }
          }
        } else {
          fishItemsModified.push(i);
          fishItemsModified.push(i);
        }
      }

      const chosen = fishItemsModified[Math.floor(Math.random() * fishItemsModified.length)];

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
