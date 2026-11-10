// Builds the standalone Bakul Air Fryer phone app (index.html) from the Claude artifact page.
// Usage: node tools/build.js src/bakul.html
const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");
let src = fs.readFileSync(process.argv[2] || path.join(root, "src", "bakul.html"), "utf8");

src = src.replace('<meta name="claude:viewport-fit-sides" content="cover">\n', "");
const title = src.match(/<title>.*?<\/title>\n?/);
if (title) src = src.replace(title[0], "");

const cut = src.indexOf("</style>") + 8;
const headBits = src.slice(0, cut);
const bodyBits = src.slice(cut);

const html = `<!doctype html>
<html lang="ms">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>Bakul Air Fryer</title>
<meta name="theme-color" content="#040507">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Bakul">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" type="image/png" sizes="192x192" href="icons/icon-192.png">
<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">
<style>
:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}
html{-webkit-text-size-adjust:100%}
body{margin:0}
img{max-width:100%}
[hidden]{display:none!important}
</style>
${headBits}
</head>
<body>
${bodyBits}
<script>
if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(function(){});
if ("serviceWorker" in navigator) window.addEventListener("load", function(){ navigator.serviceWorker.register("sw.js").catch(function(){}); });
</script>
</body>
</html>
`;
fs.writeFileSync(path.join(root, "index.html"), html);
console.log("index.html written,", html.length, "bytes");
