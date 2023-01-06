import { inPlaceSort } from "fast-sort";
import { readFileSync } from "fs";
import { isMainThread, parentPort, Worker, workerData } from "worker_threads";

const found = new Map<string, number>();

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

  function openCrate(itemId: string) {
    const crateItems: string[] = [];
    const item = items[itemId];

    if (item.items) {
      for (const itemFilter of item.items) {
        let filteredItems: string[];
        if (itemFilter.startsWith("id:")) {
          filteredItems = Object.keys(items).filter((i) => i === itemFilter.substring(3));
        } else if (itemFilter.startsWith("role:")) {
          filteredItems = Object.keys(items).filter((i) => items[i].role === itemFilter.substring(5));
        } else {
          crateItems.push(itemFilter);
          continue;
        }
        for (const i of filteredItems) {
          crateItems.push(i);
        }
      }
    } else {
      crateItems.push(...["money:50000", "money:100000", "xp:25", "xp:50"]);

      for (const i of Object.keys(items)) {
        if (!items[i].in_crates) continue;
        crateItems.push(i);
      }
    }

    const times = item.crate_runs || 1;

    for (let i = 0; i < times; i++) {
      const crateItemsModified = [];

      for (const i of crateItems) {
        if (items[i]) {
          if (
            item.id == "nypsi_crate" &&
            (["collectable", "sellable", "item", "car"].includes(items[i].role) || items[i].buy)
          ) {
            const chance = Math.floor(Math.random() * 7);

            if (chance != 2) continue;
          }

          if (items[i].rarity == 5) {
            const chance = Math.floor(Math.random() * 50);

            if (chance == 7) crateItemsModified.push(i);
          } else if (items[i].rarity == 4) {
            const chance = Math.floor(Math.random() * 15);
            if (chance == 4) {
              crateItemsModified.push(i);
            } else if (chance > 7 && item.id == "nypsi_crate") {
              for (let x = 0; x < 3; x++) {
                crateItemsModified.push(i);
              }
            }
          } else if (items[i].rarity == 3) {
            const chance = Math.floor(Math.random() * 3);
            if (chance == 2) {
              crateItemsModified.push(i);
            } else if (item.id == "nypsi_crate") {
              for (let x = 0; x < 3; x++) {
                crateItemsModified.push(i);
              }
            }
          } else if (items[i].rarity == 2) {
            if (item.id == "nypsi_crate") {
              for (let x = 0; x < 5; x++) {
                crateItemsModified.push(i);
              }
            }
            crateItemsModified.push(i);
          } else if (items[i].rarity == 1) {
            for (let x = 0; x < 2; x++) {
              if (items[i].role == "collectable" && item.id != "nypsi_crate") {
                const chance = Math.floor(Math.random() * 3);

                if (chance == 2) {
                  crateItemsModified.push(i);
                }
              } else {
                if (item.id == "nypsi_crate") {
                  const chance = Math.floor(Math.random() * 10);

                  if (chance < 7) {
                    crateItemsModified.push(i);
                  }
                } else {
                  crateItemsModified.push(i);
                }
              }
              crateItemsModified.push(i);
            }
          } else if (items[i].rarity == 0 && item.id != "nypsi_crate") {
            if (items[i].role == "collectable") {
              const chance = Math.floor(Math.random() * 3);

              if (chance == 2) {
                crateItemsModified.push(i);
              }
            } else {
              crateItemsModified.push(i);
            }
            crateItemsModified.push(i);
          }
        } else {
          if (item.id == "nypsi_crate") {
            for (let x = 0; x < 6; x++) {
              crateItemsModified.push("money:10000000");
              crateItemsModified.push("xp:750");
            }
          }
          for (let x = 0; x < 2; x++) {
            crateItemsModified.push(i);
            crateItemsModified.push(i);
          }
        }
      }

      const chosen = crateItemsModified[Math.floor(Math.random() * crateItemsModified.length)];

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
