#!/usr/bin/env node
import { execSync } from "node:child_process";

const sh = (cmd) => execSync(cmd, { encoding: "utf8" }).trim();

function repoSlug() {
  const url = sh("git remote get-url origin");
  const m = url.match(/[:/]([^/:]+)\/([^/]+?)(?:\.git)?$/);
  if (!m) throw new Error(`Cannot parse owner/repo from: ${url}`);
  return `${m[1]}/${m[2]}`;
}

const sev = { critical: "CRIT", high: "HIGH", medium: "MED ", low: "LOW " };

function alerts() {
  const slug = repoSlug();
  const raw = sh(
    `gh api -X GET "/repos/${slug}/dependabot/alerts" -f state=open --paginate`
  );
  const list = JSON.parse(raw);
  if (!list.length) {
    console.log("No open Dependabot alerts.");
    return;
  }
  console.log(`Open Dependabot alerts for ${slug}: ${list.length}\n`);
  for (const a of list) {
    const s = a.security_advisory ?? {};
    const v = a.security_vulnerability ?? {};
    const pkg = v.package?.name ?? "?";
    const fix = v.first_patched_version?.identifier ?? "no fix";
    const range = v.vulnerable_version_range ?? "?";
    const tag = sev[s.severity] ?? s.severity ?? "?";
    console.log(`[${tag}] ${pkg}  ${range} → ${fix}`);
    console.log(`        ${s.summary ?? ""}`);
    console.log(`        ${a.html_url}\n`);
  }
}

function prs() {
  const out = sh(
    `gh pr list --author "app/dependabot" --state open --json number,title,mergeable,mergeStateStatus,headRefName`
  );
  const list = JSON.parse(out);
  if (!list.length) {
    console.log("No open Dependabot PRs.");
    return;
  }
  for (const p of list) {
    console.log(`#${p.number}  ${p.title}`);
    console.log(`        branch: ${p.headRefName}`);
    console.log(`        mergeable: ${p.mergeable} (${p.mergeStateStatus})\n`);
  }
}

function audit() {
  try {
    const out = execSync("pnpm audit --json", { encoding: "utf8" });
    const data = JSON.parse(out);
    const advs = Object.values(data.advisories ?? {});
    if (!advs.length) {
      console.log("pnpm audit: no vulnerabilities.");
      return;
    }
    for (const a of advs) {
      console.log(`[${a.severity?.toUpperCase()}] ${a.module_name}  ${a.vulnerable_versions} → ${a.patched_versions}`);
      console.log(`        ${a.title}`);
      console.log(`        ${a.url}\n`);
    }
  } catch (e) {
    // pnpm audit exits non-zero when vulns are found; surface stdout
    if (e.stdout) process.stdout.write(e.stdout);
    else throw e;
  }
}

const cmd = process.argv[2];
const cmds = { alerts, prs, audit };
if (!cmds[cmd]) {
  console.error("usage: node scripts/dependabot.mjs <alerts|prs|audit>");
  process.exit(1);
}
cmds[cmd]();
