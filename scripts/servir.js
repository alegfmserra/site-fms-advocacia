#!/usr/bin/env node
// Servidor local mínimo para ver o site: node scripts/servir.js  →  http://localhost:4321
const http = require("http");
const fs = require("fs");
const path = require("path");

const RAIZ = path.join(__dirname, "..");
const PORTA = Number(process.env.PORT) || 4321;
const TIPOS = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".json": "application/json", ".ico": "image/x-icon",
};

http.createServer((req, res) => {
  let rel = decodeURIComponent(new URL(req.url, "http://x").pathname);
  if (rel.endsWith("/")) rel += "index.html";
  const arq = path.join(RAIZ, path.normalize(rel));
  if (!arq.startsWith(RAIZ)) { res.writeHead(403).end(); return; }
  fs.readFile(arq, (err, dados) => {
    if (err) { res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }).end("404"); return; }
    res.writeHead(200, { "Content-Type": TIPOS[path.extname(arq).toLowerCase()] || "application/octet-stream", "Cache-Control": "no-store" });
    res.end(dados);
  });
}).listen(PORTA, () => console.log(`Site em http://localhost:${PORTA}`));
