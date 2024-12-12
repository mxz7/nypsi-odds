import { mkdirSync, writeFileSync } from "fs";
import { cpus } from "os";
import crates from "./benchmarks/crate";
import fish from "./benchmarks/fish";
import hunt from "./benchmarks/hunt";
import mine from "./benchmarks/mine";
import lookForCrateItems from "./benchmarks/timetoitems";
import { format, merge } from "./utils/format";

const promises: any[] = [];
const CPU_COUNT = cpus().length;

async function doCrate(crate: string) {
  console.log(`starting: ${crate}`);
  const start = performance.now();

  const promises: Promise<Map<string, number>>[] = [];

  for (let i = 0; i < CPU_COUNT; i++) {
    promises.push(crates(1_000_000, crate));
  }

  const found = await Promise.all(promises);
  console.log(`merging and formatting ${crate}...`);
  const out = format(merge(...found));
  const end = performance.now();

  try {
    mkdirSync("./out/");
  } catch {}

  writeFileSync(`./out/${crate}.txt`, out.join("\n"));
  console.log(`finished: ${crate} in ${Math.floor((end - start) / 1000)}s`);
}

async function doFish(crate: string) {
  console.log(`starting: ${crate}`);
  const start = performance.now();
  const promises: Promise<Map<string, number>>[] = [];

  for (let i = 0; i < CPU_COUNT; i++) {
    promises.push(fish(1_000_000, crate));
  }

  const found = await Promise.all(promises);
  console.log(`merging and formatting ${crate}...`);
  const out = format(merge(...found));
  const end = performance.now();

  try {
    mkdirSync("./out/");
  } catch {}

  writeFileSync(`./out/${crate}.txt`, out.join("\n"));
  console.log(`finished: ${crate} in ${Math.floor((end - start) / 1000)}s`);
}

async function doHunt(crate: string) {
  console.log(`starting: ${crate}`);
  const start = performance.now();
  const promises: Promise<Map<string, number>>[] = [];

  for (let i = 0; i < CPU_COUNT; i++) {
    promises.push(hunt(1_000_000, crate));
  }

  const found = await Promise.all(promises);
  console.log(`merging and formatting ${crate}...`);
  const out = format(merge(...found));
  const end = performance.now();

  try {
    mkdirSync("./out/");
  } catch {}

  writeFileSync(`./out/${crate}.txt`, out.join("\n"));
  console.log(`finished: ${crate} in ${Math.floor((end - start) / 1000)}s`);
}

async function doMine(crate: string) {
  console.log(`starting: ${crate}`);
  const start = performance.now();
  const promises: Promise<Map<string, number>>[] = [];

  for (let i = 0; i < CPU_COUNT; i++) {
    promises.push(mine(1_000_000, crate));
  }

  const found = await Promise.all(promises);
  console.log(`merging and formatting ${crate}...`);
  const out = format(merge(...found));
  const end = performance.now();

  try {
    mkdirSync("./out/");
  } catch {}

  writeFileSync(`./out/${crate}.txt`, out.join("\n"));
  console.log(`finished: ${crate} in ${Math.floor((end - start) / 1000)}s`);
}

async function findItemsInCrate(crate: string, items: string[]) {
  console.log(`looking for ${items.join(", ")} in ${crate}`);
  const started = Date.now();

  const interval = setInterval(() => {
    console.log(`still looking for ${items.join(", ")} in ${crate}... (${((Date.now() - started) / 1000).toFixed(1)}s)`);
  }, 30000);

  const res = await Promise.race([
    lookForCrateItems(crate, items),
    lookForCrateItems(crate, items),
    lookForCrateItems(crate, items),
    lookForCrateItems(crate, items),
    lookForCrateItems(crate, items),
    lookForCrateItems(crate, items),
    lookForCrateItems(crate, items),
  ]);

  clearInterval(interval);

  console.log(`found ${items.join(", ")} in ${crate} in ${res} crates (${((Date.now() - started) / 1000).toFixed(1)}s)`);
}

// findItemsInCrate("nypsi_crate", ["goat_tag", "cat_tag"]);
// findItemsInCrate("basic_crate", ["cat_tag", "goat_tag"]);

promises.push(doCrate("basic_crate"));
promises.push(doCrate("nypsi_crate"));
promises.push(doCrate("omega_crate"));
// promises.push(doCrate("mineshaft_chest"));
// promises.push(doCrate("workers_crate"));
// promises.push(doCrate("boosters_crate"));
// promises.push(doCrate("gem_crate"));
promises.push(doFish("terrible_fishing_rod"));
promises.push(doFish("fishing_rod"));
promises.push(doFish("incredible_fishing_rod"));
// promises.push(doHunt("terrible_gun"));
// promises.push(doHunt("gun"));
// promises.push(doHunt("incredible_gun"));
promises.push(doMine("wooden_pickaxe"));
promises.push(doMine("iron_pickaxe"));
promises.push(doMine("diamond_pickaxe"));
