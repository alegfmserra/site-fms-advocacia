# Site do Escritório — Ferreira & Moreira Serra Advogados Associados

> Instruções para o Claude trabalhar neste repositório. Este é o **site institucional** do escritório (não confundir com `../Advogado/`, que é a frente de peças processuais).

## O que é

- Site **estático** (HTML + CSS + JS puros, sem build), publicado no **GitHub Pages** a partir da branch `main`.
- Página única (`index.html`) com seções: Início · Escritório · Atuação · Equipe · Na Mídia · Contato.
- Conteúdo de vídeo vem do canal do YouTube do Dr. João Vitor (Vitor Moreira Serra): `https://www.youtube.com/channel/UC1i2CtfxY4VRL4IqHbAFFnQ` (@vitormoreiraserra_adv).

## Estrutura

| Caminho | O que é |
|---|---|
| `index.html` | A página inteira. Textos ficam aqui. |
| `assets/css/style.css` | Todo o visual. Cores e fontes em variáveis no `:root`. |
| `assets/js/main.js` | Menu mobile, galeria de vídeos, formulário de agendamento (abre o WhatsApp). |
| `assets/js/videos.js` | **Lista de vídeos do canal** (gerada pelo script abaixo — não editar à mão, salvo destaque/tema). |
| `assets/img/` | Logo (`logo-fms.png`, azul transparente; no fundo escuro é invertido para branco via CSS). |
| `scripts/atualizar-videos.js` | Lê o canal no YouTube e regrava `assets/js/videos.js`. |
| `scripts/servir.js` | Servidor local para ver o site (porta 4321). |
| `Telas Sugeridas/` | Mockups de referência (Gemini). **Não publicados** (no `.gitignore`). |
| `Logomarca/` | Arquivos originais da logomarca (no `.gitignore`). |

## Comandos

```bash
# ver o site localmente (http://localhost:4321) — sem dependências
node scripts/servir.js
# atualizar a lista de vídeos a partir do YouTube
node scripts/atualizar-videos.js
```

## Identidade visual (fonte: skill `formatacao-fms` + telas sugeridas)

- **Azul-marinho** de fundo `#1E2C42` / profundo `#141F31`; **latão fosco** `#B89B6A` para destaques; **areia** `#EDE6DA` para seções claras.
- Títulos em **Spectral** (a fonte das petições do escritório); texto em **Source Sans 3**.
- Assinatura gráfica: o **escudo/pentágono com ponta em "V"** da logo — usado em cards, fotos e botões (`clip-path`).
- Tom: sóbrio, técnico, próximo. Frases curtas. Sem jargão desnecessário.

## Dados canônicos (não alterar sem ordem do Alexandre)

- Endereço: Av. dos Holandeses, 1, Qd. 32, s/n, 2º andar, Praia Shopping, Calhau, São Luís - MA, CEP 65070-835
- E-mail: vitorms@moreiraserraadv.com.br · Telefone/WhatsApp: (98) 98411-5013
- Advogado canônico: João Vitor Ferreira Moreira Serra, OAB/MA 31.763
- **Nunca** usar os dados fictícios que aparecem nos mockups (telefone 99123-4567, "Ed. Golden Tower", "OAB/MA 1.234-A", contato@fms.adv.br).

## Regras (gates)

1. **Não inventar** fato, número, credencial, depoimento, resultado ou artigo. Na dúvida, deixar fora do site e listar em *Pendências* abaixo.
2. **Publicidade da advocacia (Provimento 205/2021 da OAB e Código de Ética)**: caráter informativo; sem promessa de resultado, sem menção a valores/honorários ou gratuidade como captação, sem depoimentos de clientes, sem "o melhor/o mais". Revisar todo texto novo com esse filtro.
3. Vídeos sempre embutidos via `youtube-nocookie.com` e só carregados ao clique (não rastreia o visitante antes do play).
4. O formulário não guarda dados: ele monta uma mensagem e abre o WhatsApp do escritório.
5. Datas em ISO `AAAA-MM-DD` nos registros. Commits em português, descritivos.
6. Antes de publicar (push na `main`), abrir o site localmente e conferir desktop e celular.

## Pendências a confirmar com o Alexandre

- [ ] Equipe: os nomes **Walmir de Jesus Moreira Serra Júnior** e **Will Ferreira** e as descrições vieram dos mockups — confirmar nomes, OAB e áreas. Hoje estão no site com a marcação `data-confirmar`.
- [ ] Dr. João Vitor: confirmar "8 anos no Exército Brasileiro" (vem do mockup) antes de manter.
- [ ] "30 anos de advocacia" (mockup): só entrar com confirmação.
- [ ] Fotos profissionais da equipe (hoje: monograma no lugar da foto).
- [ ] Instagram do escritório (link do rodapé está desativado até ter o endereço).
- [ ] Domínio próprio (ex.: moreiraserraadv.com.br) apontando para o GitHub Pages.
- [ ] Seção de **Artigos**: só criar quando houver texto real assinado.
