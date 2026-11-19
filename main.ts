// Entry program for make.fun competition news-image-20261118.
// Copies the pre-rendered front page (entry.png, built from src/poster.html
// with tools/render.mjs) into the grader's output directory, after checking
// it is a whole, in-limits PNG. Standard library only; no network.
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// CRC-32 (IEEE, polynomial 0xedb88320) implemented here rather than taken
// from node:zlib, so the program runs on any Node 22, not only 22.2+.
const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }
  return table;
})();
function crc32(buf: Buffer): number {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

const MAX_BYTES = 1048576;
const MAX_SIDE = 1024;
const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

const here = path.dirname(fileURLToPath(import.meta.url));
const source = path.join(here, "entry.png");
const outDir = process.env.MAKEFUN_OUTPUT_DIR || "/output";
const dest = path.join(outDir, "entry.png");

const buf = await fs.readFile(source).catch((err) => {
  throw new Error(`cannot read entry image ${source}: ${err.message}`);
});
if (buf.length > MAX_BYTES) {
  throw new Error(`entry.png is ${buf.length} bytes, over the 1048576 byte limit`);
}
if (!buf.subarray(0, 8).equals(PNG_MAGIC)) {
  throw new Error("entry.png does not start with the PNG magic bytes");
}
if (buf.length < 33 || buf.toString("ascii", 12, 16) !== "IHDR") {
  throw new Error("entry.png has no IHDR chunk where one belongs");
}
const width = buf.readUInt32BE(16);
const height = buf.readUInt32BE(20);
if (width > MAX_SIDE || height > MAX_SIDE) {
  throw new Error(`entry.png is ${width}x${height}, over the 1024x1024 limit`);
}
if (width === 0 || height === 0) {
  throw new Error("entry.png has a zero dimension");
}
// Walk every PNG chunk and check its CRC, so a truncated or corrupted file
// fails here instead of in front of the judge. The last chunk must be IEND.
let offset = 8;
let sawIEND = false;
while (offset + 8 <= buf.length) {
  const length = buf.readUInt32BE(offset);
  const type = buf.toString("ascii", offset + 4, offset + 8);
  const dataStart = offset + 8;
  const dataEnd = dataStart + length;
  if (dataEnd + 4 > buf.length) {
    throw new Error(`entry.png chunk ${type} overruns the file`);
  }
  const storedCrc = buf.readUInt32BE(dataEnd);
  const actualCrc = crc32(Buffer.concat([buf.subarray(offset + 4, offset + 8), buf.subarray(dataStart, dataEnd)]));
  if (storedCrc !== actualCrc) {
    throw new Error(`entry.png chunk ${type} fails its CRC check`);
  }
  offset = dataEnd + 4;
  if (type === "IEND") {
    sawIEND = true;
    break;
  }
}
if (!sawIEND) {
  throw new Error("entry.png has no IEND chunk: the file is incomplete");
}
if (offset !== buf.length) {
  throw new Error("entry.png has trailing bytes after IEND");
}

await fs.mkdir(outDir, { recursive: true });
await fs.writeFile(dest, buf);
console.log(`wrote ${dest} (${width}x${height}, ${buf.length} bytes)`);
