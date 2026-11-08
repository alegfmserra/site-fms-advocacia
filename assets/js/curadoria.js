// Curadoria da seção "Na Mídia" — EDITADO À MÃO.
// Os dados brutos (episódios = playlists do canal, e shorts) vêm de assets/js/videos.js,
// gerado por `node scripts/atualizar-videos.js`. Aqui se decide o que aparece e em qual tema.
//
// - temas: na ordem em que aparecem; o primeiro abre selecionado.
//   - episodios: ids de playlist (episódios do Programa Saudações) daquele tema.
//   - shorts:    expressão que escolhe, entre os shorts avulsos, os cortes daquele tema.
// - excluir: shorts com estes termos nunca aparecem (seguro-defeso NÃO é área do escritório:
//   é pauta do programa, não deve ser apresentada como atuação).
// - titulos: troca o título de um episódio quando o da playlist não serve para o site.

window.CURADORIA = {
  excluir: "defeso|pescador|pesca|peixe|\\brgp\\b",

  titulos: {
    PLHIi0FBw0T5eSRZkyuuLHupFqHDqZ19tR: "Entrevista com o Dr. Vitor Moreira Serra e o Dr. Moreira Serra",
    PLHIi0FBw0T5dMqEYRm0JlNYk14IlQ0DH5: "Informação jurídica",
  },

  temas: [
    {
      id: "militar",
      rotulo: "Direito Militar",
      episodios: ["PLHIi0FBw0T5eSRZkyuuLHupFqHDqZ19tR", "PLHIi0FBw0T5egsIdsT0olNznH2TRrIMKZ"],
      shorts: "concurso|delegado|pol[ií]cia|policial|prova|concurseiro|sonhos|militar",
      shortsRotulo: "Cortes · concursos e carreiras policiais",
    },
    {
      id: "apostas",
      rotulo: "Apostas e superendividamento",
      episodios: ["PLHIi0FBw0T5ewdkaX_9lz7GaPfQ0aU2MO"],
      shorts: "ludopatia|aposta|\\bbets?\\b|superendivid",
      shortsRotulo: "Cortes · ludopatia e apostas on-line",
    },
    {
      id: "saude",
      rotulo: "Saúde e trabalho",
      episodios: ["PLHIi0FBw0T5dMqEYRm0JlNYk14IlQ0DH5", "PLLv_PWJppPA8"],
    },
    {
      id: "advocacia",
      rotulo: "Golpes e abuso de autoridade",
      episodios: ["PLHIi0FBw0T5e9ZvIqFpxAFytFl9ODWQ0C", "PLHIi0FBw0T5d_QrKuI3yhbyxINpjvfwPb"],
    },
    {
      id: "sociedade",
      rotulo: "Justiça e sociedade",
      episodios: ["PLHIi0FBw0T5dzha9OMl54OoMAKq7eUxP2", "PLC_iYpUGiq28", "PLHIi0FBw0T5d3kxvnb3O8y0iogxSajjXD"],
      shorts: "direitos fundamentais|intelig[eê]ncia artificial|seguran[çc]a p[uú]blica|contas essenciais",
      shortsRotulo: "Cortes · direito e sociedade",
    },
  ],
};
