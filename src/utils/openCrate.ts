import percentChance from "./percentChance";

export function openCrate(itemId: string, found: Map<string, number>, items: { [key: string]: any }) {
  const item = items[itemId];

  const crateItems: string[] = [];
  let mode: "normal" | "percent-based" = "normal";

  if (item.items) {
    for (const itemFilter of item.items) {
      let filteredItems: string[] = [];
      if (itemFilter.startsWith("id:")) {
        if (itemFilter.split(":")[2]) {
          mode = "percent-based";
          break;
        } else {
          filteredItems = Object.keys(items).filter((i) => i === itemFilter.substring(3));
        }
      } else if (itemFilter.startsWith("role:")) {
        filteredItems = Object.keys(items).filter((i) => items[i].role === itemFilter.substring(5));
      } else {
        crateItems.push(itemFilter);
        continue;
      }

      crateItems.push(...filteredItems);
    }
  } else {
    crateItems.push(...["money:50000", "money:100000", "xp:25", "xp:50"]);

    for (const i of Object.keys(items)) {
      if (!items[i].in_crates) continue;
      crateItems.push(i);
    }
  }

  const times = item.crate_runs || 1;

  if (mode === "normal") {
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

          if (items[i].rarity === 6) {
            const chance = Math.floor(Math.random() * 750);

            if (chance == 7) crateItemsModified.push(i);
          } else if (items[i].rarity == 5) {
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

      if (chosen.includes("money:") || chosen.includes("xp:")) {
        if (chosen.includes("money:")) {
          found.set("money", found.has("money") ? found.get("money") + 1 : 1);
        } else if (chosen.includes("xp:")) {
          found.set("xp", found.has("xp") ? found.get("xp") + 1 : 1);
        }
      } else {
        let amount = 1;

        if (chosen == "terrible_fishing_rod" || chosen == "terrible_gun" || chosen == "wooden_pickaxe") {
          amount = 5;
        } else if (chosen == "fishing_rod" || chosen == "gun" || chosen == "iron_pickaxe") {
          amount = 10;
        } else if (chosen == "incredible_fishing_rod" || chosen == "incredible_gun" || chosen == "diamond_pickaxe") {
          amount = 10;
        } else if (chosen == "gem_shard" && item.id === "gem_crate") {
          amount = Math.floor(Math.random() * 15) + 5;
        }

        found.set(chosen, found.has(chosen) ? found.get(chosen) + amount : amount);
      }
    }
  } else {
    for (let i = 0; i < times; i++) {
      crateItems.length = 0;

      for (const itemFilter of item.items) {
        if (parseFloat(itemFilter.split(":")[2])) {
          if (!percentChance(parseFloat(itemFilter.split(":")[2]))) {
            continue;
          }
        }

        let filteredItems: string[] = [];

        if (itemFilter.startsWith("id:")) {
          filteredItems = Object.keys(items).filter((i) => i === itemFilter.split(":")[1]);
        } else if (itemFilter.startsWith("role:")) {
          filteredItems = Object.keys(items).filter((i) => items[i].role === itemFilter.split(":")[1]);
        } else {
          crateItems.push(itemFilter);
          continue;
        }

        crateItems.push(...filteredItems);
      }

      const chosen = crateItems[Math.floor(Math.random() * crateItems.length)];

      if (chosen.includes("money:") || chosen.includes("xp:")) {
        if (chosen.includes("money:")) {
          found.set("money", found.has("money") ? found.get("money") + 1 : 1);
        } else if (chosen.includes("xp:")) {
          found.set("xp", found.has("xp") ? found.get("xp") + 1 : 1);
        }
      } else {
        let amount = 1;

        if (chosen == "terrible_fishing_rod" || chosen == "terrible_gun" || chosen == "wooden_pickaxe") {
          amount = 5;
        } else if (chosen == "fishing_rod" || chosen == "gun" || chosen == "iron_pickaxe") {
          amount = 10;
        } else if (chosen == "incredible_fishing_rod" || chosen == "incredible_gun" || chosen == "diamond_pickaxe") {
          amount = 10;
        } else if (chosen == "gem_shard" && item.id === "gem_crate") {
          amount = Math.floor(Math.random() * 15) + 5;
        }

        found.set(chosen, found.has(chosen) ? found.get(chosen) + amount : amount);
      }
    }
  }

  return found;
}
