# CLAUDE.md — Demo 2: Site institucional

Complementa o CLAUDE.md global. Só o que é específico deste repositório.

## O que este projeto é

Peça de portfólio para captação no 99Freelas, não produto. Demonstra site
institucional de profissional liberal: 4 páginas, navegação, mapa e
WhatsApp. Segundo de quatro repositórios de demonstração — ver
`demo-landing-infoproduto` para o primeiro.

## Regras permanentes

### O aviso de demonstração não sai

A clínica, os três profissionais e o endereço são inventados. O aviso no
rodapé (`footer.demoNotice`) é obrigatório e visível em todas as páginas.
Nenhuma task de "deixar mais profissional" autoriza removê-lo.

### A copy respeita a publicidade em saúde

COFFITO e CFM proíbem promessa de resultado, sensacionalismo e imagem de
paciente na divulgação de serviços de saúde. Ao editar a copy:

- **nunca** prometer cura, prazo de recuperação ou resultado garantido
- manter o aviso de que a indicação depende de avaliação individual, na
  página de serviços e no rodapé
- **nunca** acrescentar "antes e depois", depoimento de paciente ou foto de
  paciente, mesmo fictícios — o padrão aqui é também pedagógico
- manter a responsável técnica com registro identificada no rodapé

Uma clínica que publica fora dessas regras responde ao conselho. Entregar
dentro delas é parte do serviço, não preciosismo.

### Elementor gratuito apenas

Nenhum widget Pro. Por isso o cabeçalho e o rodapé são montados em
`functions.php`, e não no construtor de temas, que é recurso pago.

### Texto em `build/content.json`, estilo no child theme

`build/generate-elementor.mjs` não contém nenhuma string em português, e
nenhum widget carrega settings de tipografia ou cor. Texto no JSON, visual
no CSS, estrutura no gerador.

### As seis armadilhas do Elementor

O validador do gerador reprova o build se alguma voltar. Não contorne o
validador; corrija a causa.

1. Container usa `css_classes`; widget usa `_css_classes`
2. Container sempre `full` — `boxed` injeta `.e-con-inner` e quebra grid
3. `::before` de container precisa de `position: static`
4. Cores com prefixo `.elementor`, sempre declaradas e nunca herdadas
5. O override de cor precisa cobrir `.elementor-widget-text-editor`
6. `display` e `gap` de container também precisam do prefixo `.elementor`

### Contraste: medir a paleta e auditar o render

`node build/check-contrast.mjs` ao escolher cor, e auditoria no navegador
das 4 páginas antes de considerar pronto. Na demo 1 a paleta passou limpa
enquanto o Lighthouse achava 74 elementos reprovados.

### Nenhum JavaScript próprio

O menu do celular é `<details>` nativo. Se surgir necessidade de JS,
questionar primeiro se há solução em HTML ou CSS — até aqui sempre houve.

### Segredos fora do repositório

`FM_GA_MEASUREMENT_ID` vive no `wp-config.php`. Sem a constante, nenhum
script de medição é impresso.

## Ambiente

- Desenvolvimento em **LocalWP** (a máquina não tem PHP, MySQL nem Docker)
- Node 18+ só para gerar os templates; zero dependências
- `php -l` não roda aqui: alteração em `functions.php` é validada abrindo o
  site no LocalWP

## Publicação

Simply Static exporta para `site/` (ignorado no git) → `prune-static.mjs`
reduz para `site-dist/` → Vercel com *Root Directory* = `site-dist`.

Em LocalWP o Simply Static trava em "Waiting for new push" porque depende
de WP-Cron: destravar chamando `wp-cron.php?doing_wp_cron=<timestamp>` em
loop.

**Ao mexer no `style.css`, subir a linha `Version:`.** É o que muda o
`?ver=` e invalida o cache do navegador do visitante.

## Pointers

- `README.md` — decisões técnicas e as armadilhas resolvidas
- `docs/identidade-visual.md` — paleta, contraste medido e como auditar
- `docs/checklist-publicacao.md` — montagem do zero
- `docs/demo-site-institucional-status.md` — estado atual e próximo passo
