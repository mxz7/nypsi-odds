import { mkdirSync, writeFileSync } from "fs";
import crates from "./benchmarks/crate";
import fish from "./benchmarks/fish";
import hunt from "./benchmarks/hunt";
import mine from "./benchmarks/mine";
import lookForCrateItems from "./benchmarks/timetoitems";

const promises: any[] = [];

async function doCrate(crate: string) {
  console.log(`starting: ${crate}`);
  let out = await crates(500_000, crate);

  try {
    mkdirSync("./out/");
  } catch {}

  writeFileSync(`./out/${crate}.txt`, out.join("\n"));
  console.log(`finished: ${crate}`);
}

async function doFish(crate: string) {
  console.log(`starting: ${crate}`);
  let out = await fish(500_000, crate);

  try {
    mkdirSync("./out/");
  } catch {}

  writeFileSync(`./out/${crate}.txt`, out.join("\n"));
  console.log(`finished: ${crate}`);
}

async function doHunt(crate: string) {
  console.log(`starting: ${crate}`);
  let out = await hunt(500_000, crate);

  try {
    mkdirSync("./out/");
  } catch {}

  writeFileSync(`./out/${crate}.txt`, out.join("\n"));
  console.log(`finished: ${crate}`);
}

async function doMine(crate: string) {
  console.log(`starting: ${crate}`);
  let out = await mine(500_000, crate);

  try {
    mkdirSync("./out/");
  } catch {}

  writeFileSync(`./out/${crate}.txt`, out.join("\n"));
  console.log(`finished: ${crate}`);
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
// findItemsInCrate("basic_crate", ["grandma", "cursor"]);

promises.push(doCrate("vote_crate"));
promises.push(doCrate("basic_crate"));
promises.push(doCrate("nypsi_crate"));
promises.push(doCrate("omega_crate"));
promises.push(doCrate("mineshaft_chest"));
promises.push(doCrate("workers_crate"));
promises.push(doCrate("boosters_crate"));
promises.push(doCrate("gem_crate"));
promises.push(doFish("terrible_fishing_rod"));
promises.push(doFish("fishing_rod"));
promises.push(doFish("incredible_fishing_rod"));
promises.push(doHunt("terrible_gun"));
promises.push(doHunt("gun"));
promises.push(doHunt("incredible_gun"));
promises.push(doMine("wooden_pickaxe"));
promises.push(doMine("iron_pickaxe"));
promises.push(doMine("diamond_pickaxe"));
