# Identidade visual — Demo 2 "Clínica Movimento"

Direção: **calma e confiança**, próprio de serviço de saúde.

A escolha é deliberadamente oposta à da Demo 1 (landing de infoproduto),
que usa laranja quente, selos de urgência e preço em destaque. Duas peças
no mesmo portfólio só demonstram versatilidade se forem visualmente
distintas de verdade — e não o mesmo layout repintado.

| | Demo 1 — infoproduto | Demo 2 — clínica |
|---|---|---|
| Cor | Laranja `#C2410C` | Teal `#0F766E` |
| Temperatura | Quente | Fria |
| Densidade | Alta, seções cheias | Baixa, muito respiro |
| Tom | Urgência e prova social | Sobriedade e processo |
| Meta | Conversão imediata | Confiança para agendar |

Todos os pares abaixo foram medidos com `build/check-contrast.mjs`.

---

## Paleta

| Token | Hex | Uso |
|---|---|---|
| `ink` | `#0F172A` | Texto principal, títulos |
| `ink-soft` | `#475569` | Texto de apoio |
| `surface` | `#FFFFFF` | Fundo padrão |
| `surface-alt` | `#F8FAFC` | Fundo de seções alternadas |
| `surface-deep` | `#134E4A` | Rodapé e seção de chamada final |
| `primary` | `#0F766E` | Botões, links, ícones |
| `primary-hover` | `#115E59` | Estado hover e foco |
| `primary-tint` | `#F0FDFA` | Fundo de selo e de ícone |
| `accent` | `#0E7490` | Detalhes, uso pontual |
| `success` | `#15803D` | Confirmações |
| `whatsapp` | `#075E54` | Botão flutuante |
| `border` | `#E2E8F0` | Bordas e divisores — **nunca como cor de texto** |

## Contraste medido

| Par | Ratio | Mínimo AA | Resultado |
|---|---|---|---|
| Texto corpo sobre branco | 17,85:1 | 4,5 | AAA |
| Texto de apoio sobre branco | 7,58:1 | 4,5 | AAA |
| Texto corpo sobre `surface-alt` | 17,06:1 | 4,5 | AAA |
| Texto de apoio sobre `surface-alt` | 7,24:1 | 4,5 | AAA |
| Branco sobre botão `primary` | 5,47:1 | 4,5 | AA |
| Branco sobre `primary-hover` | 7,58:1 | 4,5 | AAA |
| `primary` como link sobre branco | 5,47:1 | 4,5 | AA |
| `primary` sobre `primary-tint` (selo) | 5,25:1 | 4,5 | AA |
| Branco sobre `surface-deep` | 9,48:1 | 4,5 | AAA |
| `accent` sobre branco | 5,36:1 | 4,5 | AA |
| Branco sobre `whatsapp` | 7,67:1 | 4,5 | AAA |

### Duas restrições

**1. O `border` nunca é cor de texto.** Mede 1,18:1 sobre `surface-alt`. Na
demo 1 ele foi usado no separador do rodapé e reprovou. Divisor é divisor;
texto secundário usa `ink-soft`.

**2. O botão de WhatsApp usa o verde escuro `#075E54`, não o claro.** O
`#128C7E` mede 4,14:1 com texto branco, que passaria no critério de
componente gráfico (3,0) mas reprova no de texto (4,5) — e o botão tem
rótulo escrito. Lição herdada da demo 1: escolher o critério pelo conteúdo
real do componente.

---

## Como auditar o contraste de verdade

**Passar no `check-contrast.mjs` é necessário, mas não é suficiente.**

Na demo 1 o Lighthouse acusou 74 elementos reprovados numa página cuja
paleta passava limpa no script. A paleta estava certa; o que estava errado
era o que o navegador pintava — o kit global do Elementor aplicava
`#7A7A7A` (4,29:1) em todo widget de texto, por cima do nosso CSS.

O script vê as cores que escolhemos. Ele não vê as que um plugin injeta.

1. **Ao escolher cores:** `node build/check-contrast.mjs`
2. **Antes de dar como pronto:** auditar as 4 páginas renderizadas no
   navegador

Na segunda etapa, varra todo elemento de texto visível, calcule o contraste
contra o fundo **composto** — subindo a árvore até achar cor opaca e
compondo as camadas com alpha — e compare com 3,0 para texto grande (≥24px,
ou ≥18,66px em negrito) e 4,5 para o resto.

Dois detalhes que geraram falso positivo e falso negativo na demo 1:
**componha o alpha** (senão um selo translúcido vira "cor sobre ela mesma")
e **exclua o `#wpadminbar`** (que o visitante nunca vê).

Meta: zero falha nas quatro páginas.

---

## Tipografia

**Inter**, pesos 400 e 700, servida localmente. Cada peso extra é um arquivo
a mais no caminho crítico.

| Elemento | Mobile | Desktop | Peso | Entrelinha |
|---|---|---|---|---|
| H1 | 32px | 50px | 700 | 1,12 |
| H2 | 26px | 36px | 700 | 1,2 |
| H3 | 18px | 20px | 700 | 1,35 |
| Corpo | 16px | 17px | 400 | 1,65 |
| Lead | 17px | 19px | 400 | 1,6 |
| Nota e legal | 14px | 14px | 400 | 1,55 |

Entrelinha de 1,65 no corpo, mais generosa que os 1,6 da demo 1: texto
clínico é lido com mais atenção e menos varredura.

---

## Espaçamento e layout

Escala de 8px. Largura máxima do conteúdo: 1160px. Bloco de texto corrido
limitado a 680px.

| Contexto | Mobile | Desktop |
|---|---|---|
| Padding vertical de seção | 56px | 96px |
| Padding horizontal | 20px | 24px |
| Altura do cabeçalho | 72px | 80px |
| Espaço entre cards | 16px | 24px |

**Grade:** 1 coluna no celular, 2 no tablet, 3 no desktop. As cinco etapas
da jornada viram 5 colunas só a partir de 1024px; abaixo disso, 2 e depois 1.

---

## Cabeçalho

Fixo no topo (`position: sticky`) com fundo translúcido e desfoque. A partir
de 900px aparecem o menu horizontal e o botão de agendamento; abaixo disso,
o botão de menu.

O menu do celular é um `<details>` nativo — sem JavaScript. A página inteira
não carrega um byte de JS próprio.

---

## Imagens

| Slot | Proporção | Entrega | Formato |
|---|---|---|---|
| Hero da home | 4:3 | 960×720 | WebP |
| Foto da equipe | 1:1 | 600×600 | WebP |
| Estrutura | 4:3 | 800×600 | WebP |

A imagem do hero é o LCP e recebe `fetchpriority="high"` sem lazy, aplicado
pelo `functions.php`. Todas as outras ficam lazy.

**Sobre foto de paciente:** não usar, em hipótese alguma. A publicidade em
saúde proíbe, e mesmo com autorização escrita o risco não compensa. As fotos
são de ambiente e de equipe.

---

## Modo escuro

Fora de escopo, como na demo 1. Site institucional com uma direção visual
controlada; suporte a tema escuro aqui só adicionaria risco de contraste.
