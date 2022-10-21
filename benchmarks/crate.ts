import { inPlaceSort } from "fast-sort";

const found = new Map<string, number>();


export default function crates(amount: number, crate: string) {
  for (let i = 0; i < amount; i++) {
    openCrate(crate);
  }

  console.log(`${amount.toLocaleString()} crates opened`);
  
  let total = 0;
  const itemNames: string[] = []
  const percentages = new Map<string, number>();

  for (const [item, amount] of found.entries()) {
    total += amount;
    itemNames.push(item)
  }

  for (const itemId of itemNames) {
    // @ts-expect-error stupid
    percentages.set(itemId, found.get(itemId) / total * 100)
  }

  inPlaceSort(itemNames).desc(i => percentages.get(i))

  for (const itemId of itemNames) {
    console.log(`${itemId}: ${percentages.get(itemId)?.toFixed(3)}%`)
  }
}

const items = await import("../items.json")


export function openCrate(item: string) {
  const crateItems = ["money:50000", "money:100000", "xp:25", "xp:50"];

  for (const i of Array.from(Object.keys(items))) {
    if (
      items[i].role == "fish" ||
      items[i].role == "prey" ||
      items[i].id == "gold_ore" ||
      items[i].id == "iron_ore" ||
      items[i].id == "cobblestone"
    )
      continue;
    crateItems.push(i);
  }

  let times = 1;

  for (let i = 0; i < times; i++) {
    const crateItemsModified: string[] = [];

    for (const i of crateItems) {
      if (items[i]) {
        if (items[item].id == "nypsi_crate" && ["collectable", "sellable", "item", "car"].includes(items[i].role)) {
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
          } else if (chance > 7 && items[item].id == "nypsi_crate") {
            for (let x = 0; x < 3; x++) {
              crateItemsModified.push(i);
            }
          }
        } else if (items[i].rarity == 3) {
          const chance = Math.floor(Math.random() * 3);
          if (chance == 2) {
            crateItemsModified.push(i);
          } else if (items[item].id == "nypsi_crate") {
            for (let x = 0; x < 3; x++) {
              crateItemsModified.push(i);
            }
          }
        } else if (items[i].rarity == 2) {
          if (items[item].id == "nypsi_crate") {
            for (let x = 0; x < 5; x++) {
              crateItemsModified.push(i);
            }
          }
          crateItemsModified.push(i);
        } else if (items[i].rarity == 1) {
          for (let x = 0; x < 2; x++) {
            if (items[i].role == "collectable" && items[item].id != "nypsi_crate") {
              const chance = Math.floor(Math.random() * 3);

              if (chance == 2) {
                crateItemsModified.push(i);
              }
            } else {
              if (items[item].id == "nypsi_crate") {
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
        } else if (items[i].rarity == 0 && items[item].id != "nypsi_crate") {
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
        if (items[item].id == "nypsi_crate") {
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
      //@ts-expect-error stupid??
      found.set(chosen, found.get(chosen) + 1)
    } else {
      found.set(chosen, 1)
    }
  }

  return;
}