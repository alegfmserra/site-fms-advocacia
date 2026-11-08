(() => {
  "use strict";
  const WHATS = "5598984115013";
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const criar = (tag, cls, txt) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (txt != null) e.textContent = txt;
    return e;
  };
  const linkWhats = (texto) => `https://wa.me/${WHATS}?text=${encodeURIComponent(texto)}`;
  const thumb = (id) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
  
  /* ---------- Cabeçalho: fundo ao rolar + menu mobile ---------- */
  const topo = $("#topo");
  const menuBtn = $(".menu-btn");
  const aoRolar = () => topo.classList.toggle("rolado", window.scrollY > 40);
  aoRolar();
  window.addEventListener("scroll", aoRolar, { passive: true });

  const fecharMenu = () => { topo.classList.remove("aberto"); menuBtn.setAttribute("aria-expanded", "false"); };
  menuBtn.addEventListener("click", () => {
    const aberto = topo.classList.toggle("aberto");
    menuBtn.setAttribute("aria-expanded", String(aberto));
  });
  $$(".nav a").forEach((a) => a.addEventListener("click", fecharMenu));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") fecharMenu(); });

  /* Link ativo do menu conforme a seção visível */
  const links = $$(".nav a:not(.btn)");
  const secObs = new IntersectionObserver((entradas) => {
    entradas.forEach((en) => {
      if (!en.isIntersecting) return;
      links.forEach((l) => l.classList.toggle("ativo", l.getAttribute("href") === "#" + en.target.id));
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  $$("main section[id]").forEach((s) => secObs.observe(s));

  /* Animação de entrada */
  const revObs = new IntersectionObserver((entradas) => {
    entradas.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("visivel"); revObs.unobserve(en.target); } });
  }, { threshold: 0.12 });
  $$(".escritorio > *, .escudo, .pessoa, .midia__cab, .player, .agenda, .passos li, .faq, .caso").forEach((el) => {
    el.classList.add("revela");
    revObs.observe(el);
  });

  /* ---------- Catálogo de vídeos (episódios + shorts) ---------- */
  const EPISODIOS = Array.isArray(window.EPISODIOS) ? window.EPISODIOS : [];
  const SHORTS = Array.isArray(window.SHORTS) ? window.SHORTS : [];
  const CUR = window.CURADORIA || { temas: [] };
  const tituloPorId = {};
  EPISODIOS.forEach((e) => e.videos.forEach((v) => { tituloPorId[v.id] = v.titulo; }));
  SHORTS.forEach((v) => { tituloPorId[v.id] ||= v.titulo; });

  /* ---------- Formulário (usado também pela triagem) ---------- */
  const form = $("#agenda");
  const erro = $("#agenda-erro");
  const passos = $$(".agenda__passos li");
  const blocos = $$(".agenda__bloco", form);

  function atualizarPassos() {
    const temTema = !!form.tema.value;
    const temDados = form.nome.value.trim() && form.whats.value.trim();
    const etapa = !temTema ? 0 : !temDados ? (document.activeElement && blocos[2].contains(document.activeElement) ? 2 : 1) : 2;
    passos.forEach((p, i) => p.classList.toggle("ativo", i === etapa));
  }
  function preencherFormulario(area, relato) {
    const r = $(`input[name="tema"][value="${area}"]`, form);
    if (r) r.checked = true;
    if (relato && !form.relato.value.trim()) form.relato.value = relato;
    atualizarPassos();
  }

  /* ---------- Seu caso: triagem interativa ---------- */
  // Painel com abas por área (esquerda), situações em botões (topo) e orientação (corpo).
  // Abre sempre com a primeira situação visível, para nunca ficar vazio.
  const TRIAGEM = Array.isArray(window.TRIAGEM) ? window.TRIAGEM : [];
  const abasEl = $("#triagem-abas");
  const chipsEl = $("#triagem-chips");
  const painel = $("#triagem-painel");
  const casos = {};
  const ICONES = {
    saude: '<path d="M17 6v12a7 7 0 0 0 14 0V6M17 6h-3M31 6h3M24 25v6a8 8 0 0 0 8 8h2a4 4 0 1 0 0-8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M6 40l8-4h10l6 3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
    militar: '<path d="M24 5l5 11 12 1-9 8 3 12-11-7-11 7 3-12-9-8 12-1z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>',
    civel: '<path d="M24 4l17 10v20L24 44 7 34V14z M24 4v40 M7 14l34 20 M41 14L7 34" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>',
    outros: '<path d="M8 10h32v22H22l-9 8v-8H8z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M18 21h.01M24 21h.01M30 21h.01" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>',
  };
  let grupoAtual = null;

  TRIAGEM.forEach((g, gi) => {
    g.casos.forEach((c) => { casos[c.id] = { ...c, grupo: g.grupo, gi }; });
    const aba = criar("button", "caso__aba");
    aba.type = "button";
    aba.setAttribute("role", "tab");
    aba.setAttribute("aria-selected", "false");
    aba.dataset.gi = gi;
    aba.innerHTML = `<svg viewBox="0 0 48 48" aria-hidden="true">${ICONES[g.icone] || ICONES.outros}</svg>`;
    const txt = criar("span");
    txt.append(criar("strong", null, g.grupo), criar("small", null, g.casos.length === 1 ? "1 situação" : `${g.casos.length} situações`));
    aba.append(txt);
    aba.addEventListener("click", () => abrirCaso(g.casos[0].id));
    abasEl.append(aba);
  });
  if (TRIAGEM.length) {
    const ajuda = criar("a", "caso__ajuda");
    ajuda.href = linkWhats("Olá! Vim pelo site do escritório Ferreira & Moreira Serra e gostaria de falar sobre o meu caso.");
    ajuda.target = "_blank";
    ajuda.rel = "noopener";
    ajuda.innerHTML = "Não encontrou a sua situação?<br><strong>Fale direto no WhatsApp →</strong>";
    abasEl.append(ajuda);
  }

  function mostrarGrupo(gi) {
    if (grupoAtual === gi) return;
    grupoAtual = gi;
    $$(".caso__aba", abasEl).forEach((a) => a.setAttribute("aria-selected", String(+a.dataset.gi === gi)));
    chipsEl.innerHTML = "";
    TRIAGEM[gi].casos.forEach((c) => {
      const b = criar("button", "caso__chip", c.curto || c.rotulo);
      b.type = "button";
      b.dataset.caso = c.id;
      b.setAttribute("aria-pressed", "false");
      b.addEventListener("click", () => abrirCaso(c.id));
      chipsEl.append(b);
    });
  }

  function mensagemDoCaso(c) {
    const tenho = $$(".docs input:checked", painel).map((i) => i.value);
    const linhas = [
      "Olá! Vim pelo site do escritório Ferreira & Moreira Serra.",
      "",
      `*Minha situação:* ${c.rotulo}`,
    ];
    if (tenho.length) linhas.push(`*Já tenho:* ${tenho.join("; ")}`);
    linhas.push("", "Gostaria de conversar sobre o meu caso.");
    return linhas.join("\n");
  }

  function abrirCaso(id) {
    const c = casos[id];
    if (!c) return;
    mostrarGrupo(c.gi);
    $$(".caso__chip", chipsEl).forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.caso === id)));

    painel.innerHTML = "";
    const box = criar("div", "caso__box");
    box.append(criar("h3", "caso__titulo", c.rotulo));

    const cols = criar("div", "caso__cols");
    const colA = criar("div");
    colA.append(criar("h4", null, "É bom saber"));
    const ulA = criar("ul", "saiba");
    c.saiba.forEach((t) => ulA.append(criar("li", null, t)));
    colA.append(ulA);

    const colB = criar("div");
    colB.append(criar("h4", null, "Separe estes documentos"), criar("p", "caso__dica", "Marque o que você já tem:"));
    const ulB = criar("ul", "docs");
    c.docs.forEach((t) => {
      const li = criar("li");
      const lb = criar("label");
      const cb = criar("input");
      cb.type = "checkbox";
      cb.value = t;
      lb.append(cb, criar("span", null, t));
      li.append(lb);
      ulB.append(li);
    });
    colB.append(ulB);
    cols.append(colA, colB);
    box.append(cols);

    const rodape = criar("div", "caso__rodape");
    if (c.video && tituloPorId[c.video]) {
      const vb = criar("button", "caso__video");
      vb.type = "button";
      const img = criar("img");
      img.src = thumb(c.video);
      img.alt = "";
      img.loading = "lazy";
      const txt = criar("span");
      txt.append(criar("small", null, "▶ Assista · Programa Saudações"), criar("strong", null, tituloPorId[c.video]));
      vb.append(img, txt);
      vb.addEventListener("click", () => {
        const ifr = criar("iframe", "caso__iframe");
        ifr.src = `https://www.youtube-nocookie.com/embed/${c.video}?autoplay=1&rel=0`;
        ifr.title = tituloPorId[c.video];
        ifr.allow = "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture";
        ifr.allowFullscreen = true;
        vb.replaceWith(ifr);
      });
      rodape.append(vb);
    } else {
      rodape.append(criar("p", "caso__nota", "Informações gerais, que não substituem a análise do seu caso por um advogado."));
    }
    const acoes = criar("div", "caso__acoes");
    const zap = criar("a", "btn btn--latao", "Falar sobre isso no WhatsApp");
    zap.target = "_blank";
    zap.rel = "noopener";
    zap.href = linkWhats(mensagemDoCaso(c));
    const agendar = criar("a", "btn btn--marinho", "Agendar pelo formulário");
    agendar.href = "#contato";
    agendar.addEventListener("click", () => preencherFormulario(c.area, `Situação: ${c.rotulo}`));
    acoes.append(zap, agendar);
    rodape.append(acoes);
    box.append(rodape);
    if (c.video && tituloPorId[c.video]) box.append(criar("p", "caso__nota", "Informações gerais, que não substituem a análise do seu caso por um advogado."));

    ulB.addEventListener("change", () => { zap.href = linkWhats(mensagemDoCaso(c)); });
    painel.append(box);
  }

  if (TRIAGEM.length) abrirCaso(TRIAGEM[0].casos[0].id);
  else $("#seu-caso").hidden = true;

  // Atalhos do topo e "Entender meu caso" dos cards de atuação abrem a triagem já no caso certo
  $$("a[data-caso]").forEach((a) => a.addEventListener("click", (e) => {
    if (!casos[a.dataset.caso]) return;
    e.preventDefault();
    abrirCaso(a.dataset.caso);
    $("#triagem").scrollIntoView({ behavior: "smooth", block: "start" });
    history.replaceState(null, "", "#seu-caso");
  }));

  /* ---------- Na Mídia: temas → episódios do programa + cortes ---------- */
  const player = $("#player");
  const filtrosEl = $("#filtros");
  const episodiosEl = $("#episodios");
  const excluir = CUR.excluir ? new RegExp(CUR.excluir, "i") : null;
  const epPorId = Object.fromEntries(EPISODIOS.map((e) => [e.lista, e]));
  const fmtData = (iso) => { const [a, m, d] = iso.split("-"); return `${d}/${m}/${a}`; };

  const temas = (CUR.temas || []).map((t) => {
    const eps = (t.episodios || []).map((id) => epPorId[id]).filter(Boolean)
      .map((e) => ({ ...e, tema: (CUR.titulos && CUR.titulos[e.lista]) || e.tema }));
    const usados = new Set(eps.flatMap((e) => e.videos.map((v) => v.id)));
    const re = t.shorts ? new RegExp(t.shorts, "i") : null;
    const shorts = re ? SHORTS.filter((s) => re.test(s.titulo) && !(excluir && excluir.test(s.titulo)) && !usados.has(s.id)) : [];
    return { ...t, eps, shorts };
  }).filter((t) => t.eps.length || t.shorts.length);

  let atual = null;

  function mostrarNoPlayer(v, tocar) {
    if (!v) return;
    atual = v;
    $("#player-titulo").textContent = v.titulo;
    $("#player-rotulo").textContent = v.origem || "Programa Saudações · Band";
    const velho = $("iframe", player);
    if (tocar) {
      const ifr = document.createElement("iframe");
      ifr.src = `https://www.youtube-nocookie.com/embed/${v.id}?autoplay=1&rel=0`;
      ifr.title = v.titulo;
      ifr.allow = "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture";
      ifr.allowFullscreen = true;
      $(".player__capa", player).hidden = true;
      if (velho) velho.replaceWith(ifr); else player.prepend(ifr);
    } else {
      if (velho) velho.remove();
      $(".player__capa", player).hidden = false;
      $("#player-img").src = thumb(v.id);
    }
    $$(".cartao", episodiosEl).forEach((c) => c.classList.toggle("ativo", c.dataset.id === v.id));
  }

  function cartao(v) {
    const li = criar("li", "cartao");
    li.dataset.id = v.id;
    const b = criar("button");
    b.type = "button";
    b.setAttribute("aria-label", "Assistir: " + v.titulo);
    const img = criar("img");
    img.loading = "lazy";
    img.alt = "";
    img.src = thumb(v.id);
    const marca = criar("span", "cartao__v", "V");
    marca.setAttribute("aria-hidden", "true");
    b.append(img, criar("span", "cartao__titulo", v.titulo), marca);
    b.addEventListener("click", () => {
      mostrarNoPlayer(v, true);
      if (window.innerWidth < 1080) player.scrollIntoView({ behavior: "smooth", block: "center" });
    });
    li.append(b);
    return li;
  }

  function bloco({ rotulo, titulo, sub, link, videos, origem }) {
    const box = criar("div", "ep");
    const cab = criar("div", "ep__cab");
    const txt = criar("div");
    txt.append(criar("p", "ep__rotulo", rotulo));
    if (titulo) txt.append(criar("h3", "ep__titulo", titulo));
    if (sub) txt.append(criar("p", "ep__sub", sub));
    const nav = criar("div", "ep__nav");
    const lista = criar("ul", "cartoes");
    [-1, 1].forEach((dir) => {
      const s = criar("button", "seta", dir < 0 ? "←" : "→");
      s.type = "button";
      s.setAttribute("aria-label", dir < 0 ? "Vídeos anteriores" : "Próximos vídeos");
      s.addEventListener("click", () => lista.scrollBy({ left: dir * lista.clientWidth * 0.9, behavior: "smooth" }));
      nav.append(s);
    });
    if (link) {
      const a = criar("a", "ep__link", "Episódio no YouTube ↗");
      a.href = link;
      a.target = "_blank";
      a.rel = "noopener";
      nav.append(a);
    }
    cab.append(txt, nav);
    videos.forEach((v) => lista.append(cartao({ ...v, origem })));
    box.append(cab, lista);
    return box;
  }

  function renderizarTema(t) {
    episodiosEl.innerHTML = "";
    t.eps.forEach((e) => episodiosEl.append(bloco({
      rotulo: "No programa" + (e.data ? " · " + fmtData(e.data) : ""),
      titulo: e.tema,
      sub: e.convidado ? "com " + e.convidado : "",
      link: `https://www.youtube.com/playlist?list=${e.lista}`,
      videos: e.videos,
      origem: "Programa Saudações · Band" + (e.data ? " · " + fmtData(e.data) : ""),
    })));
    if (t.shorts.length) {
      episodiosEl.append(bloco({ rotulo: t.shortsRotulo || "Cortes", videos: t.shorts, origem: "Corte · Programa Saudações" }));
    }
    if (atual) $$(".cartao", episodiosEl).forEach((c) => c.classList.toggle("ativo", c.dataset.id === atual.id));
  }

  if (temas.length) {
    temas.forEach((t, i) => {
      const b = criar("button", null, t.rotulo);
      b.type = "button";
      b.setAttribute("role", "tab");
      b.setAttribute("aria-selected", String(i === 0));
      b.addEventListener("click", () => {
        $$("button", filtrosEl).forEach((x) => x.setAttribute("aria-selected", String(x === b)));
        renderizarTema(t);
      });
      filtrosEl.append(b);
    });
    renderizarTema(temas[0]);
    const t0 = temas[0];
    const primeiro = t0.eps[0]
      ? { ...t0.eps[0].videos[0], origem: "Programa Saudações · Band" + (t0.eps[0].data ? " · " + fmtData(t0.eps[0].data) : "") }
      : { ...t0.shorts[0], origem: "Corte · Programa Saudações" };
    mostrarNoPlayer(primeiro, false);
    $(".player__capa", player).addEventListener("click", () => mostrarNoPlayer(atual, true));
  } else {
    $("#midia .midia").hidden = true;
  }

  /* ---------- Agendamento → WhatsApp ---------- */
  // Data mínima = hoje
  const hoje = new Date();
  hoje.setMinutes(hoje.getMinutes() - hoje.getTimezoneOffset());
  form.data.min = hoje.toISOString().slice(0, 10);

  form.addEventListener("input", atualizarPassos);
  form.addEventListener("focusin", atualizarPassos);

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    erro.textContent = "";
    if (!form.tema.value) { erro.textContent = "Escolha o tema da consulta."; return; }
    if (!form.nome.value.trim()) { erro.textContent = "Informe o seu nome."; form.nome.focus(); return; }
    const fone = form.whats.value.replace(/\D/g, "");
    if (fone.length < 10) { erro.textContent = "Informe um WhatsApp com DDD."; form.whats.focus(); return; }
    if (form.email.value && !form.email.checkValidity()) { erro.textContent = "Confira o e-mail."; form.email.focus(); return; }

    let dataTxt = "a combinar";
    if (form.data.value) {
      const [a, m, d] = form.data.value.split("-");
      dataTxt = `${d}/${m}/${a}`;
    }
    const linhas = [
      "Olá! Gostaria de agendar uma consulta com o escritório Ferreira & Moreira Serra.",
      "",
      `*Tema:* ${form.tema.value}`,
      `*Atendimento:* ${form.modalidade.value}`,
      `*Data preferida:* ${dataTxt} (${form.turno.value.toLowerCase()})`,
      `*Nome:* ${form.nome.value.trim()}`,
      `*WhatsApp:* ${form.whats.value.trim()}`,
    ];
    if (form.email.value.trim()) linhas.push(`*E-mail:* ${form.email.value.trim()}`);
    if (form.relato.value.trim()) linhas.push("", `*Relato:* ${form.relato.value.trim()}`);
    window.open(linkWhats(linhas.join("\n")), "_blank", "noopener");
  });

  const ano = $("#ano");
  if (ano) ano.textContent = new Date().getFullYear();
})();
