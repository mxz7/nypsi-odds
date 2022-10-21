import { mkdirSync, writeFileSync } from "fs";
import crates from "./benchmarks/crate";
import fish from "./benchmarks/fish";

const promises: any[] = [];

async function doCrate(crate: string) {
  let out = await crates(500_000, crate);

  try {
    mkdirSync("./out/");
  } catch {}

  writeFileSync(`./out/${crate}.txt`, out.join("\n"));
}

async function doFish(crate: string) {
  let out = await fish(500_000, crate);

  try {
    mkdirSync("./out/");
  } catch {}

  writeFileSync(`./out/${crate}.txt`, out.join("\n"));
}

promises.push(doCrate("basic_crate"));
promises.push(doCrate("nypsi_crate"));
promises.push(doFish("terrible_fishing_rod"));
promises.push(doFish("fishing_rod"));
promises.push(doFish("incredible_fishing_rod"));