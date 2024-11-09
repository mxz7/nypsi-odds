import { readFileSync } from "fs";
import { isMainThread, parentPort, Worker, workerData } from "worker_threads";

export default function mine(amount: number, crate: string): Promise<Map<string, number>> {
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

  function openCrate(pickaxe: string) {
    const mineItems = Array.from(Object.keys(items));

    const areas = [
      "cave",
      "mineshaft",
      "strip mine",
      "1x1 hole you dug",
      "staircase to bedrock",
      "nether",
      "nether",
      "nether",
      "end",
    ];

    const chosenArea = areas[Math.floor(Math.random() * areas.length)];

    let times = 1;

    for (let i = 0; i < 20; i++) {
      mineItems.push("nothing");
    }

    if (pickaxe == "iron_pickaxe") {
      times = 2;
    } else if (pickaxe == "diamond_pickaxe") {
      times = 3;
    }

    for (let i = 0; i < times; i++) {
      const mineItemsModified = [];

      for (const i of mineItems) {
        if (items[i]) {
          if (chosenArea == "nether") {
            if (!["netherrack", "ancient_debris", "quartz", "gold_nugget"].includes(items[i].id)) continue;
          } else if (chosenArea === "end") {
            if (!["end_stone", "purpur", "obsidian", "dragon_egg"].includes(items[i].id)) continue;
          } else {
            if (
              ![
                "cobblestone",
                "coal",
                "diamond",
                "amethyst",
                "emerald",
                "iron_ore",
                "gold_ore",
                "obsidian",
                "mineshaft_chest",
              ].includes(items[i].id)
            )
              continue;

            if (items[i].id == "mineshaft_chest" && chosenArea != "mineshaft") continue;
          }

          if (items[i].id == "ancient_debris") {
            if (pickaxe != "diamond_pickaxe") continue;

            const chance = Math.floor(Math.random() * 5);

            if (chance >= 2) continue;
          }

          if (items[i].rarity == 4) {
            const chance = Math.floor(Math.random() * 3);
            if (chance == 1 && pickaxe == "diamond_pickaxe") {
              for (let x = 0; x < 10; x++) {
                mineItemsModified.push(i);
              }
            }
          } else if (items[i].rarity == 3) {
            if (pickaxe == "wooden_pickaxe" && items[i].id != "mineshaft_chest") continue;

            if (items[i].id == "mineshaft_chest") {
              for (let x = 0; x < 3; x++) {
                mineItemsModified.push(i);
              }
            } else {
              for (let x = 0; x < 10; x++) {
                mineItemsModified.push(i);
              }
            }
          } else if (items[i].rarity == 2 && pickaxe != "wooden_pickaxe") {
            for (let x = 0; x < 15; x++) {
              mineItemsModified.push(i);
            }
          } else if (items[i].rarity == 1 && pickaxe != "wooden_pickaxe") {
            for (let x = 0; x < 20; x++) {
              mineItemsModified.push(i);
            }
          } else if (items[i].rarity == 0) {
            if (pickaxe == "diamond_pickaxe" && chosenArea != "nether") {
              for (let x = 0; x < 7; x++) {
                mineItemsModified.push(i);
              }
            } else {
              for (let x = 0; x < 50; x++) {
                mineItemsModified.push(i);
              }
            }
          }
        }
      }

      const chosen = mineItemsModified[Math.floor(Math.random() * mineItemsModified.length)];

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
