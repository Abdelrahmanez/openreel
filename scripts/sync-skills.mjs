#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SRC = path.join(ROOT, ".claude", "skills");
const DST = path.join(ROOT, ".agents", "skills");

const checkOnly = process.argv.includes("--check");

function getSkillDirs(baseDir) {
  if (!fs.existsSync(baseDir)) return [];
  return fs
    .readdirSync(baseDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();
}

function listFilesRecursive(dir, base = dir) {
  let out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out = out.concat(listFilesRecursive(full, base));
    } else {
      out.push(path.relative(base, full));
    }
  }
  return out.sort();
}

function check() {
  const srcSkills = getSkillDirs(SRC);
  const dstSkills = getSkillDirs(DST);
  let ok = true;

  if (JSON.stringify(srcSkills) !== JSON.stringify(dstSkills)) {
    console.error("Skill list mismatch:", { srcSkills, dstSkills });
    ok = false;
  }

  for (const skill of srcSkills) {
    const a = path.join(SRC, skill);
    const b = path.join(DST, skill);
    if (!fs.existsSync(b)) {
      console.error(`Missing in .agents/skills: ${skill}`);
      ok = false;
      continue;
    }
    const filesA = listFilesRecursive(a);
    const filesB = listFilesRecursive(b);
    if (JSON.stringify(filesA) !== JSON.stringify(filesB)) {
      console.error(`File list differs in ${skill}`);
      ok = false;
      continue;
    }
    for (const rel of filesA) {
      const bufA = fs.readFileSync(path.join(a, rel));
      const bufB = fs.readFileSync(path.join(b, rel));
      if (!bufA.equals(bufB)) {
        console.error(`Content differs: ${skill}/${rel}`);
        ok = false;
      }
    }
  }

  console.log(ok ? "OK" : "NOT IN SYNC");
  return ok;
}

function sync() {
  fs.mkdirSync(DST, { recursive: true });
  const srcSkills = getSkillDirs(SRC);
  const existingDst = getSkillDirs(DST);

  for (const old of existingDst) {
    if (!srcSkills.includes(old)) {
      fs.rmSync(path.join(DST, old), { recursive: true, force: true });
    }
  }

  for (const skill of srcSkills) {
    const from = path.join(SRC, skill);
    const to = path.join(DST, skill);
    fs.rmSync(to, { recursive: true, force: true });
    fs.cpSync(from, to, { recursive: true });
    console.log(`synced ${skill}`);
  }
}

if (!checkOnly) {
  sync();
}
process.exit(check() ? 0 : 1);
