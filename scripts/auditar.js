#!/usr/bin/env node
// Auditoria de vazamento: varre os arquivos que vão para o GitHub Pages procurando segredos e dados pessoais.
// Uso: node scripts/auditar.js   (sai com código 1 se achar algo para revisar)
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const RAIZ = path.join(__dirname, "..");
const arquivos = execSync("git ls-files", { cwd: RAIZ, encoding: "utf8" }).split(/\r?\n/).filter((f) => /\.(html|js|css|json|xml|txt|md|svg)$/i.test(f));
const PADROES = [
  [/\b(sk|pk|ghp|gho|github_pat|AKIA|AIza|xox[abp])[-_][A-Za-z0-9_-]{8,}/g, "token/chave de API"],
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----/g, "chave privada"],
  [/\b(api[_-]?key|secret|senha|password|token)\s*[:=]\s*["'][^"']{6,}["']/gi, "credencial em texto"],
  [/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, "e-mail"],
  [/\(?\b\d{2}\)?\s?9?\d{4}[-\s]?\d{4}\b/g, "telefone"],
  [/\b55\d{10,11}\b/g, "telefone com DDI"],
  [/C:\\Users\\|\/Users\/|\/home\/[a-z]+/gi, "caminho local"],
  [/wa\.me\/\d+/g, "link de WhatsApp fixo"],
];
// permitidos: exemplos genéricos, os dados fictícios dos mockups (listados como proibidos no CLAUDE.md) e o CEP
const PERMITIDOS = [/^contato@moreiraserraadv.com.br$/, /exemplo\.com/, /fms\.adv\.br/, /99123-4567/, /noreply@anthropic\.com/, /schema\.org/, /w3\.org/, /65070-835/, /\b0{4,}/];
let achados = 0;
for (const f of arquivos) {
  const txt = fs.readFileSync(path.join(RAIZ, f), "utf8");
  for (const [re, nome] of PADROES) {
    for (const m of txt.matchAll(re)) {
      if (PERMITIDOS.some((p) => p.test(m[0]))) continue;
      const linha = txt.slice(0, m.index).split("\n").length;
      console.log(`${f}:${linha}  ${nome}: ${m[0]}`);
      achados++;
    }
  }
}
console.log(achados ? `\n${achados} ocorrência(s) para revisar.` : "Nenhum segredo, e-mail ou telefone encontrado nos arquivos publicados.");
process.exit(achados ? 1 : 0);
