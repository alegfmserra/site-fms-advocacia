# Site do Escritório — Ferreira & Moreira Serra Advogados Associados

> Instruções para o Claude trabalhar neste repositório. Este é o **site institucional** do escritório (não confundir com `../Advogado/`, que é a frente de peças processuais).

## O que é

- Site **estático** (HTML + CSS + JS puros, sem build), publicado no **GitHub Pages** a partir da branch `main`.
- Repositório: https://github.com/alegfmserra/site-fms-advocacia (público) · Site no ar: https://alegfmserra.github.io/site-fms-advocacia/ (Pages ativado em 2026-11-08; cada push na `main` republica em ~1 min).
- Página única (`index.html`) com seções: Início · faixa "Visto na Band" · Seu caso (triagem interativa) · letreiro · Atuação · Escritório · Como funciona · Equipe · Cinema (Programa Saudações) · Na Mídia · Dúvidas · Contato.
- Conteúdo de vídeo vem de dois canais do YouTube: o do Dr. João Vitor (`https://www.youtube.com/channel/UC1i2CtfxY4VRL4IqHbAFFnQ`, @vitormoreiraserra_adv — cortes e playlists por episódio) e o do **programa** (`https://www.youtube.com/@programasaudacoes` — episódios completos de domingo, em `window.COMPLETOS`).
- Redes: Instagram do Dr. Vitor `@_vserra`; do programa `@programasaudacoes` (Band MA; edição de domingo às 8h com o Dr. Vitor; o programa também tem edição de sábado às 9h com outros apresentadores — não atribuir ao Dr. Vitor). O escritório tem os termos de uso das imagens da Band.

## Estrutura

| Caminho | O que é |
|---|---|
| `index.html` | A página inteira. Textos ficam aqui. |
| `assets/css/style.css` | Todo o visual. Cores e fontes em variáveis no `:root`. |
| `assets/js/main.js` | Menu mobile, triagem "Seu caso", galeria de vídeos por tema, formulário de agendamento (abre o WhatsApp). |
| `assets/js/movimento.js` | **Efeitos visuais**: partículas e reflexo no topo, títulos que sobem, letreiro, escudos que inclinam, linha do Como funciona, parede de cortes do Cinema, botão do Google Agenda. Respeita "reduzir movimento" do sistema. |
| `assets/js/triagem.js` | **Conteúdo da triagem** (situações, "é bom saber", documentos, vídeo). Editado à mão — passar pelo filtro do Provimento 205. |
| `assets/js/curadoria.js` | **Curadoria da Na Mídia**: quais episódios (playlists) e cortes aparecem em cada tema, e a função dos convidados dos episódios completos (só o que está nas legendas do @programasaudacoes). Editado à mão. |
| `assets/js/videos.js` | Dados brutos do canal (episódios = playlists + shorts). **Gerado pelo script — não editar à mão.** |
| `assets/img/` | Logo (`logo-fms.png`, azul transparente; no fundo escuro é invertido para branco via CSS) e `og-fms.png` (imagem de compartilhamento 1200×630, usada no WhatsApp e nas redes). |
| `PAUTA-ARTIGOS.md` | Pauta de artigos a escrever, com a busca do Google que cada um atende. |
| `sitemap.xml`, `robots.txt` | SEO. Trocar o endereço quando entrar o domínio próprio. |
| `scripts/atualizar-videos.js` | Lê o canal no YouTube e regrava `assets/js/videos.js`. |
| `scripts/servir.js` | Servidor local para ver o site (porta 4321). |
| `Telas Sugeridas/` | Mockups de referência (Gemini). **Não publicados** (no `.gitignore`). |
| `Logomarca/` | Arquivos originais da logomarca (no `.gitignore`). |

## Comandos

```bash
# ver o site localmente (http://localhost:4321) — sem dependências
node scripts/servir.js
# atualizar episódios e cortes a partir do YouTube (depois, conferir curadoria.js:
# episódio novo só aparece no site quando o id da playlist entra num tema)
node scripts/atualizar-videos.js
```

## Agendamento pelo Google Agenda

- O e-mail do escritório (moreiraserraadv.com.br) é Google Workspace, então dá para usar o **Agendamento** do Google Agenda (página de horários livres).
- Para ligar: na agenda de quem vai atender, criar um *Agendamento* (duração, horários, antecedência, Meet automático), depois **Compartilhar → Incorporar no site** e copiar só o endereço do `src` (`https://calendar.google.com/calendar/appointments/schedules/...?gv=true`). Colar em `data-url` do `#agenda-google` no `index.html` (seção Contato).
- Com o `data-url` vazio, o botão não aparece (regra 8). O formulário do WhatsApp continua como alternativa.

## Identidade visual (fonte: skill `formatacao-fms` + telas sugeridas)

- **Azul-marinho** de fundo `#1E2C42` / profundo `#141F31`; **latão fosco** `#B89B6A` para destaques; **areia** `#EDE6DA` para seções claras.
- Títulos em **Spectral** (a fonte das petições do escritório); texto em **Source Sans 3**.
- Assinatura gráfica: o **escudo/pentágono com ponta em "V"** da logo — usado em cards, fotos e botões (`clip-path`).
- Tom: sóbrio, técnico, próximo. Frases curtas. Sem jargão desnecessário.
- Movimento: discreto e em latão (luz, poeira, linhas que se desenham). Nada de vídeo de banco de imagens genérico; vídeo de fundo só com material real do escritório/programa, comprimido e servido do próprio site (sem player do YouTube em autoplay — regra 3).

## Dados canônicos (não alterar sem ordem do Alexandre)

- Endereço: Av. dos Holandeses, 1, Qd. 32, s/n, 2º andar, Praia Shopping, Calhau, São Luís - MA, CEP 65070-835
- E-mail: vitorms@moreiraserraadv.com.br · Telefone/WhatsApp: (98) 98411-5013
- Advogado canônico: João Vitor Ferreira Moreira Serra, OAB/MA 31.763. Credenciais conforme a bio pública do @_vserra (lida em 2026-11-09): advogado e professor; 1º Tenente R/2 do Exército Brasileiro; especialista em Direito Penal e Criminologia; especialista em Direito Militar.
- Walmir de Jesus Moreira Serra Júnior ("Dr. Moreira Serra"), OAB/MA 4.182, confirmado pelo Alexandre em 2026-11-08
- Will Ferreira (Dra.), OAB/MA 15.763, confirmado em 2026-11-08. Nome completo informado por áudio como "Ada Maria Wilsonira Batista Ferreira": **grafia a confirmar**, por isso o site usa só "Will Ferreira".
- **Seguro-defeso não é área do escritório**: é pauta do Programa Saudações. Não apresentar como atuação; os cortes sobre o tema ficam fora do site (filtro `excluir` em `curadoria.js`).
- **Nunca** usar os dados fictícios que aparecem nos mockups (telefone 99123-4567, "Ed. Golden Tower", "OAB/MA 1.234-A", contato@fms.adv.br).

## Regras (gates)

1. **Não inventar** fato, número, credencial, depoimento, resultado ou artigo. Na dúvida, deixar fora do site e listar em *Pendências* abaixo.
2. **Publicidade da advocacia (Provimento 205/2021 da OAB e Código de Ética)**: caráter informativo; sem promessa de resultado, sem menção a valores/honorários ou gratuidade como captação, sem depoimentos de clientes, sem "o melhor/o mais". Revisar todo texto novo com esse filtro.
3. Vídeos sempre embutidos via `youtube-nocookie.com` e só carregados ao clique (não rastreia o visitante antes do play).
4. O formulário não guarda dados: ele monta uma mensagem e abre o WhatsApp do escritório.
5. Datas em ISO `AAAA-MM-DD` nos registros. Commits em português, descritivos.
6. Antes de publicar (push na `main`), abrir o site localmente e conferir desktop e celular.
7. **Cache**: o GitHub Pages guarda CSS/JS por 10 min no navegador do visitante. A cada publicação que mexa em CSS ou JS, trocar o `?v=` dos `<link>`/`<script>` no `index.html` (ex.: `?v=20261108b` → `?v=20261109a`). Sem isso, quem já visitou recebe página nova com script velho (foi o que deixou a triagem vazia em 2026-11-08).
8. Nada de seção ou painel que apareça vazio: todo componente interativo abre já com conteúdo (ex.: a triagem abre no primeiro caso).

## Próximas etapas (combinadas com o Alexandre em 2026-11-09)

1. **Blog / Artigos** — PRÓXIMA PRIORIDADE. Seção de artigos para ganhar cliques no Google: uma página por artigo (HTML estático com título, descrição, data, autor e dados estruturados `Article`), lista em `/artigos/`, link no menu e no sitemap. Pauta pronta em `PAUTA-ARTIGOS.md`. Texto só entra assinado e revisado por advogado do escritório (regra 1).
2. **Vídeos do Programa Saudações no site** — o escritório tem os termos de uso das imagens da Band (confirmado em 2026-11-09). Fazer recortes curtos (10–20 s, sem som, em loop) para o fundo do topo e da faixa Cinema, a partir dos **arquivos originais** (não baixar do YouTube). ffmpeg disponível na máquina. Meta: MP4 H.264 + WebM, até ~3 MB cada, com imagem de capa (poster) e pausa com "reduzir movimento".
3. **Agendamento pelo Google Agenda** — viável (ver seção acima); fica para depois.

## Pendências a confirmar com o Alexandre

- [x] OABs da equipe confirmadas (2026-11-08): Walmir 4.182 · Will 15.763.
- [ ] Equipe: as **áreas/descrições** do Dr. Walmir ("Processo Civil e Direito à Saúde · Jornalista") e da Dra. Will ("Direito à Saúde") vieram dos mockups; estão marcadas com `data-confirmar`.
- [ ] Grafia do nome completo da Dra. Will Ferreira.
- [ ] Dr. João Vitor: "1º Tenente R/2" já está no site (fonte: bio do Instagram); o "8 anos no Exército" do mockup continua sem confirmação.
- [ ] "30 anos de advocacia" (mockup): só entrar com confirmação.
- [ ] Fotos profissionais da equipe (hoje: monograma no lugar da foto). O Alexandre vai solicitar.
- [ ] Instagram do Dr. Vitor: conferir se há playlists/destaques por tema que valham entrar na curadoria (exige login; ainda não acessado).
- [ ] Instagram do escritório (link do rodapé está desativado até ter o endereço).
- [ ] Domínio próprio (ex.: moreiraserraadv.com.br) apontando para o GitHub Pages. Ao trocar: atualizar canonical, og:url, og:image e JSON-LD do `index.html`, `sitemap.xml` e `robots.txt`; cadastrar no Google Search Console e enviar o sitemap.
- [ ] Perfil da Empresa no Google (Google Meu Negócio) com o endereço do Praia Shopping e link para o site.
- [ ] Link do **Agendamento do Google Agenda** (do Dr. Vitor ou do Alexandre) para ativar o botão "Escolher horário na agenda".
- [ ] Arquivos originais dos episódios do Programa Saudações (ou pasta com eles) para os recortes de vídeo. Direito de uso: confirmado.
- [ ] Seção de **Artigos**: só criar quando houver texto real assinado (pauta em `PAUTA-ARTIGOS.md`).
