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
