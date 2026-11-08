(() => {
  "use strict";
  const WHATS = "5598984115013";
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

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
  $$(".escritorio > *, .escudo, .pessoa, .midia__cab, .player, .agenda").forEach((el) => {
    el.classList.add("revela");
    revObs.observe(el);
  });

  /* ---------- Na Mídia: galeria do YouTube ---------- */
  const videos = Array.isArray(window.VIDEOS) ? window.VIDEOS : [];
  const lista = $("#cartoes");
  const player = $("#player");
  const thumb = (id) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
  let atual = videos.find((v) => v.id === window.DESTAQUE_ID) || videos[0];

  function mostrarNoPlayer(v, tocar) {
    if (!v) return;
    atual = v;
    $("#player-titulo").textContent = v.titulo;
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
      const capa = $(".player__capa", player);
      capa.hidden = false;
      $("#player-img").src = thumb(v.id);
    }
    $$(".cartao", lista).forEach((c) => c.classList.toggle("ativo", c.dataset.id === v.id));
  }

  function renderizar(filtro) {
    const itens = videos.filter((v) => filtro === "todos" || v.tema === filtro);
    lista.innerHTML = "";
    itens.forEach((v) => {
      const li = document.createElement("li");
      li.className = "cartao";
      li.dataset.id = v.id;
      const b = document.createElement("button");
      b.type = "button";
      b.setAttribute("aria-label", "Assistir: " + v.titulo);
      const img = document.createElement("img");
      img.loading = "lazy";
      img.alt = "";
      img.src = thumb(v.id);
      const t = document.createElement("span");
      t.className = "cartao__titulo";
      t.textContent = v.titulo;
      const marca = document.createElement("span");
      marca.className = "cartao__v";
      marca.setAttribute("aria-hidden", "true");
      marca.textContent = "V";
      b.append(img, t, marca);
      b.addEventListener("click", () => {
        mostrarNoPlayer(v, true);
        if (window.innerWidth < 1080) player.scrollIntoView({ behavior: "smooth", block: "center" });
      });
      li.append(b);
      lista.append(li);
    });
    lista.scrollLeft = 0;
    $$(".cartao", lista).forEach((c) => c.classList.toggle("ativo", atual && c.dataset.id === atual.id));
  }

  if (videos.length) {
    mostrarNoPlayer(atual, false);
    $(".player__capa", player).addEventListener("click", () => mostrarNoPlayer(atual, true));
    renderizar("todos");
    $$(".filtros button").forEach((bt) => bt.addEventListener("click", () => {
      $$(".filtros button").forEach((x) => x.setAttribute("aria-selected", String(x === bt)));
      renderizar(bt.dataset.filtro);
    }));
    $$(".seta").forEach((s) => s.addEventListener("click", () => {
      lista.scrollBy({ left: Number(s.dataset.dir) * lista.clientWidth * 0.9, behavior: "smooth" });
    }));
  } else {
    $("#midia .midia").hidden = true;
  }

  /* ---------- Agendamento → WhatsApp ---------- */
  const form = $("#agenda");
  const erro = $("#agenda-erro");
  const passos = $$(".agenda__passos li");
  const blocos = $$(".agenda__bloco", form);

  // "Entender meu caso" já marca o tema no formulário
  $$("[data-tema]").forEach((a) => a.addEventListener("click", () => {
    const r = $(`input[name="tema"][value="${a.dataset.tema}"]`, form);
    if (r) { r.checked = true; atualizarPassos(); }
  }));

  // Data mínima = hoje
  const hoje = new Date();
  hoje.setMinutes(hoje.getMinutes() - hoje.getTimezoneOffset());
  form.data.min = hoje.toISOString().slice(0, 10);

  function atualizarPassos() {
    const temTema = !!form.tema.value;
    const temDados = form.nome.value.trim() && form.whats.value.trim();
    const etapa = !temTema ? 0 : !temDados ? (document.activeElement && blocos[2].contains(document.activeElement) ? 2 : 1) : 2;
    passos.forEach((p, i) => p.classList.toggle("ativo", i === etapa));
  }
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
    window.open(`https://wa.me/${WHATS}?text=${encodeURIComponent(linhas.join("\n"))}`, "_blank", "noopener");
  });

  const ano = $("#ano");
  if (ano) ano.textContent = new Date().getFullYear();
})();
