// Draws the app icon (an air fryer with a blue display and blue basket handle, on near-black) as PNGs with no dependencies.
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const CRC = new Int32Array(256).map((_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c; });
const crc32 = buf => { let c = -1; for (const b of buf) c = CRC[(c ^ b) & 255] ^ (c >>> 8); return (c ^ -1) >>> 0; };
function chunk(type, data){
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}
const mix = (a, b, t) => a.map((x, i) => x + (b[i] - x) * t);
// Signed distance to a rounded rectangle (negative inside).
function rr(u, v, x0, y0, x1, y1, r){
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, hx = (x1 - x0) / 2 - r, hy = (y1 - y0) / 2 - r;
  const qx = Math.abs(u - cx) - hx, qy = Math.abs(v - cy) - hy;
  return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - r;
}
const BLUE = [0x3d, 0x8b, 0xff], LCD = [0x6c, 0xb6, 0xff];
function paint(u, v){
  let c = mix([0x10, 0x16, 0x22], [0x04, 0x05, 0x07], Math.min(1, Math.hypot(u - .5, v - .45) / .7));
  if (rr(u, v, .26, .17, .74, .85, .09) < 0) c = mix([0x23, 0x2c, 0x3c], [0x14, 0x19, 0x22], (v - .17) / .68);
  if (rr(u, v, .35, .24, .65, .35, .03) < 0) c = [0, 0, 0];
  if (rr(u, v, .40, .275, .60, .315, .01) < 0) c = LCD;
  const basket = rr(u, v, .31, .44, .69, .80, .05);
  if (basket < 0) c = basket > -.014 ? BLUE : [0x0a, 0x0d, 0x12];
  if (basket < -.014 && v > .5 && v < .74 && ((Math.floor(u * 40) + Math.floor(v * 40)) % 2 === 0)) c = mix(c, BLUE, .18);
  if (rr(u, v, .41, .585, .59, .635, .02) < 0) c = BLUE;
  return c;
}
function png(size){
  const SS = 4, raw = Buffer.alloc((size * 4 + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0;
    for (let x = 0; x < size; x++) {
      const acc = [0, 0, 0];
      for (let sy = 0; sy < SS; sy++) for (let sx = 0; sx < SS; sx++) {
        const c = paint((x + (sx + .5) / SS) / size, (y + (sy + .5) / SS) / size);
        for (let i = 0; i < 3; i++) acc[i] += c[i];
      }
      const o = y * (size * 4 + 1) + 1 + x * 4;
      for (let i = 0; i < 3; i++) raw[o + i] = Math.round(acc[i] / (SS * SS));
      raw[o + 3] = 255;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4); ihdr[8] = 8; ihdr[9] = 6;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", ihdr), chunk("IDAT", zlib.deflateSync(raw)), chunk("IEND", Buffer.alloc(0))]);
}
const out = path.join(__dirname, "..", "icons");
fs.mkdirSync(out, {recursive: true});
for (const [name, size] of [["apple-touch-icon.png", 180], ["icon-192.png", 192], ["icon-512.png", 512]]) {
  fs.writeFileSync(path.join(out, name), png(size));
  console.log("wrote", name);
}
