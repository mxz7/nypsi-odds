export function getDefaultLootPool(predicate: (item: any) => boolean, items: { [key: string]: any }): any {
  let lootPool: any = {
    items: {}
  }
  const rarityToWeight = [1000, 400, 100, 100/3, 20/3, 2, 0.05]
  for(const i in items) {
    const item = items[i];
    if(predicate && !predicate(item)) { continue; }
    if(item.rarity > rarityToWeight.length) { continue; }

    let weight = rarityToWeight[item.rarity];
    if (item.rarity === 6 && item.role === "tag") {
      weight *= 0.01;
    }
    if(item.rarity in [0, 1] && ["collectable", "flower", "cat"].includes(item.role)) {
      weight *= 2/3;
    }

    lootPool.items[i] = weight;
  }
  return lootPool;
}

function describeLootPoolResult(result: any): string {
  if(Object.hasOwn(result, "money")) {
    return `money:${result.money}`
  }
  if(Object.hasOwn(result, "xp")) {
    return `xp:${result.xp}`
  }
  if(Object.hasOwn(result, "karma")) {
    return `karma:${result.karma}`
  }
  if(Object.hasOwn(result, "item")) {
    return `${result.item}`
  }
  return ""; // this shouldnt be reached
}

export async function rollLootPool(
  loot_pool: any,
  exclusionPredicate?: (itemId: string) => Promise<boolean> // only works on items
): Promise<any> {

  let excludedItems = [] as string[];
  if(exclusionPredicate) {
    const poolItems = Object.keys(loot_pool.items ?? {});
    const exclusionResults = await Promise.all(poolItems.map(exclusionPredicate));
    excludedItems = poolItems.filter((e, i) => exclusionResults[i]);
  }
  let randomValue = Math.random() * getTotalWeight(loot_pool, excludedItems);

  if(Object.hasOwn(loot_pool, "nothing")) {
    if(randomValue < loot_pool.nothing) {
      return {};
    }
    randomValue -= loot_pool.nothing;
  }
  if(Object.hasOwn(loot_pool, "money")) {
    for(const amount in loot_pool.money) {
      if(randomValue < loot_pool.money[amount]) {
        return { money: parseInt(amount) };
      }
      randomValue -= loot_pool.money[amount];
    }
  }
  if(Object.hasOwn(loot_pool, "xp")) {
    for(const amount in loot_pool.xp) {
      if(randomValue < loot_pool.xp[amount]) {
        return { xp: parseInt(amount) };
      }
      randomValue -= loot_pool.xp[amount];
    }
  }
  if(Object.hasOwn(loot_pool, "karma")) {
    for(const amount in loot_pool.karma) {
      if(randomValue < loot_pool.karma[amount]) {
        return { karma: parseInt(amount) };
      }
      randomValue -= loot_pool.karma[amount];
    }
  }
  if(Object.hasOwn(loot_pool, "items")) {
    for(const itemKey in loot_pool.items) {
      if(excludedItems.includes(itemKey)) { continue; }
      const itemLootData = loot_pool.items[itemKey];
      let itemWeight = getItemWeight(itemLootData);
      if(randomValue < itemWeight) {
        return { item: itemKey, count: getItemCount(itemLootData, itemKey) };
      }
      randomValue -= itemWeight;
  }
  }

  return {}; // this shouldnt be reached
}

function getTotalWeight(
  loot_pool: any,
  excludedItems: string[]
): number {
  let totalWeight = 0;

  if(Object.hasOwn(loot_pool, "nothing")) {
    totalWeight += loot_pool.nothing;
  }
  if(Object.hasOwn(loot_pool, "money")) {
    for(const amount in loot_pool.money) {
      totalWeight += loot_pool.money[amount];
    }
  }
  if(Object.hasOwn(loot_pool, "xp")) {
    for(const amount in loot_pool.xp) {
      totalWeight += loot_pool.xp[amount];
    }
  }
  if(Object.hasOwn(loot_pool, "karma")) {
    for(const amount in loot_pool.karma) {
      totalWeight += loot_pool.karma[amount];
    }
  }
  if(Object.hasOwn(loot_pool, "items")) {
    for(const item in loot_pool.items) {
      if(excludedItems.includes(item)) { continue; }
      totalWeight += getItemWeight(loot_pool.items[item]);
    }
  }
  return totalWeight;
}

function getItemWeight(data: any): number {
  if(typeof data === "number") { return data; }
  if(Object.hasOwn(data, "weight")) { return data.weight; }
  return 100; // default weight
}

function getItemCount(data: any, itemId: string): number {
  return 1;
}

export async function openCrate(
  itemId: string,
  found: Map<string, number>,
  items: { [key: string]: any },
  lootPools: { [key: string]: any }
): Promise<any[]> {

  const item = items[itemId];
  const crateItems: any[] = [];

  for(const poolName in item.loot_pools) {
    const pool = lootPools[poolName];
    for(let i = 0; i < item.loot_pools[poolName]; i++) {
      const result = await rollLootPool(pool);
      const resultName = describeLootPoolResult(result);
      found.set(resultName, found.has(resultName) ? found.get(resultName) + 1 : 1);
      crateItems.push(result);
    }
  }

  return crateItems;
}
