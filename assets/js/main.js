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
  const celular = () => window.innerWidth < 860;

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
  $$(".escritorio > *, .escudo, .pessoa, .midia__cab, .player, .agenda, .passos li, .faq, .triagem").forEach((el) => {
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
  const TRIAGEM = Array.isArray(window.TRIAGEM) ? window.TRIAGEM : [];
  const opcoesEl = $("#triagem-opcoes");
  const painel = $("#triagem-painel");
  const casos = {};

  TRIAGEM.forEach((g) => {
    const grupo = criar("div", "triagem__grupo");
    grupo.append(criar("p", "triagem__grupo-rot", g.grupo));
    g.casos.forEach((c) => {
      casos[c.id] = { ...c, grupo: g.grupo };
      const b = criar("button", "triagem__op", c.rotulo);
      b.type = "button";
      b.dataset.caso = c.id;
      b.setAttribute("aria-pressed", "false");
      b.setAttribute("aria-controls", "triagem-painel");
      b.addEventListener("click", () => abrirCaso(c.id, celular()));
      grupo.append(b);
    });
    opcoesEl.append(grupo);
  });

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

  function abrirCaso(id, rolar) {
    const c = casos[id];
    if (!c) return;
    $$(".triagem__op", opcoesEl).forEach((b) => {
      const ativo = b.dataset.caso === id;
      b.classList.toggle("ativo", ativo);
      b.setAttribute("aria-pressed", String(ativo));
    });

    painel.innerHTML = "";
    const card = criar("div", "triagem__card");
    card.append(criar("p", "triagem__grupo-rot", c.grupo), criar("h3", "triagem__titulo", c.rotulo));

    const cols = criar("div", "triagem__cols");
    const colA = criar("div");
    colA.append(criar("h4", null, "É bom saber"));
    const ulA = criar("ul", "saiba");
    c.saiba.forEach((t) => ulA.append(criar("li", null, t)));
    colA.append(ulA);

    const colB = criar("div");
    colB.append(criar("h4", null, "Separe estes documentos"), criar("p", "triagem__dica", "Marque o que você já tem:"));
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
    card.append(cols);

    if (c.video && tituloPorId[c.video]) {
      const vb = criar("button", "triagem__video");
      vb.type = "button";
      const img = criar("img");
      img.src = thumb(c.video);
      img.alt = "";
      img.loading = "lazy";
      const txt = criar("span", "triagem__video-txt");
      txt.append(criar("small", null, "▶ Assista · Programa Saudações"), criar("strong", null, tituloPorId[c.video]));
      vb.append(img, txt);
      vb.addEventListener("click", () => {
        const ifr = criar("iframe", "triagem__iframe");
        ifr.src = `https://www.youtube-nocookie.com/embed/${c.video}?autoplay=1&rel=0`;
        ifr.title = tituloPorId[c.video];
        ifr.allow = "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture";
        ifr.allowFullscreen = true;
        vb.replaceWith(ifr);
      });
      card.append(vb);
    }

    const acoes = criar("div", "triagem__acoes");
    const zap = criar("a", "btn btn--latao", "Falar sobre isso no WhatsApp");
    zap.target = "_blank";
    zap.rel = "noopener";
    zap.href = linkWhats(mensagemDoCaso(c));
    const agendar = criar("a", "btn btn--marinho", "Agendar pelo formulário");
    agendar.href = "#contato";
    agendar.addEventListener("click", () => preencherFormulario(c.area, `Situação: ${c.rotulo}`));
    acoes.append(zap, agendar);
    card.append(acoes, criar("p", "triagem__nota", "Informações gerais, que não substituem a análise do seu caso por um advogado."));

    ulB.addEventListener("change", () => { zap.href = linkWhats(mensagemDoCaso(c)); });

    painel.append(card);
    if (rolar) painel.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // Atalhos do topo e "Entender meu caso" dos cards de atuação abrem a triagem já no caso certo
  $$("a[data-caso]").forEach((a) => a.addEventListener("click", (e) => {
    if (!casos[a.dataset.caso]) return;
    e.preventDefault();
    abrirCaso(a.dataset.caso, false);
    const alvo = celular() ? painel : $("#seu-caso");
    alvo.scrollIntoView({ behavior: "smooth", block: "start" });
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
      origem: "Programa Saudações · " + e.tema,
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
      ? { ...t0.eps[0].videos[0], origem: "Programa Saudações · " + t0.eps[0].tema }
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
