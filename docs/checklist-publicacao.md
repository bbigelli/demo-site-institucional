# Checklist de montagem e publicação — Demo 2

Tempo estimado: **1h30 a 2h**. Menos que a demo 1, porque o caminho já é
conhecido — mas são 4 páginas em vez de 1.

Se você nunca usou o LocalWP, o guia tela por tela está no repositório da
demo 1: `demo-landing-infoproduto/docs/guia-localwp-passo-a-passo.md`.
Aqui ficam só os passos e o que muda neste projeto.

---

## 1. Site no LocalWP — ~15 min

- [ ] Criar site `demo-clinica-movimento`, environment **Preferred**
- [ ] Anotar usuário e senha do WordPress
- [ ] Permitir no firewall e autorizar o certificado SSL quando pedir

## 2. Tema pai e plugin — ~10 min

- [ ] **Aparência → Temas → Adicionar** → `Hello Elementor` → Instalar
      (não precisa ativar)
- [ ] **Plugins → Adicionar** → `Elementor` → Instalar e Ativar → pular o
      wizard
- [ ] Versão **gratuita**. O site foi construído sem nenhum widget Pro

## 3. Child theme — ~5 min

```powershell
.\build\pack-theme.ps1
```

- [ ] **Aparência → Temas → Adicionar → Enviar tema** →
      `dist\clinica-movimento.zip` → Instalar → **Ativar**

> **Tela branca depois de ativar?** No LocalWP, botão direito no site →
> *Open site shell* → `wp theme activate hello-elementor`. Me mande o erro.

## 4. As quatro páginas — ~10 min

**Páginas → Adicionar nova**, quatro vezes. Os slugs precisam ser
exatamente estes, porque o cabeçalho e o rodapé montam os links a partir
deles:

| Título | Slug |
|---|---|
| Início | `inicio` (vira a home, o slug não aparece) |
| Sobre | `sobre` |
| Serviços | `servicos` |
| Contato | `contato` |

- [ ] Publicar as quatro
- [ ] **Configurações → Leitura → Uma página estática → Início**
- [ ] Ainda em Leitura: marcar **não indexar** (é demo com clínica fictícia)

> Se um slug sair diferente — `servicos-1`, por exemplo, caso você tenha
> publicado duas vezes —, o link do menu aponta para uma página que não
> existe. Confira os quatro antes de seguir.

## 5. Importar os quatro templates — ~15 min

Para **cada** uma das quatro páginas:

1. Abrir a página e clicar em **Editar com Elementor**
2. Ícone de **pasta** → aba **Modelos** → **Importar template**
3. Enviar o JSON correspondente de `elementor/`:
   - Início → `home.json`
   - Sobre → `sobre.json`
   - Serviços → `servicos.json`
   - Contato → `contato.json`
4. **Inserir** e **Atualizar**

> O Elementor mostra dois avisos no import. No segundo, escolha **Importar
> sem ativar**: nossos templates não usam SVG nem JSON como arquivo de
> mídia, então não há motivo para ligar o envio de arquivos não filtrados.

### Layout de tela cheia, nas quatro

- [ ] No editor, ícone de **engrenagem** (Configurações da página)
- [ ] **Layout da página → Elementor Tela cheia**
- [ ] **Atualizar**

Sem isso o cabeçalho do tema pai aparece junto com o nosso, duplicado. O
Canvas mantém `wp_body_open` e `wp_footer`, que é por onde o nosso
cabeçalho, rodapé e WhatsApp entram.

## 6. Fontes — ~10 min

- [ ] Baixar a Inter em https://gwfh.mranftl.com/fonts/inter, pesos **400**
      e **700**, subset **latin**
- [ ] Renomear para `inter-400.woff2` e `inter-700.woff2`
- [ ] Colocar em `wp-content/themes/clinica-movimento/fonts/`

## 7. Imagens — ~20 min

| Slot | Dimensão | Onde |
|---|---|---|
| Hero da home | 960×720 | Início |
| Equipe (3) | 600×600 | Sobre |
| Estrutura | 800×600 | Sobre |

- [ ] Converter para **WebP** (https://squoosh.app)
- [ ] Subir pela **Mídia** do WordPress, não por URL externa
- [ ] **Preencher o texto alternativo de cada uma** — o Elementor pega o
      `alt` do anexo da biblioteca; imagem por URL fica sem `alt` e derruba
      a nota de acessibilidade
- [ ] Copiar a URL do hero para `hero_image`, em `fm_config()`

> **Nunca use foto de paciente**, nem com autorização. A publicidade em
> saúde proíbe, e o padrão deste projeto é também pedagógico. Fotos de
> ambiente e de equipe apenas.

## 8. Dados reais — ~5 min

Em `functions.php`, função `fm_config()`:

- [ ] `whatsapp_phone` — formato `55` + DDD + número, só dígitos
- [ ] `telefone` e `telefone_link`
- [ ] `email`

E em `build/content.json`, os mesmos campos em `site`, seguido de
`node build/generate-elementor.mjs` e reimportação dos templates afetados.

> Os dois lugares existem porque cabeçalho e rodapé são PHP, e o conteúdo
> das páginas é Elementor. Trocar só um deixa o site com dois telefones
> diferentes.

## 9. Analytics (opcional)

Em `wp-config.php`, antes de `/* That's all, stop editing! */`:

```php
define( 'FM_GA_MEASUREMENT_ID', 'G-XXXXXXXXXX' );
```

Sem a constante, nenhum script de medição é impresso.

---

## 10. QA — ~20 min

### Navegação

- [ ] Os 4 links do cabeçalho abrem a página certa
- [ ] A página atual aparece destacada no menu (`aria-current`)
- [ ] O menu do celular abre e fecha, e fecha ao navegar
- [ ] O botão "Agendar avaliação" do cabeçalho leva a Contato
- [ ] Os links do rodapé funcionam nas 4 páginas

### Funcional

- [ ] WhatsApp flutuante abre com a mensagem preenchida, nas 4 páginas
- [ ] Telefone e e-mail da página de Contato abrem o app correto
- [ ] Os dois mapas carregam (home e contato)

### Visual

- [ ] Testar em 360px, 768px e 1440px
- [ ] Cards em 1, 2 e 3 colunas conforme a largura
- [ ] As 5 etapas da jornada: 1 coluna no celular, 2 no tablet, 5 no desktop
- [ ] Cabeçalho fixo não cobre conteúdo ao rolar
- [ ] WhatsApp flutuante não cobre nada importante

### Texto

- [ ] **Toda acentuação correta.** Procurar por `nao`, `voce`, `servicos`,
      `avaliacao` sem acento
- [ ] O aviso de demonstração aparece no rodapé das 4 páginas
- [ ] O aviso de indicação individual aparece em Serviços

### Acessibilidade

- [ ] Navegar as 4 páginas só com `Tab`, com foco visível sempre
- [ ] O primeiro `Tab` revela "Pular para o conteúdo"
- [ ] Toda imagem com texto alternativo
- [ ] **Auditoria de contraste nas 4 páginas** — ver
      `docs/identidade-visual.md`. A paleta passar no script não basta

---

## 11. Publicar — ~25 min

### Exportar

- [ ] **Plugins → Adicionar** → `Simply Static` → Instalar e Ativar
- [ ] **Simply Static → Settings → General**: *Relative Path*, caminho `/`
- [ ] **Deploy**: método **Local Directory**, caminho
      `J:/Projetos/demo-site-institucional/site/`
- [ ] **Generate → Push**

> O export trava em *"Waiting for new push"*: o Simply Static depende de
> WP-Cron, que em ambiente local não dispara sem tráfego. Destravar
> chamando `http://demo-clinica-movimento.local/wp-cron.php?doing_wp_cron=1`
> algumas vezes, ou me peça para rodar o laço.

### Podar e publicar

```bash
node build/prune-static.mjs
```

- [ ] Conferir que o resumo lista as **4 páginas**
- [ ] Commit e push
- [ ] Na Vercel: importar o repositório, *Root Directory* = **`site-dist`**,
      preset **Other**, sem build command
- [ ] Deploy

### Depois de publicar

- [ ] Rodar o PageSpeed nas 4 páginas, no celular
- [ ] Conferir o contraste em produção
- [ ] Testar a navegação entre páginas no site publicado — é o ponto onde
      caminho relativo costuma quebrar

> **Ao mexer no `style.css`, suba a linha `Version:` do cabeçalho.** É o que
> muda o `?ver=` e invalida o cache do navegador do visitante. Sem isso, a
> correção não chega a quem já visitou o site.
