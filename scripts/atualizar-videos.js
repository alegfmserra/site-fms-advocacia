#!/usr/bin/env node
// Atualiza assets/js/videos.js com os vídeos do canal do Dr. Vitor Moreira Serra.
// Uso: node scripts/atualizar-videos.js
// Lê as páginas públicas do canal (Vídeos e Shorts), extrai id + título e classifica por tema.

const fs = require("fs");
const path = require("path");

const CANAL = "UC1i2CtfxY4VRL4IqHbAFFnQ";
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130 Safari/537.36";

const TEMAS = [
  { id: "apostas", re: /ludopatia|aposta|bet|superendivid/i },
  { id: "pesca", re: /defeso|pescador|pesca|rgp/i },
  { id: "carreiras", re: /concurso|delegado|policia|policial|prova|concurseiro|sonhos/i },
];

function tema(titulo) {
  const t = TEMAS.find((x) => x.re.test(titulo));
  return t ? t.id : "direito";
}

async function pagina(aba) {
  const r = await fetch(`https://www.youtube.com/channel/${CANAL}/${aba}`, {
    headers: { "User-Agent": UA, "Accept-Language": "pt-BR", Cookie: "CONSENT=YES+1" },
  });
  const html = await r.text();
  const m = html.match(/var ytInitialData = (\{.*?\});<\/script>/s);
  if (!m) throw new Error(`Não achei os dados da aba ${aba}`);
  return JSON.parse(m[1]);
}

function extrair(dados, lista) {
  (function walk(o) {
    if (!o || typeof o !== "object") return;
    if (o.videoRenderer) {
      const v = o.videoRenderer;
      lista.push({ id: v.videoId, titulo: v.title?.runs?.[0]?.text, formato: "video" });
    }
    if (o.shortsLockupViewModel) {
      const v = o.shortsLockupViewModel;
      lista.push({
        id: v.onTap?.innertubeCommand?.reelWatchEndpoint?.videoId,
        titulo: v.overlayMetadata?.primaryText?.content,
        formato: "short",
      });
    }
    for (const k in o) walk(o[k]);
  })(dados);
}

(async () => {
  const brutos = [];
  for (const aba of ["videos", "shorts"]) extrair(await pagina(aba), brutos);

  const vistos = new Set();
  const videos = [];
  for (const v of brutos) {
    if (!v.id || !v.titulo || vistos.has(v.id)) continue;
    vistos.add(v.id);
    const titulo = v.titulo.replace(/\s*#shorts?\b/gi, "").trim();
    videos.push({ id: v.id, titulo, tema: tema(titulo), formato: v.formato });
  }

  const destino = path.join(__dirname, "..", "assets", "js", "videos.js");
  const hoje = new Date().toISOString().slice(0, 10);
  const js =
    `// Gerado por scripts/atualizar-videos.js em ${hoje}. Fonte: youtube.com/channel/${CANAL}\n` +
    `// Para destacar outro vídeo no topo da seção "Na Mídia", troque DESTAQUE_ID.\n` +
    `window.DESTAQUE_ID = ${JSON.stringify(videos[0]?.id || "")};\n` +
    `window.VIDEOS = ${JSON.stringify(videos, null, 2)};\n`;
  fs.writeFileSync(destino, js, "utf8");
  console.log(`${videos.length} vídeos gravados em ${destino}`);
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
