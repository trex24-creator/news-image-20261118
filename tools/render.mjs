// Render src/poster.html to entry.png (1024x1024) with Playwright + system Chromium.
// Usage: node tools/render.mjs [output-path]
// Defaults: entry.png next to the repository root (one level up from tools/).
import { createRequire } from "node:module";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const { chromium } = require("/opt/muse/assets/spaces/ts-runtime/dist/node_modules/playwright");

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outPath = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.join(root, "entry.png");
const htmlPath = path.join(root, "src", "poster.html");

import { createHash } from "node:crypto";

// This VM's Chromium refuses to start without the Hatch WebGL domain policy:
// pass the policy file and its sha256 as launch flags.
const POLICY_PATH = "/var/lib/hatch-browser/rootfs-base/usr/share/hatch/chromium/webgl-allowed-domains.txt";
const policy = await fs.readFile(POLICY_PATH);
const policySha = createHash("sha256").update(policy).digest("hex");

const browser = await chromium.launch({
  executablePath: "/opt/meta-chromium/chrome",
  args: [
    "--no-sandbox",
    "--disable-gpu",
    "--hide-scrollbars",
    "--force-device-scale-factor=1",
    `--hatch-webgl-allowed-domains-file=${POLICY_PATH}`,
    `--hatch-webgl-allowed-domains-sha256=${policySha}`,
  ],
});
try {
  const page = await browser.newPage({ viewport: { width: 1024, height: 1024 } });
  await page.goto("file://" + htmlPath, { waitUntil: "load" });
  await page.waitForTimeout(150);
  await page.screenshot({ path: outPath, type: "png" });
} finally {
  await browser.close();
}

const stat = await fs.stat(outPath);
const buf = await fs.readFile(outPath);
const pngMagic = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
if (!buf.subarray(0, 8).equals(pngMagic)) {
  throw new Error("rendered file is not a PNG: " + outPath);
}
const width = buf.readUInt32BE(16);
const height = buf.readUInt32BE(20);
console.log(`wrote ${outPath} (${width}x${height}, ${stat.size} bytes)`);
if (width !== 1024 || height !== 1024) {
  throw new Error(`unexpected dimensions ${width}x${height}, want 1024x1024`);
}
if (stat.size > 1048576) {
  throw new Error(`image too large: ${stat.size} bytes > 1048576`);
}
