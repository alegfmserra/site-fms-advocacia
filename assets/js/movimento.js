// Movimento e efeitos visuais do site (sem dependências).
// Tudo aqui é decorativo: se o visitante pediu "reduzir movimento" no sistema, quase nada anima.
(() => {
  "use strict";
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const calmo = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const toque = window.matchMedia("(hover: none)").matches;
  document.documentElement.classList.add(calmo ? "calmo" : "anima");

  /* ---------- Barra de progresso + cabeçalho que some ao descer ---------- */
  const barra = $(".progresso span");
  const topo = $("#topo");
  let ultimoY = window.scrollY;
  let velocidade = 0; // usada pelo letreiro
  function aoRolar() {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (barra) barra.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    const desceu = y > ultimoY;
    if (!topo.classList.contains("aberto")) topo.classList.toggle("escondido", desceu && y > 500);
    velocidade = Math.min(Math.abs(y - ultimoY), 60);
    ultimoY = y;
  }
  window.addEventListener("scroll", aoRolar, { passive: true });
  aoRolar();

  /* ---------- Títulos: palavras sobem de dentro de uma máscara ---------- */
  function fatiar(el) {
    if (el.dataset.fatiado) return;
    el.dataset.fatiado = "1";
    const palavras = el.textContent.trim().split(/\s+/);
    el.textContent = "";
    palavras.forEach((p, i) => {
      const caixa = document.createElement("span");
      caixa.className = "palavra";
      const dentro = document.createElement("span");
      dentro.textContent = p;
      dentro.style.transitionDelay = `${i * 70}ms`;
      caixa.append(dentro);
      el.append(caixa, i < palavras.length - 1 ? " " : "");
    });
  }
  const titulos = $$(".hero h1, .titulo-secao, .escritorio__titulo h2, .contato__chamada h2, .cinema__titulo");
  if (!calmo) {
    titulos.forEach((t) => {
      if (t.querySelector("br")) return; // títulos com quebra manual ficam inteiros
      fatiar(t);
    });
    const obsTit = new IntersectionObserver((ents) => ents.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add("revelado"); obsTit.unobserve(en.target); }
    }), { threshold: 0.3 });
    titulos.forEach((t) => obsTit.observe(t));
    // o título do topo entra logo no carregamento
    requestAnimationFrame(() => $(".hero h1")?.classList.add("revelado"));
  }

  /* ---------- Topo: partículas de latão e luz em movimento ---------- */
  const tela = $(".hero__canvas");
  if (tela && !calmo) {
    const ctx = tela.getContext("2d");
    const hero = $(".hero");
    let W = 0, H = 0, dpr = 1, rodando = true, quadro = 0;
    const N = window.innerWidth < 700 ? 34 : 70;
    const pts = [];
    function medir() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = hero.clientWidth; H = hero.clientHeight;
      tela.width = W * dpr; tela.height = H * dpr;
      tela.style.width = W + "px"; tela.style.height = H + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function novo(i) {
      return {
        x: Math.random() * W, y: Math.random() * H,
        r: 0.6 + Math.random() * 1.8,
        vx: -0.08 + Math.random() * 0.16, vy: -0.12 - Math.random() * 0.28,
        a: 0.15 + Math.random() * 0.45, f: Math.random() * Math.PI * 2, i,
      };
    }
    medir();
    for (let i = 0; i < N; i++) pts.push(novo(i));
    window.addEventListener("resize", medir);
    new IntersectionObserver(([en]) => { rodando = en.isIntersecting; if (rodando) passo(); }).observe(hero);
    document.addEventListener("visibilitychange", () => { rodando = !document.hidden; if (rodando) passo(); });

    function passo() {
      if (!rodando) return;
      cancelAnimationFrame(quadro);
      quadro = requestAnimationFrame(() => {
        const t = performance.now() / 1000;
        ctx.clearRect(0, 0, W, H);
        // duas manchas de luz que passeiam devagar
        [[0.78, 0.38, 0.42, 0.10], [0.35, 0.7, 0.35, 0.05]].forEach(([cx, cy, r, a], k) => {
          const x = W * (cx + Math.sin(t * 0.13 + k * 2) * 0.06);
          const y = H * (cy + Math.cos(t * 0.11 + k) * 0.05);
          const g = ctx.createRadialGradient(x, y, 0, x, y, Math.max(W, H) * r);
          g.addColorStop(0, `rgba(184,155,106,${a})`);
          g.addColorStop(1, "rgba(184,155,106,0)");
          ctx.fillStyle = g;
          ctx.fillRect(0, 0, W, H);
        });
        // poeira de latão subindo
        for (const p of pts) {
          p.x += p.vx + Math.sin(t + p.f) * 0.05;
          p.y += p.vy;
          if (p.y < -10 || p.x < -10 || p.x > W + 10) { Object.assign(p, novo(p.i), { y: H + 10 }); }
          const brilho = p.a * (0.6 + 0.4 * Math.sin(t * 1.6 + p.f));
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(217,195,154,${brilho})`;
          ctx.fill();
        }
        passo();
      });
    }
    passo();
  }

  /* ---------- Topo: arte acompanha o mouse (leve paralaxe) ---------- */
  const arte = $(".hero__arte");
  if (arte && !calmo && !toque) {
    $(".hero").addEventListener("pointermove", (e) => {
      const r = e.currentTarget.getBoundingClientRect();
      const dx = (e.clientX - r.left) / r.width - 0.5;
      const dy = (e.clientY - r.top) / r.height - 0.5;
      arte.style.setProperty("--px", `${dx * -18}px`);
      arte.style.setProperty("--py", `${dy * -14}px`);
    });
  }

  /* ---------- Letreiro: corre sozinho e acelera com a rolagem ---------- */
  const trilho = $(".letreiro__trilho");
  if (trilho && !calmo) {
    let x = 0, visivel = false, extra = 0;
    new IntersectionObserver(([en]) => { visivel = en.isIntersecting; if (visivel) correr(); }).observe(trilho);
    function correr() {
      if (!visivel) return;
      requestAnimationFrame(() => {
        extra = extra * 0.92 + velocidade * 0.08;
        velocidade *= 0.9;
        x -= 0.6 + extra * 0.5;
        const metade = trilho.scrollWidth / 2;
        if (-x >= metade) x += metade;
        trilho.style.transform = `translate3d(${x}px,0,0)`;
        correr();
      });
    }
  }

  /* ---------- Áreas de atuação: escudo inclina e reflete a luz ---------- */
  if (!calmo && !toque) {
    $$(".escudo").forEach((el) => {
      const luz = document.createElement("span");
      luz.className = "escudo__luz";
      luz.setAttribute("aria-hidden", "true");
      el.append(luz);
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        el.style.transform = `perspective(900px) rotateY(${(px - 0.5) * 10}deg) rotateX(${(0.5 - py) * 8}deg) translateY(-6px)`;
        el.style.setProperty("--mx", `${px * 100}%`);
        el.style.setProperty("--my", `${py * 100}%`);
      });
      el.addEventListener("pointerleave", () => { el.style.transform = ""; });
    });
  }

  /* ---------- Como funciona: a linha avança com a rolagem e acende os passos ---------- */
  const secPassos = $("#como-funciona");
  const linha = $(".passos__barra span");
  const itens = $$(".passos li");
  if (secPassos && linha) {
    function progressoPassos() {
      const r = secPassos.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height * 0.75)));
      linha.style.transform = `scaleX(${calmo ? 1 : p})`;
      itens.forEach((li, i) => li.classList.toggle("aceso", calmo || p >= (i + 0.35) / itens.length));
    }
    window.addEventListener("scroll", progressoPassos, { passive: true });
    progressoPassos();
  }

  /* ---------- Cinema: parede de cortes do programa em movimento ---------- */
  const parede = $("#parede");
  if (parede) {
    const excluir = window.CURADORIA?.excluir ? new RegExp(window.CURADORIA.excluir, "i") : null;
    const ids = [];
    (window.EPISODIOS || []).forEach((e) => e.videos.forEach((v) => ids.push(v.id)));
    (window.SHORTS || []).forEach((v) => { if (!(excluir && excluir.test(v.titulo))) ids.push(v.id); });
    const unicos = [...new Set(ids)];
    const COLS = window.innerWidth < 700 ? 3 : 5;
    const porCol = 6;
    for (let c = 0; c < COLS; c++) {
      const col = document.createElement("div");
      col.className = "cinema__col";
      col.style.setProperty("--dur", `${38 + c * 7}s`);
      if (c % 2) col.classList.add("sobe");
      const lista = [];
      for (let k = 0; k < porCol; k++) lista.push(unicos[(c * porCol + k) % unicos.length]);
      [...lista, ...lista].forEach((id) => {
        const img = document.createElement("img");
        img.loading = "lazy";
        img.alt = "";
        img.src = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
        col.append(img);
      });
      parede.append(col);
    }
    // só anima quando a faixa está na tela
    new IntersectionObserver(([en]) => parede.classList.toggle("ativo", en.isIntersecting && !calmo)).observe(parede);
  }

  /* ---------- Google Agenda: botão + janela com a página de agendamento ---------- */
  const blocoAgenda = $("#agenda-google");
  const modal = $("#modal-agenda");
  const url = blocoAgenda?.dataset.url?.trim();
  if (blocoAgenda && modal && /^https:\/\/calendar\.(app\.)?google(\.com)?\//.test(url || "")) {
    blocoAgenda.hidden = false;
    const corpo = $(".modal-agenda__corpo", modal);
    // Link de incorporação (…/appointments/schedules/…?gv=true) abre numa janela dentro do site;
    // o link curto (calendar.app.google/…) não permite incorporação, então abre em nova aba.
    const incorporavel = /\/appointments\//.test(url);
    $("button", blocoAgenda).addEventListener("click", () => {
      if (!incorporavel) { window.open(url, "_blank", "noopener"); return; }
      if (!corpo.firstChild) {
        const ifr = document.createElement("iframe");
        ifr.src = url;
        ifr.title = "Agenda de horários do escritório";
        corpo.append(ifr);
      }
      if (typeof modal.showModal === "function") modal.showModal();
      else window.open(url, "_blank", "noopener");
    });
    $(".modal-agenda__fechar", modal).addEventListener("click", () => modal.close());
    modal.addEventListener("click", (e) => { if (e.target === modal) modal.close(); });
  }
})();

/* ---------- Capa: vídeo ou foto de fundo (atributos data-video / data-video-webm / data-foto da <section class="hero">) ---------- */
(() => {
  "use strict";
  const hero = document.querySelector(".hero");
  const box = hero && hero.querySelector(".hero__midia");
  if (!box) return;
  const foto = (hero.dataset.foto || "").trim();
  const video = (hero.dataset.video || "").trim();
  const webm = (hero.dataset.videoWebm || "").trim();
  if (!foto && !video) return;
  const calmo = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const economia = !!(navigator.connection && navigator.connection.saveData);

  if (foto) {
    const img = new Image();
    img.decoding = "async";
    img.alt = "";
    img.addEventListener("load", () => { box.prepend(img); hero.classList.add("tem-midia"); }, { once: true });
    img.src = foto;
  }
  if (video && !calmo && !economia) {
    const v = document.createElement("video");
    v.muted = true;
    v.setAttribute("muted", "");
    v.loop = true;
    v.playsInline = true;
    v.setAttribute("playsinline", "");
    v.autoplay = true;
    v.preload = "metadata";
    if (foto) v.poster = foto;
    if (webm) { const s1 = document.createElement("source"); s1.src = webm; s1.type = "video/webm"; v.append(s1); }
    const s2 = document.createElement("source");
    s2.src = video;
    s2.type = "video/mp4";
    v.append(s2);
    s2.addEventListener("error", () => v.remove()); // arquivo ausente: fica a foto ou o degradê
    v.addEventListener("canplay", () => { hero.classList.add("tem-midia"); v.classList.add("pronto"); v.play().catch(() => {}); }, { once: true });
    box.append(v);
    // só roda enquanto a capa está na tela e a aba está visível
    new IntersectionObserver(([en]) => { if (en.isIntersecting) v.play().catch(() => {}); else v.pause(); }).observe(hero);
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) v.pause();
      else if (hero.getBoundingClientRect().bottom > 0) v.play().catch(() => {});
    });
  }
})();

/* ---------- MOTION 2026-11-18: capa que sela, mapa pela rolagem, listas em sequência, pílulas, magnético, cursor ---------- */
(() => {
  "use strict";
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  if (!document.documentElement.classList.contains("anima") || location.search.includes("nomotion")) return;
  const mouse = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const porQuadro = (fn) => { let pedido = 0; return () => { if (pedido) return; pedido = requestAnimationFrame(() => { pedido = 0; fn(); }); }; };

  /* Capa sela ao rolar; mapa se desenha com a rolagem */
  const hero = $(".hero");
  const mapa = $(".brasil__mapa");
  const rolar = porQuadro(() => {
    const y = window.scrollY, vh = window.innerHeight;
    if (hero) hero.style.setProperty("--hp", Math.min(1, Math.max(0, y / (vh * 0.9))).toFixed(3));
    if (mapa) {
      const r = mapa.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (vh * 0.9 - r.top) / (r.height * 0.9 + vh * 0.2)));
      mapa.style.setProperty("--mp", p.toFixed(3));
      mapa.style.setProperty("--pts", p > 0.55 ? 1 : 0);
    }
  });
  window.addEventListener("scroll", rolar, { passive: true });
  window.addEventListener("resize", rolar);
  rolar();

  /* Listas que entram em sequência (índice em --i) e blocos que "ligam" ao aparecer */
  [".pilares", ".passos", ".time", ".completos__trilho", ".faq", ".rodape__cols", ".remoto"].forEach((sel) =>
    $$(sel).forEach((el) => { el.dataset.lista = ""; [...el.children].forEach((c, i) => c.style.setProperty("--i", i)); }));
  $$(".escudo").forEach((el, i) => el.style.setProperty("--i", i));
  const alvos = [...$$("[data-lista]"), ...$$(".escudo, .tv__tela, .faixa, .secao--areia, .remoto li")];
  const obs = new IntersectionObserver((ents) => ents.forEach((en) => {
    if (!en.isIntersecting) return;
    en.target.classList.add("ligado");
    obs.unobserve(en.target);
  }), { threshold: 0.15, rootMargin: "0px 0px -6% 0px" });
  alvos.forEach((el) => obs.observe(el));

  /* Pílula que desliza entre chips (triagem) e filtros (cortes); sublinhado do menu */
  function pilula(container, seletorAtivo, classe, porRolagem) {
    if (!container) return;
    const p = document.createElement("span");
    p.className = classe;
    p.setAttribute("aria-hidden", "true");
    container.append(p);
    const mover = () => {
      const a = container.querySelector(seletorAtivo);
      if (!a) { p.classList.remove("pronta"); return; }
      const cr = container.getBoundingClientRect(), ar = a.getBoundingClientRect();
      p.style.width = ar.width + "px";
      p.style.height = (classe === "nav__ind" ? 1 : ar.height) + "px";
      const y = classe === "nav__ind" ? ar.bottom - cr.top - 4 : ar.top - cr.top;
      p.style.transform = "translate(" + (ar.left - cr.left) + "px, " + y + "px)";
      requestAnimationFrame(() => p.classList.add("pronta"));
    };
    if (porRolagem) window.addEventListener("scroll", porQuadro(mover), { passive: true });
    else new MutationObserver(mover).observe(container, { subtree: true, attributes: true, childList: true, attributeFilter: ["aria-pressed", "aria-selected"] });
    window.addEventListener("resize", mover);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(mover);
    mover();
  }
  pilula($("#triagem-chips"), "[aria-pressed=true]", "pilula");
  pilula($("#filtros"), "[aria-selected=true]", "pilula");
  if (window.innerWidth > 860) pilula($(".nav"), "a.ativo", "nav__ind", true);

  if (!mouse) return;

  /* Botões magnéticos com luz que segue o ponteiro */
  $$(".btn").forEach((b) => {
    b.addEventListener("pointermove", (e) => {
      const r = b.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
      const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
      b.style.setProperty("--mx", (dx * 8) + "px");
      b.style.setProperty("--my", (dy * 6) + "px");
      b.style.setProperty("--bx", ((e.clientX - r.left) / r.width * 100) + "%");
      b.style.setProperty("--by", ((e.clientY - r.top) / r.height * 100) + "%");
    });
    b.addEventListener("pointerleave", () => { b.style.setProperty("--mx", "0px"); b.style.setProperty("--my", "0px"); });
  });

  /* Cursor de latão */
  const c = document.createElement("span");
  c.className = "cursor";
  c.setAttribute("aria-hidden", "true");
  document.body.append(c);
  let cx = 0, cy = 0, tx = 0, ty = 0, vivo = false;
  function segue() { cx += (tx - cx) * 0.22; cy += (ty - cy) * 0.22; c.style.transform = "translate(" + cx + "px, " + cy + "px)"; requestAnimationFrame(segue); }
  document.addEventListener("pointermove", (e) => { tx = e.clientX; ty = e.clientY; if (!vivo) { vivo = true; cx = tx; cy = ty; c.classList.add("visivel"); segue(); } });
  document.addEventListener("pointerleave", () => c.classList.remove("visivel"));
  document.addEventListener("pointerenter", () => c.classList.add("visivel"));
  document.addEventListener("pointerover", (e) => c.classList.toggle("sobre", !!e.target.closest("a, button, summary, label, [role=tab]")));
})();

/* ---------- MOTION 2 (2026-11-18): abertura, rolagem suave, 3D no escudo, sinais no mapa, paralaxe, listas da mídia ---------- */
(() => {
  "use strict";
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const html = document.documentElement;
  const anima = html.classList.contains("anima");
  const mouse = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const ab = $("#abertura");

  /* Abertura: uma vez por visita (sessionStorage); a capa espera a cortina subir */
  let jaViu = false;
  try { jaViu = sessionStorage.getItem("fms-abertura") === "1"; } catch (e) {}
  if (!ab || !anima || jaViu || location.hash) {
    if (ab) ab.classList.add("feita");
  } else {
    html.classList.add("abrindo");
    html.style.overflow = "hidden";
    const h1 = $(".hero h1");
    requestAnimationFrame(() => requestAnimationFrame(() => h1 && h1.classList.remove("revelado")));
    const soltar = () => {
      ab.classList.add("sai");
      html.classList.remove("abrindo");
      html.style.overflow = "";
      if (h1) setTimeout(() => h1.classList.add("revelado"), 350);
      try { sessionStorage.setItem("fms-abertura", "1"); } catch (e) {}
      setTimeout(() => ab.classList.add("feita"), 900);
    };
    setTimeout(soltar, 1700);
  }

  if (!anima) return;

  /* Rolagem suave com inércia (só desktop com roda do mouse; teclado, barra e toque continuam nativos) */
  if (mouse) {
    let alvo = window.scrollY, atual = alvo, rodando = false;
    const max = () => document.documentElement.scrollHeight - window.innerHeight;
    function passo() {
      atual += (alvo - atual) * 0.12;
      if (Math.abs(alvo - atual) < 0.5) { atual = alvo; rodando = false; }
      window.scrollTo(0, atual);
      if (rodando) requestAnimationFrame(passo);
    }
    window.addEventListener("wheel", (e) => {
      if (e.ctrlKey || e.target.closest(".cartoes, .completos__trilho, .momentos, .tv__lista, dialog, textarea")) return;
      e.preventDefault();
      const delta = e.deltaMode === 1 ? e.deltaY * 32 : e.deltaY;
      if (!rodando) atual = window.scrollY;
      alvo = Math.max(0, Math.min(max(), alvo + delta));
      if (!rodando) { rodando = true; requestAnimationFrame(passo); }
    }, { passive: false });
    window.addEventListener("scroll", () => { if (!rodando) alvo = window.scrollY; }, { passive: true });
  }

  /* Capa: anel de linhas atrás do escudo + escudo em 3D que acompanha o ponteiro */
  const arte = $(".hero__arte");
  if (arte) {
    const anel = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    anel.setAttribute("class", "hero__anel");
    anel.setAttribute("viewBox", "0 0 600 600");
    anel.innerHTML = '<circle cx="300" cy="300" r="286" stroke-dasharray="2 14" stroke-width="1"/><circle cx="300" cy="300" r="256" stroke-dasharray="40 300" stroke-width="1"/>';
    arte.prepend(anel);
    if (mouse) {
      $(".hero").addEventListener("pointermove", (e) => {
        const r = e.currentTarget.getBoundingClientRect();
        const dx = (e.clientX - r.left) / r.width - 0.5, dy = (e.clientY - r.top) / r.height - 0.5;
        arte.style.setProperty("--ry", (dx * 10) + "deg");
        arte.style.setProperty("--rx", (dy * -8) + "deg");
      });
      $(".hero").addEventListener("pointerleave", () => { arte.style.setProperty("--ry", "0deg"); arte.style.setProperty("--rx", "0deg"); });
    }
  }

  /* Mapa: sinais que percorrem as linhas (offset-path a partir do "d" de cada linha) */
  const mapa = $(".brasil__mapa");
  const linhas = $$(".mapa__linhas path");
  if (mapa && linhas.length && CSS.supports("offset-path", "path('M0 0')")) {
    const svg = $(".mapa");
    const escolhidas = linhas.filter((_, i) => i % 3 === 0).slice(0, 8);
    escolhidas.forEach((p, i) => {
      const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      dot.setAttribute("r", "2.2");
      dot.setAttribute("class", "mapa__sinal");
      dot.style.offsetPath = "path('" + p.getAttribute("d") + "')";
      dot.style.setProperty("--dur", (3.2 + (i % 4) * 0.9) + "s");
      dot.style.setProperty("--atraso", (i * 0.7) + "s");
      svg.append(dot);
    });
  }

  /* Paralaxe do mapa e listas da mídia em sequência */
  const tvLista = $("#tv-lista");
  const cartoes = $$(".cartoes");
  const marcar = (el) => [...el.children].forEach((c, i) => c.style.setProperty("--i", i));
  if (tvLista) marcar(tvLista);
  const obs = new IntersectionObserver((ents) => ents.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("ligado"); obs.unobserve(en.target); } }), { threshold: 0.1 });
  if (tvLista) obs.observe(tvLista);
  cartoes.forEach((c) => { marcar(c); obs.observe(c); });
  // os cortes são re-renderizados ao trocar o tema: marca de novo
  new MutationObserver(() => $$(".cartoes").forEach((c) => { marcar(c); c.classList.add("ligado"); })).observe($("#episodios") || document.body, { childList: true, subtree: true });

  let pedido = 0;
  window.addEventListener("scroll", () => {
    if (pedido || !mapa) return;
    pedido = requestAnimationFrame(() => {
      pedido = 0;
      const r = mapa.getBoundingClientRect();
      const centro = (r.top + r.height / 2 - window.innerHeight / 2) / window.innerHeight;
      mapa.style.setProperty("--par", (centro * 40).toFixed(1));
    });
  }, { passive: true });

  /* Equipe: retrato em 3D leve */
  if (mouse) $$(".membro__retrato").forEach((el) => {
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--ry", (((e.clientX - r.left) / r.width - 0.5) * 12) + "deg");
      el.style.setProperty("--rx", (((e.clientY - r.top) / r.height - 0.5) * -10) + "deg");
    });
    el.addEventListener("pointerleave", () => { el.style.setProperty("--ry", "0deg"); el.style.setProperty("--rx", "0deg"); });
  });
})();
