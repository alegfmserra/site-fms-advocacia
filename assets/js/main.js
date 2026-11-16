(() => {
  "use strict";
  const CONTATO = window.CONTATO || {};
  const WHATS = String(CONTATO.whatsapp || "").replace(/\D/g, "");
  const EMAIL = String(CONTATO.email || "").trim();
  const fmtFone = (d) => { const n = d.replace(/^55/, ""); return n.length >= 10 ? `(${n.slice(0, 2)}) ${n.slice(2, -4)}-${n.slice(-4)}` : d; };
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
  $$(".escritorio > *, .escudo, .pessoa, .midia__cab, .player, .agenda, .passos li, .faq, .caso, .brasil__mapa, .remoto li, .membro, .tv").forEach((el) => {
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
    if (WHATS) {
      ajuda.href = linkWhats("Olá! Vim pelo site do escritório Ferreira & Moreira Serra e gostaria de falar sobre o meu caso.");
      ajuda.target = "_blank";
      ajuda.rel = "noopener";
      ajuda.innerHTML = "Não encontrou a sua situação?<br><strong>Fale direto no WhatsApp →</strong>";
    } else {
      ajuda.href = "#contato";
      ajuda.innerHTML = "Não encontrou a sua situação?<br><strong>Fale com o escritório →</strong>";
    }
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
    const agendar = criar("a", WHATS ? "btn btn--marinho" : "btn btn--latao", "Agendar pelo formulário");
    agendar.href = "#contato";
    agendar.addEventListener("click", () => preencherFormulario(c.area, `Situação: ${c.rotulo}`));
    let zap = null;
    if (WHATS) {
      zap = criar("a", "btn btn--latao", "Falar sobre isso no WhatsApp");
      zap.target = "_blank";
      zap.rel = "noopener";
      zap.href = linkWhats(mensagemDoCaso(c));
      acoes.append(zap, agendar);
    } else {
      acoes.append(agendar);
    }
    rodape.append(acoes);
    box.append(rodape);
    if (c.video && tituloPorId[c.video]) box.append(criar("p", "caso__nota", "Informações gerais, que não substituem a análise do seu caso por um advogado."));

    ulB.addEventListener("change", () => { if (zap) zap.href = linkWhats(mensagemDoCaso(c)); });
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

  /* ---------- Na Mídia: cortes por tema (abrem na janela de vídeo) ---------- */
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
    b.addEventListener("click", () => { if (window.abrirVideoFMS) window.abrirVideoFMS(v.id, v.titulo); });
    li.append(b);
    return li;
  }

  function bloco({ rotulo, titulo, sub, link, videos }) {
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
    videos.forEach((v) => lista.append(cartao(v)));
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
    })));
    if (t.shorts.length) episodiosEl.append(bloco({ rotulo: t.shortsRotulo || "Cortes", videos: t.shorts }));
  }

  if (temas.length && filtrosEl && episodiosEl) {
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
  } else if ($("#midia .cortes")) {
    $("#midia .cortes").hidden = true;
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
    const texto = linhas.join("\n");
    if (WHATS) { window.open(linkWhats(texto), "_blank", "noopener"); return; }
    if (EMAIL) { location.href = `mailto:${EMAIL}?subject=${encodeURIComponent("Consulta pelo site")}&body=${encodeURIComponent(texto)}`; return; }
    // sem canal configurado: mostra a mensagem pronta para copiar
    const pronto = $("#agenda-pronto");
    $("#agenda-texto").textContent = texto.replace(/\*/g, "");
    pronto.hidden = false;
    pronto.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });

  /* ---------- Canais públicos (assets/js/contato.js) aplicados aos links e textos ---------- */
  $$("[data-whats]").forEach((a) => {
    if (WHATS) {
      a.href = linkWhats(a.dataset.whats || "Olá! Vim pelo site do escritório Ferreira & Moreira Serra.");
      a.target = "_blank";
      a.rel = "noopener";
    } else if (a.dataset.sem) {
      a.href = a.dataset.sem;
      if (a.dataset.textoSem) a.textContent = a.dataset.textoSem;
    } else {
      a.hidden = true;
    }
  });
  $$("[data-canal]").forEach((el) => {
    const tipo = el.dataset.canal;
    if (tipo === "whats" && WHATS) {
      const a = criar("a", null, fmtFone(WHATS) + (el.dataset.sufixo || ""));
      a.href = linkWhats("Olá! Vim pelo site do escritório Ferreira & Moreira Serra.");
      a.target = "_blank";
      a.rel = "noopener";
      el.append(a);
    } else if (tipo === "email" && EMAIL) {
      const a = criar("a", null, EMAIL);
      a.href = "mailto:" + EMAIL;
      el.append(a);
    } else if (tipo === "nenhum" && !WHATS && !EMAIL) {
      el.hidden = false;
    } else {
      el.hidden = true;
    }
  });
  if (!WHATS && !EMAIL) {
    const nota = $("#agenda-nota");
    if (nota) nota.textContent = "Consulta jurídica individual com advogado do escritório. Nenhum dado fica guardado neste site; a mensagem é montada no seu aparelho.";
  }
  const copiar = $("#agenda-copiar");
  if (copiar) copiar.addEventListener("click", async () => {
    try { await navigator.clipboard.writeText($("#agenda-texto").textContent); const ok = $("#agenda-copiado"); ok.hidden = false; setTimeout(() => { ok.hidden = true; }, 2500); } catch (e) {}
  });

  const ano = $("#ano");
  if (ano) ano.textContent = new Date().getFullYear();
})();

/* ---------- Episódios completos (canal do programa) + janela de vídeo ---------- */
(() => {
  "use strict";
  const $ = (s, el = document) => el.querySelector(s);
  const modal = $("#modal-video");
  const tela = modal && $(".modal-video__tela", modal);

  function abrirVideo(id, titulo) {
    if (!modal || typeof modal.showModal !== "function") {
      window.open(`https://www.youtube.com/watch?v=${id}`, "_blank", "noopener");
      return;
    }
    tela.innerHTML = "";
    const ifr = document.createElement("iframe");
    ifr.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
    ifr.title = titulo || "Programa Saudações";
    ifr.allow = "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture";
    ifr.allowFullscreen = true;
    tela.append(ifr);
    $("#modal-video-titulo").textContent = titulo || "";
    modal.showModal();
  }
  if (modal) {
    const fechar = () => { modal.close(); tela.innerHTML = ""; };
    $(".modal-agenda__fechar", modal).addEventListener("click", fechar);
    modal.addEventListener("click", (e) => { if (e.target === modal) fechar(); });
    modal.addEventListener("close", () => { tela.innerHTML = ""; }); // Esc também para o vídeo
    modal.addEventListener("cancel", () => { tela.innerHTML = ""; });
  }
  document.querySelectorAll("[data-video]").forEach((b) => b.addEventListener("click", () => abrirVideo(b.dataset.video, b.dataset.titulo)));

  window.abrirVideoFMS = abrirVideo;

  /* ---------- TV: episódio em destaque + lista de episódios completos ---------- */
  const CUR = window.CURADORIA || {};
  const excluir = CUR.excluir ? new RegExp(CUR.excluir, "i") : null;
  const lista = (Array.isArray(window.COMPLETOS) ? window.COMPLETOS : []).filter((e) => !(excluir && excluir.test(e.titulo)));
  const tvTela = $("#tv-tela");
  const listaEl = $("#tv-lista");
  const fmt = (iso) => { const [a, m, d] = iso.split("-"); return `${d}/${m}/${a}`; };
  const quem = (e) => (CUR.convidados && CUR.convidados[e.convidado]) ? `${e.convidado} · ${CUR.convidados[e.convidado]}` : (e.convidado || "");

  if (tvTela && listaEl && lista.length) {
    const capa = $("#tv-capa");
    const img = $("#tv-img");
    let atual = null;
    let tocando = false;

    function mostrar(e, tocar) {
      atual = e;
      $("#tv-rotulo").textContent = "Programa Saudações · Band Maranhão" + (e.data ? " · " + fmt(e.data) : "");
      $("#tv-titulo").textContent = e.titulo;
      $("#tv-conv").textContent = quem(e);
      const velho = $("iframe", tvTela);
      if (tocar) {
        const ifr = document.createElement("iframe");
        ifr.src = `https://www.youtube-nocookie.com/embed/${e.id}?autoplay=1&rel=0`;
        ifr.title = e.titulo;
        ifr.allow = "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture";
        ifr.allowFullscreen = true;
        capa.hidden = true;
        if (velho) velho.replaceWith(ifr); else tvTela.append(ifr);
      } else {
        if (velho) velho.remove();
        capa.hidden = false;
        img.onerror = () => { img.onerror = null; img.src = `https://i.ytimg.com/vi/${e.id}/hqdefault.jpg`; };
        img.src = `https://i.ytimg.com/vi/${e.id}/maxresdefault.jpg`;
      }
      listaEl.querySelectorAll("li").forEach((li) => li.classList.toggle("ativo", li.dataset.id === e.id));
    }

    lista.forEach((e, i) => {
      const li = document.createElement("li");
      li.dataset.id = e.id;
      const b = document.createElement("button");
      b.type = "button";
      const th = document.createElement("img");
      th.loading = "lazy";
      th.alt = "";
      th.src = `https://i.ytimg.com/vi/${e.id}/mqdefault.jpg`;
      const txt = document.createElement("span");
      const data = document.createElement("small");
      data.textContent = (e.data ? fmt(e.data) : "Programa Saudações") + (i === 0 ? " · mais recente" : "");
      const tit = document.createElement("strong");
      tit.textContent = e.titulo;
      txt.append(data, tit);
      if (e.convidado) { const q = document.createElement("span"); q.className = "quem"; q.textContent = quem(e); txt.append(q); }
      b.append(th, txt);
      b.addEventListener("click", () => {
        mostrar(e, tocando);
        if (window.innerWidth < 1080) tvTela.scrollIntoView({ behavior: "smooth", block: "center" });
      });
      li.append(b);
      listaEl.append(li);
    });
    capa.addEventListener("click", () => { tocando = true; mostrar(atual, true); });
    mostrar(lista[0], false);
  } else if ($("#midia .tv")) {
    $("#midia .tv").hidden = true;
  }

  /* ---------- Equipe: retratos e faixa de momentos (assets/js/equipe.js) ---------- */
  const EQ = window.EQUIPE || {};
  function abrirFoto(m) {
    if (!modal || typeof modal.showModal !== "function") { window.open(m.src, "_blank", "noopener"); return; }
    tela.innerHTML = "";
    const im = document.createElement("img");
    im.src = m.src;
    im.alt = m.alt || "";
    im.style.cssText = "display:block;width:100%;height:100%;object-fit:contain;background:#000";
    tela.append(im);
    $("#modal-video-titulo").textContent = m.legenda || "";
    modal.showModal();
  }
  document.querySelectorAll(".membro[data-membro]").forEach((art) => {
    const d = EQ[art.dataset.membro];
    if (!d) return;
    const nome = $("h3", art) ? $("h3", art).textContent : "";
    if (d.retrato) {
      const box = $(".membro__retrato", art);
      box.innerHTML = "";
      const im = document.createElement("img");
      im.className = "membro__foto";
      im.src = d.retrato;
      im.alt = "Retrato de " + nome;
      im.loading = "lazy";
      box.append(im);
    }
    const ul = $(".momentos", art);
    const fotos = Array.isArray(d.momentos) ? d.momentos.filter((m) => m && m.src) : [];
    if (ul && fotos.length) {
      fotos.forEach((m) => {
        const li = document.createElement("li");
        const b = document.createElement("button");
        b.type = "button";
        b.setAttribute("aria-label", "Ampliar foto: " + (m.legenda || nome));
        const im = document.createElement("img");
        im.src = m.src;
        im.alt = m.alt || "";
        im.loading = "lazy";
        b.append(im);
        if (m.legenda) { const sm = document.createElement("small"); sm.textContent = m.legenda; b.append(sm); }
        b.addEventListener("click", () => abrirFoto(m));
        li.append(b);
        ul.append(li);
      });
      ul.hidden = false;
    }
  });
})();
