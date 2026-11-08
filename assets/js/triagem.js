// Conteúdo da triagem "Qual é o seu caso?" — EDITADO À MÃO.
// Regras (Provimento 205/2021 da OAB): texto só informativo; sem promessa de resultado,
// sem valores, sem "você vai ganhar". Cada caso termina convidando para a consulta.
// - curto: texto do botão (curto); rotulo: frase completa que vira o título do painel
// - area: valor do campo "tema" do formulário (Saúde | Militar | Cível/Empresarial | Outro)
// - video: id de um corte do canal (opcional) que ajuda a entender o assunto.

window.TRIAGEM = [
  {
    grupo: "Saúde",
    icone: "saude",
    casos: [
      {
        id: "plano-negou",
        curto: "Plano negou cobertura",
        area: "Saúde",
        rotulo: "O plano de saúde negou cirurgia, exame ou tratamento",
        saiba: [
          "Peça ao plano a negativa por escrito, com o motivo. A operadora é obrigada a fornecê-la.",
          "A lista de coberturas da ANS (o “rol”) não encerra a discussão em todos os casos: a lei admite cobertura fora dela em certas condições.",
          "Em situações de urgência, a Justiça pode analisar o pedido com rapidez (tutela de urgência).",
        ],
        docs: ["Carteirinha e contrato do plano", "Relatório e prescrição do médico, bem detalhados", "Negativa por escrito ou número de protocolo", "Comprovantes de pagamento das mensalidades"],
        video: "6-pdx7qhILw",
      },
      {
        id: "medicamento",
        curto: "Medicamento ou home care",
        area: "Saúde",
        rotulo: "Preciso de medicamento de alto custo ou home care",
        saiba: [
          "O pedido pode ser feito ao plano de saúde ou, pelo SUS, ao poder público.",
          "O relatório médico é a peça central: ele deve explicar por que aquele tratamento é necessário e por que as alternativas não servem.",
        ],
        docs: ["Relatório médico detalhado e receita", "Exames que comprovem o diagnóstico", "Negativa ou protocolo do pedido", "Cartão do SUS e comprovante de residência (se for pelo SUS)"],
        video: "6-pdx7qhILw",
      },
      {
        id: "reajuste",
        curto: "Reajuste ou cancelamento",
        area: "Saúde",
        rotulo: "Meu plano teve reajuste muito alto ou foi cancelado",
        saiba: [
          "Planos individuais têm teto de reajuste definido pela ANS; nos coletivos, o aumento precisa ser justificado.",
          "O cancelamento pela operadora segue regras, e há proteções específicas para quem está em tratamento.",
        ],
        docs: ["Contrato do plano", "Boletos dos últimos anos", "Carta ou mensagem de reajuste ou cancelamento"],
      },
    ],
  },
  {
    grupo: "Militares e servidores",
    icone: "militar",
    casos: [
      {
        id: "militar",
        curto: "Direitos da carreira",
        area: "Militar",
        rotulo: "Sou ou fui militar e tenho dúvidas sobre direitos da carreira",
        saiba: [
          "Muitas demandas envolvem verbas como auxílio-fardamento, 13º e férias de cursos de formação (NPOR, EIPOT, EIC), além de promoção, licenciamento e reforma.",
          "Prazo importa: direitos com reflexo financeiro contra a União costumam prescrever em 5 anos.",
        ],
        docs: ["Identidade militar", "Contracheques do período", "Boletins e publicações sobre você", "Documentos do curso de formação, se houver"],
        video: "r3f9qkuQtSM",
      },
      {
        id: "pad",
        curto: "Sindicância ou PAD",
        area: "Militar",
        rotulo: "Respondo a sindicância ou processo disciplinar",
        saiba: [
          "Você tem direito a defesa e pode ser acompanhado por advogado desde o início.",
          "Os prazos de defesa costumam ser curtos: procure orientação assim que for notificado.",
        ],
        docs: ["Notificação ou portaria que abriu o processo", "Cópia dos autos, se já tiver", "Documentos e nomes de testemunhas a seu favor"],
      },
      {
        id: "concurso",
        curto: "Concurso público",
        area: "Militar",
        rotulo: "Fui eliminado ou prejudicado em concurso público",
        saiba: [
          "Eliminações em exame de saúde, teste físico, investigação social ou correção de prova podem ser questionadas quando contrariam a lei ou o edital.",
          "Os prazos de recurso administrativo são curtos.",
        ],
        docs: ["Edital e anexos", "Resultado ou ato de eliminação", "Recursos que você já apresentou", "Laudos e exames, se o motivo foi de saúde"],
        video: "IELwYf3w-pU",
      },
    ],
  },
  {
    grupo: "Cível e consumidor",
    icone: "civel",
    casos: [
      {
        id: "apostas",
        curto: "Dívidas por apostas",
        area: "Cível/Empresarial",
        rotulo: "Apostas on-line geraram dívidas (minhas ou de alguém da família)",
        saiba: [
          "O vício em jogo (ludopatia) é reconhecido como doença.",
          "As casas de apostas têm deveres de jogo responsável; a regulamentação federal prevê mecanismos como a autoexclusão.",
          "Para o superendividamento, a lei prevê caminhos para renegociar dívidas preservando o mínimo para viver.",
        ],
        docs: ["Extratos bancários e de PIX para as plataformas", "Prints das contas nas plataformas", "Relatórios médicos ou psicológicos, se houver", "Lista das dívidas atuais"],
        video: "k9apYOr_2uk",
      },
      {
        id: "contrato",
        curto: "Contrato, banco ou empresa",
        area: "Cível/Empresarial",
        rotulo: "Tenho problema com contrato, banco ou empresa",
        saiba: [
          "Cláusulas abusivas podem ser revistas, especialmente em relações de consumo.",
          "Guarde tudo por escrito: protocolos, e-mails e conversas fazem diferença.",
        ],
        docs: ["Contrato ou termos aceitos", "Comprovantes de pagamento", "Protocolos de atendimento", "Conversas e e-mails trocados"],
        video: "J8OWkG6spWI",
      },
    ],
  },
  {
    grupo: "Outros",
    icone: "outros",
    casos: [
      {
        id: "golpe",
        curto: "Golpe do falso advogado",
        area: "Outro",
        rotulo: "Recebi mensagem de “advogado” dizendo que ganhei um processo",
        saiba: [
          "Golpistas usam nome e foto de advogados reais e dados verdadeiros de processos.",
          "Desconfie de qualquer pedido de pagamento para “liberar” valores e confirme sempre pelos canais oficiais do escritório, que estão neste site.",
        ],
        docs: ["Prints da conversa", "Número de telefone ou perfil que fez o contato", "Comprovante, se chegou a pagar algo"],
        video: "UmLHmDRwxvw",
      },
      {
        id: "outro",
        curto: "Outra situação",
        area: "Outro",
        rotulo: "Minha situação é outra",
        saiba: [
          "Nem todo caso cabe numa lista. Conte o que aconteceu, com suas palavras, e dizemos se e como podemos ajudar.",
        ],
        docs: ["O que você tiver: documentos, prints, datas importantes"],
      },
    ],
  },
];
