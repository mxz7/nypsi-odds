export function openCrate(itemId: string, found: Map<string, number>, items: { [key: string]: any }) {
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

        if (items[i].rarity === 6) {
          const chance = Math.floor(Math.random() * 500);

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

    if (found.has(chosen)) {
      found.set(chosen, found.get(chosen) + 1);
    } else {
      found.set(chosen, 1);
    }
  }

  return found;
}
