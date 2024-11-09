import { inPlaceSort } from "fast-sort";

export function merge(...found: Map<string, number>[]) {
  const out = new Map<string, number>();

  for (const map of found) {
    for (const [item, amount] of map.entries()) {
      out.set(item, (out.get(item) || 0) + amount);
    }
  }

  return out;
}

export function format(found: Map<string, number>) {
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

  return out;
}
