// Local preview server for the phone app.
const http = require("http"), fs = require("fs"), path = require("path");
const root = path.join(__dirname, "..");
const types = {".html": "text/html; charset=utf-8", ".js": "text/javascript", ".png": "image/png", ".webmanifest": "application/manifest+json"};
http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]);
  if (p === "/") p = "/index.html";
  const f = path.join(root, p);
  if (!f.startsWith(root) || !fs.existsSync(f)) { res.writeHead(404); return res.end("not found"); }
  res.writeHead(200, {"content-type": types[path.extname(f)] || "application/octet-stream"});
  fs.createReadStream(f).pipe(res);
}).listen(8141, () => console.log("http://localhost:8138"));
