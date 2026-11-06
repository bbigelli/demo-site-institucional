# Status: demo-site-institucional

## Fase atual: Entregáveis de código concluídos — aguardando montagem no LocalWP
## Último agente: Claude principal (sessão de 2026-11-06)
## Branch: main

---

## Contexto

Projeto 2 de 4 do conjunto de demonstrações para captação no 99Freelas.
Nicho fictício: **Clínica Movimento**, fisioterapia e reabilitação em
Pinheiros, São Paulo. Quatro páginas: Início, Sobre, Serviços e Contato.

Decisões herdadas da sessão do projeto 1:

- **Hospedagem:** LocalWP para desenvolver, Vercel para publicar o estático
- **Montagem:** templates Elementor em JSON, importados pelo dev
- **Elementor gratuito** — nenhum widget Pro
- **Um repositório Git por projeto**

Estimativa do projeto 2: **4,5h a 6h**, sendo ~3h do assistente.

---

## Sessão 2026-11-06 ✅

### Concluído

- Repositório, `git init` em `main` e identidade git fixada ✅
- Utilitários reaproveitados do projeto 1, **já com as correções**:
  `elementor-kit.mjs`, `prune-static.mjs`, `pack-theme.ps1`, `vercel.json` ✅
- `build/check-contrast.mjs` — paleta teal, 14 pares medidos ✅
- `build/content.json` — copy das 4 páginas, 1.500 palavras ✅
- `build/generate-elementor.mjs` — gera e valida os 4 templates ✅
- `elementor/{home,sobre,servicos,contato}.json` — gerados e validados ✅
- `child-theme/style.css` — visual, cabeçalho, rodapé, 272 classes ✅
- `child-theme/functions.php` — navegação, rodapé, WhatsApp, GA4 opcional,
  JSON-LD de busca local, remoção de assets, prioridade do hero ✅
- `README.md`, `CLAUDE.md`, `docs/identidade-visual.md` ✅

### Verificações executadas

| O que | Como | Resultado |
|---|---|---|
| Contraste da paleta | `node build/check-contrast.mjs` | 14 pares; só os 2 marcados AVOID reprovam |
| Validade dos templates | validação dentro do gerador | 284 ids únicos entre as 4 páginas, nenhum problema |
| Regras do Elementor | validador recusa `boxed` e `_css_classes` em container | passou |
| Estrutura do PHP | balanceamento, hooks, escapes | 32/32 chaves, 182/182 parênteses, 22 escapes |
| Encoding | `file` + grep | UTF-8 em todos; acentuação íntegra |
| Resíduos do projeto 1 | grep por `tc-` | zero |

### Números dos templates

| Página | Seções | Containers | Widgets | KB |
|---|---|---|---|---|
| home | 7 | 42 | 61 | 37,6 |
| sobre | 6 | 29 | 47 | 28,1 |
| servicos | 4 | 17 | 33 | 20,1 |
| contato | 4 | 21 | 34 | 20,2 |

Widgets usados: heading 72, text-editor 83, button 13, image 5,
google_maps 2. Nenhum widget de ícone, como no projeto 1 — o Font Awesome
continua podendo ser removido.

---

## O que este projeto faz diferente do projeto 1

- **Quatro páginas**, com cabeçalho de navegação e estado de página atual
- **Cabeçalho e rodapé em PHP**, porque o construtor de temas é Pro
- **Menu do celular sem JavaScript**, usando `<details>` nativo
- **Mapa** pelo widget `google_maps`, que não exige chave de API
- **JSON-LD `MedicalClinic`** com endereço, telefone e horário, para busca
  local
- **GA4 opcional** por constante, no lugar do Pixel da Meta
- **Copy em conformidade** com a publicidade em saúde do COFFITO/CFM
- `prune-static.mjs` adaptado para partir de **todas** as páginas, não só
  do index

### As seis armadilhas do Elementor já nascem resolvidas

O gerador valida e reprova o build se alguma voltar. É o ganho concreto do
projeto 1: lá elas custaram três rodadas de reimportação e uma publicação
com 74 falhas de contraste.

---

## Blockers

Nenhum blocker de código. O que falta depende de ação manual:

- Site não montado no LocalWP ainda — sem isso não há como validar o PHP
  nem medir performance
- Fontes Inter ausentes (binário não vai para o repositório). O site não
  quebra: cai para a fonte do sistema

---

## Pendências técnicas

- `php -l` não executado — não há PHP na máquina. Validação foi estrutural
- Imagens são placeholder do Elementor; por isso ficam com `alt` vazio
- `hero_image` em `fm_config()` vazio; preencher após subir a imagem real
- **Auditoria de contraste no navegador ainda não feita** — a paleta passa,
  mas a lição do projeto 1 é que isso não basta. Fazer nas 4 páginas antes
  de dar como pronto
- Nota de PageSpeed não medida
- Nenhum commit ainda — arquivos aguardando

---

## Próximo passo

1. **Dev:** montar no LocalWP — criar o site, instalar Hello Elementor e
   Elementor, subir o child theme, criar as 4 páginas com os slugs
   `sobre`, `servicos` e `contato`, definir a home, importar os 4 templates
   e aplicar layout Canvas em todas
2. **Assistente:** auditar contraste e layout das 4 páginas no navegador,
   corrigir o que aparecer, exportar e publicar na Vercel
