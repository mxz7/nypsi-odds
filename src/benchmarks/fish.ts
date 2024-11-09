import { readFileSync } from "fs";
import { isMainThread, parentPort, Worker, workerData } from "worker_threads";
import percentChance from "../utils/percentChance";

export default function fish(amount: number, crate: string): Promise<Map<string, number>> {
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
  const found = new Map<string, number>();
  function run(amount: number, crate: string) {
    for (let i = 0; i < amount; i++) {
      openCrate(crate);
    }

    parentPort.postMessage(found);
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
      if (["booster", "car", "tool", "prey", "sellable", "ore"].includes(items[i].role)) continue;
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

      if (items[i].role === "fish") fishItems.push(i);
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
