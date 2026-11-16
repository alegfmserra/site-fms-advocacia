#!/usr/bin/env node
// Atualiza assets/js/videos.js com os vídeos do canal do Dr. Vitor Moreira Serra.
// Uso: node scripts/atualizar-videos.js
//
// Lê as páginas públicas do canal:
//  - aba Playlists → cada playlist é um episódio do Programa Saudações (tema, convidado, data) com seus cortes;
//  - aba Shorts    → cortes avulsos mais recentes.
// O que aparece no site e em qual tema é decidido em assets/js/curadoria.js (editado à mão).

const fs = require("fs");
const path = require("path");

const CANAL = "UC1i2CtfxY4VRL4IqHbAFFnQ";
const CANAL_PROGRAMA = "programasaudacoes"; // canal do Programa Saudações (episódios completos)
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130 Safari/537.36";
const CAB = { headers: { "User-Agent": UA, "Accept-Language": "pt-BR", Cookie: "CONSENT=YES+1" } };

async function html(url) {
  const r = await fetch(url, CAB);
  if (!r.ok) throw new Error(`${r.status} em ${url}`);
  return r.text();
}

function dadosIniciais(h) {
  const m = h.match(/var ytInitialData = (\{.*?\});<\/script>/s);
  return m ? JSON.parse(m[1]) : null;
}

function percorrer(o, f) {
  if (!o || typeof o !== "object") return;
  f(o);
  for (const k in o) percorrer(o[k], f);
}

/* "Tema | Dr. Fulano | SAUDAÇÕES (26/04/2026)" → { tema, convidado, data } */
function lerTituloEpisodio(bruto) {
  const partes = bruto.split("|").map((s) => s.trim()).filter(Boolean);
  let data = "";
  const d = bruto.match(/(\d{2})\/(\d{2})\/(\d{2,4})/);
  if (d) data = `${d[3].length === 2 ? "20" + d[3] : d[3]}-${d[2]}-${d[1]}`;
  const tema = partes[0].replace(/\s*\(\d{2}\/\d{2}\/\d{2,4}\)\s*/, "").replace(/\.$/, "").trim();
  const convidado = partes.slice(1).find((p) => !/sauda[çc][õo]es|\d{2}\/\d{2}/i.test(p)) || "";
  return { tema, convidado, data };
}

async function tituloDoVideo(id) {
  const r = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`);
  if (!r.ok) return null;
  return (await r.json()).title;
}

/* Títulos de corte vêm em CAIXA ALTA e com emojis: limpa para leitura. */
const SIGLAS = new Set(["PMMA", "CF/88", "PL", "MP", "GPTW", "MA", "OAB", "STF", "STJ", "SUS", "ANS", "IA", "TJMA", "PAD", "NR-01", "RGP"]);
function limparTitulo(t) {
  let s = t.replace(/#shorts?\b/gi, "").replace(/[\p{Extended_Pictographic}\u{FE0F}\u{200D}]/gu, "").replace(/\s+/g, " ").trim();
  // palavra inteira em maiúsculas (2+ letras) que não seja sigla → minúscula;
  // letra solta maiúscula (A, O, E, É) vizinha de palavra em caixa alta → minúscula
  const caixaAlta = (w) => w && /\p{Lu}{2,}/u.test(w) && w === w.toUpperCase() && !SIGLAS.has(w);
  const pal = s.split(" ");
  s = pal.map((w, i) => {
    const nu = w.replace(/[^\p{L}\d/-]/gu, "");
    if (SIGLAS.has(nu.toUpperCase())) return w.replace(nu, nu.toUpperCase());
    if (caixaAlta(nu)) return w.toLowerCase();
    if (/^\p{Lu}$/u.test(nu) && (caixaAlta(pal[i - 1]?.replace(/[^\p{L}]/gu, "")) || caixaAlta(pal[i + 1]?.replace(/[^\p{L}]/gu, "")))) return w.toLowerCase();
    return w;
  }).join(" ");
  // início de frase e nomes próprios recorrentes com inicial maiúscula
  s = s.replace(/(^|[.!?:]\s+|^["'“])(\p{Ll})/gu, (m, a, b) => a + b.toUpperCase());
  s = s.replace(/(?<![\p{L}])(brasil|maranhão|são luís|cocalzinho|simon sinek|justiça militar|polícia militar|stf)(?![\p{L}])/giu, (w) =>
    w === "stf" ? "STF" : w.replace(/(^|\s)(\p{L})/gu, (m, a, b) => a + b.toUpperCase()));
  return s.replace(/[.\s]+$/, "").replace(/\s+([?!])/g, "$1");
}

(async () => {
  // 1) Playlists = episódios
  const pl = dadosIniciais(await html(`https://www.youtube.com/channel/${CANAL}/playlists`));
  const listas = [];
  percorrer(pl, (o) => {
    const l = o.lockupViewModel;
    if (!l || !l.contentType || !/PLAYLIST|COURSE/.test(l.contentType)) return;
    let id = l.contentId;
    percorrer(l, (x) => { if (x.watchEndpoint?.playlistId) id = x.watchEndpoint.playlistId; });
    const titulo = l.metadata?.lockupMetadataViewModel?.title?.content;
    if (id && titulo && !listas.some((x) => x.id === id)) listas.push({ id, titulo });
  });

  const episodios = [];
  for (const lista of listas) {
    let ids = [];
    try {
      const h = await html(`https://www.youtube.com/playlist?list=${lista.id}`);
      ids = [...new Set([...h.matchAll(/"videoId":"([\w-]{11})"/g)].map((m) => m[1]))];
    } catch (e) { console.warn(`  (pulei ${lista.titulo}: ${e.message})`); continue; }
    const videos = [];
    for (const id of ids) {
      const t = await tituloDoVideo(id);
      if (t) videos.push({ id, titulo: limparTitulo(t) });
    }
    if (!videos.length) continue;
    episodios.push({ lista: lista.id, ...lerTituloEpisodio(lista.titulo), videos });
    console.log(`  ${lista.titulo} → ${videos.length} cortes`);
  }

  // 2) Shorts avulsos
  const sh = dadosIniciais(await html(`https://www.youtube.com/channel/${CANAL}/shorts`));
  const shorts = [];
  percorrer(sh, (o) => {
    const v = o.shortsLockupViewModel;
    if (!v) return;
    const id = v.onTap?.innertubeCommand?.reelWatchEndpoint?.videoId;
    const titulo = v.overlayMetadata?.primaryText?.content;
    if (id && titulo && !shorts.some((x) => x.id === id)) shorts.push({ id, titulo: limparTitulo(titulo) });
  });

  // 3) Episódios completos — canal do próprio programa (@programasaudacoes).
  // Só entram os episódios no formato "Tema | Convidado | SAUDAÇÕES (dd/mm/aaaa)", que são os de domingo
  // apresentados pelo Dr. João Vitor. A "Temporada Especial" (outros apresentadores) fica de fora.
  const pv = dadosIniciais(await html(`https://www.youtube.com/@${CANAL_PROGRAMA}/videos`));
  const completos = [];
  percorrer(pv, (o) => {
    const l = o.lockupViewModel;
    if (!l || l.contentType !== "LOCKUP_CONTENT_TYPE_VIDEO") return;
    const titulo = l.metadata?.lockupMetadataViewModel?.title?.content || "";
    if (!/\|\s*SAUDA[ÇC][ÕO]ES\s*\(\d{2}\/\d{2}\/\d{4}\)/i.test(titulo) || /temporada especial/i.test(titulo)) return;
    if (completos.some((x) => x.id === l.contentId)) return;
    const e = lerTituloEpisodio(titulo);
    completos.push({ id: l.contentId, titulo: e.tema, convidado: e.convidado, data: e.data });
  });

  const destino = path.join(__dirname, "..", "assets", "js", "videos.js");
  const hoje = new Date().toISOString().slice(0, 10);
  const js =
    `// Gerado por scripts/atualizar-videos.js em ${hoje}. Fontes: youtube.com/channel/${CANAL} e youtube.com/@${CANAL_PROGRAMA}\n` +
    `// NÃO editar à mão: o que aparece no site é decidido em assets/js/curadoria.js.\n` +
    `window.EPISODIOS = ${JSON.stringify(episodios, null, 2)};\n` +
    `window.SHORTS = ${JSON.stringify(shorts, null, 2)};\n` +
    `window.COMPLETOS = ${JSON.stringify(completos, null, 2)};\n`;
  fs.writeFileSync(destino, js, "utf8");
  console.log(`${episodios.length} episódios, ${shorts.length} shorts e ${completos.length} episódios completos gravados em ${destino}`);
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
