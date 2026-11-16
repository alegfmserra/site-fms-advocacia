// Fotos da equipe — EDITADO À MÃO.
// Para cada advogado: o retrato (foto em pé, de preferência 4:5, mínimo 800 px de largura) e a faixa de "momentos"
// (fotos horizontais ou quadradas: palestras, eventos militares e jurídicos, bancada do programa, escritório).
// Caminhos relativos à raiz do site. Guardar as fotos em assets/img/equipe/ (JPG otimizado, até ~300 KB cada).
//
// Regras:
// - Sem retrato → aparece a marca do escritório no lugar. Sem momentos → a faixa não aparece (nada fica vazio).
// - Só fotos com direito de uso. Cliente em foto só com autorização e sem identificá-lo.
// - "legenda": onde e quando, em poucas palavras. "alt": descrição curta para leitores de tela.

window.EQUIPE = {
  walmir: {
    retrato: "",
    momentos: [
      // { src: "assets/img/equipe/walmir-saudacoes.jpg", legenda: "No Programa Saudações, Band MA · 09/08/2026", alt: "Dr. Walmir na bancada do programa" },
    ],
  },
  vitor: {
    retrato: "",
    momentos: [
      // { src: "assets/img/equipe/vitor-palestra.jpg", legenda: "Palestra sobre Direito Militar", alt: "Dr. João Vitor falando em um auditório" },
      // { src: "assets/img/equipe/vitor-farda.jpg", legenda: "Solenidade do Exército", alt: "Dr. João Vitor fardado" },
      // { src: "assets/img/equipe/vitor-bancada.jpg", legenda: "Bancada do Programa Saudações", alt: "Dr. João Vitor apresentando o programa" },
    ],
  },
  will: {
    retrato: "",
    momentos: [],
  },
};
