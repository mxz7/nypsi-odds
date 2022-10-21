import { mkdirSync, writeFileSync } from "fs";
import crates from "./benchmarks/crate";
import fish from "./benchmarks/fish";
import hunt from "./benchmarks/hunt";
import mine from "./benchmarks/mine";

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

promises.push(doCrate("basic_crate"));
promises.push(doCrate("nypsi_crate"));
promises.push(doFish("terrible_fishing_rod"));
promises.push(doFish("fishing_rod"));
promises.push(doFish("incredible_fishing_rod"));
promises.push(doHunt("terrible_gun"));
promises.push(doHunt("gun"));
promises.push(doHunt("incredible_gun"));
promises.push(doMine("wooden_pickaxe"));
promises.push(doMine("iron_pickaxe"));
promises.push(doMine("diamond_pickaxe"));
