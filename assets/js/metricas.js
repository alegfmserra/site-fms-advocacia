// Métricas do site — EDITADO À MÃO (só a configuração abaixo). Google Analytics 4 com consentimento (LGPD).
//
// ga4: ID de medida da propriedade (formato G-XXXXXXXXXX). Vazio = nada é carregado e o aviso de cookies não aparece.
// Nada de terceiros entra na página antes de o visitante aceitar; sem aceite, o site funciona igual e não mede nada.
window.METRICAS = {
  ga4: "G-7G47KRE2DB",
};

(() => {
  "use strict";
  const ID = (window.METRICAS && window.METRICAS.ga4 || "").trim();
  if (!/^G-[A-Z0-9]{6,}$/.test(ID)) return;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const CHAVE = "fms-consentimento";
  const ler = () => { try { return localStorage.getItem(CHAVE); } catch (e) { return null; } };
  const gravar = (v) => { try { localStorage.setItem(CHAVE, v); } catch (e) {} };

  /* ---------- Carregamento do GA4 (só depois do aceite) ---------- */
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;
  let ligado = false;
  function ligar() {
    if (ligado) return;
    ligado = true;
    gtag("consent", "default", { ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied", analytics_storage: "granted" });
    gtag("js", new Date());
    gtag("config", ID, { anonymize_ip: true, send_page_view: true });
    const s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(ID);
    document.head.append(s);
  }
  const ev = (nome, dados) => { if (ligado) gtag("event", nome, dados || {}); };

  /* ---------- Aviso de cookies ---------- */
  function aviso() {
    if ($(".cookies")) return;
    const box = document.createElement("div");
    box.className = "cookies";
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-label", "Aviso sobre cookies");
    box.innerHTML =
      '<p>Usamos o Google Analytics, só com o seu aceite, para saber quais páginas e botões ajudam quem chega aqui. Nenhum dado do formulário fica guardado no site. <a href="privacidade.html">Política de privacidade</a></p>' +
      '<div class="cookies__acoes"><button type="button" class="btn btn--peq btn--contorno" data-cookies="nao">Recusar</button><button type="button" class="btn btn--peq btn--latao" data-cookies="sim">Aceitar</button></div>';
    document.body.append(box);
    requestAnimationFrame(() => box.classList.add("cookies--visivel"));
    box.addEventListener("click", (e) => {
      const b = e.target.closest("[data-cookies]");
      if (!b) return;
      gravar(b.dataset.cookies);
      box.classList.remove("cookies--visivel");
      setTimeout(() => box.remove(), 400);
      if (b.dataset.cookies === "sim") ligar();
    });
  }
  const escolha = ler();
  if (escolha === "sim") ligar();
  else if (escolha !== "nao") aviso();
  $$("[data-cookies-reabrir]").forEach((a) => a.addEventListener("click", (e) => { e.preventDefault(); aviso(); }));

  /* ---------- Eventos ---------- */
  const secaoDe = (el) => { const s = el.closest("section[id], footer, header"); return s ? (s.id || s.tagName.toLowerCase()) : "pagina"; };
  const texto = (el) => (el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 80);

  document.addEventListener("click", (e) => {
    const a = e.target.closest("a, button, summary");
    if (!a) return;
    const secao = secaoDe(a);
    const href = a.getAttribute("href") || "";
    if (a.matches("[data-whats]") || /wa\.me|whatsapp/.test(href)) { ev("clique_whatsapp", { secao, rotulo: texto(a) }); ev("generate_lead", { canal: "whatsapp", secao }); return; }
    if (href.startsWith("mailto:")) { ev("clique_email", { secao, rotulo: texto(a) }); ev("generate_lead", { canal: "email", secao }); return; }
    if (href.startsWith("tel:")) { ev("clique_telefone", { secao }); ev("generate_lead", { canal: "telefone", secao }); return; }
    if (a.matches(".atalhos a")) { ev("atalho_capa", { atalho: a.dataset.caso || texto(a) }); return; }
    if (a.matches(".caso__aba")) { ev("triagem_area", { area: texto(a).split(/\d/)[0].trim() }); return; }
    if (a.matches(".caso__chip")) { ev("triagem_caso", { caso: texto(a) }); return; }
    if (a.matches("button[data-video], .caso__video, .tv__capa, .cartao button, .completo button")) { ev("video_play", { secao, titulo: a.dataset.titulo || texto(a) }); return; }
    if (a.matches("summary")) { ev("faq_abre", { pergunta: texto(a), aberta: !a.parentElement.open }); return; }
    if (/youtube\.com|youtu\.be|instagram\.com/.test(href)) { ev("saida_rede", { destino: href.includes("instagram") ? "instagram" : "youtube", secao }); return; }
    if (href.includes("associados")) { ev("area_associado", { secao }); return; }
    if (a.matches(".btn") || a.matches(".nav a")) { ev("cta_clique", { secao, rotulo: texto(a), destino: href }); }
  }, { capture: true, passive: true });

  const form = $("#agenda");
  if (form) form.addEventListener("submit", () => {
    const d = new FormData(form);
    const tema = d.get("area") || d.get("tema") || "";
    const atend = d.get("atendimento") || "";
    ev("formulario_envio", { tema: String(tema), atendimento: String(atend) });
    ev("generate_lead", { canal: "formulario", tema: String(tema) });
  }, { capture: true });
  $$("#agenda [name=area], #agenda [name=tema]").forEach((i) => i.addEventListener("change", () => ev("formulario_inicio", { tema: i.value })));
  const copiar = $("#agenda-copiar");
  if (copiar) copiar.addEventListener("click", () => ev("formulario_copiar", {}));

  /* Rolagem: 25 / 50 / 75 / 100 % e seções vistas */
  const marcos = [25, 50, 75, 100]; const feitos = new Set();
  window.addEventListener("scroll", () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (max <= 0) return;
    const p = Math.round((window.scrollY / max) * 100);
    marcos.forEach((m) => { if (p >= m && !feitos.has(m)) { feitos.add(m); ev("rolagem", { percentual: m }); } });
  }, { passive: true });
  const vistas = new Set();
  const obs = new IntersectionObserver((ents) => ents.forEach((en) => {
    if (en.isIntersecting && !vistas.has(en.target.id)) { vistas.add(en.target.id); ev("secao_vista", { secao: en.target.id }); }
  }), { threshold: 0.4 });
  $$("main section[id]").forEach((s) => obs.observe(s));
})();
