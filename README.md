# Site institucional — WordPress + Elementor

Peça de portfólio: site de quatro páginas para profissional liberal da área
de saúde, construído em WordPress com Elementor.

> **Clínica fictícia.** A Clínica Movimento não existe, os profissionais são
> personagens e o endereço é inventado — e o próprio site diz isso, em aviso
> visível no rodapé de todas as páginas. Demonstração técnica, não material
> de divulgação.

**Demonstração ao vivo:** a publicar
**Repositório da demo 1:** [demo-landing-infoproduto](https://github.com/bbigelli/demo-landing-infoproduto)

---

## O que está aqui

| Pasta | Conteúdo |
|---|---|
| `build/content.json` | Todo o texto das 4 páginas, separado da estrutura |
| `build/elementor-kit.mjs` | Construtor de templates do Elementor, sem dependências |
| `build/generate-elementor.mjs` | Gera e **valida** os 4 templates importáveis |
| `build/check-contrast.mjs` | Verificador de contraste WCAG da paleta |
| `build/prune-static.mjs` | Reduz o export estático ao que as páginas usam |
| `build/pack-theme.ps1` | Empacota o child theme como ZIP instalável |
| `elementor/*.json` | Quatro templates prontos para importar |
| `child-theme/` | Visual, cabeçalho com navegação, rodapé e WhatsApp |
| `deploy/vercel.json` | Cabeçalhos de cache e segurança da publicação |

## Montar

```bash
node build/generate-elementor.mjs   # gera os 4 templates
node build/check-contrast.mjs       # confere a paleta
```

Zero dependências — só Node 18+. Não há `package.json` porque não há o que
instalar.

Passo a passo completo em `docs/checklist-publicacao.md`.

---

## Decisões que definem este projeto

### 1. Paleta deliberadamente oposta à da demo 1

A landing de infoproduto usa laranja quente e urgência. Aqui é teal frio,
muito espaço em branco e tom sóbrio — porque clínica de saúde vende
confiança, não impulso. Duas peças no mesmo portfólio precisam provar
versatilidade, e versatilidade não se demonstra repintando o mesmo layout.

### 2. Copy em conformidade com a publicidade em saúde

As regras do COFFITO e do CFM para divulgação de serviços de saúde proíbem
promessa de resultado, sensacionalismo e uso de imagem de paciente. A copy
foi escrita dentro dessas regras:

- nenhuma promessa de cura ou de prazo de recuperação
- o aviso de que a indicação depende de avaliação individual aparece na
  página de serviços e no rodapé de todas
- nenhum "antes e depois", nenhum depoimento de paciente
- responsável técnica identificada com registro no rodapé

Isso não é preciosismo: uma clínica que recebe um site fora dessas regras
tem problema com o conselho, não com o desenvolvedor. Saber disso é parte
do serviço.

### 3. Cabeçalho e rodapé em PHP, não no Elementor

O Elementor gratuito não tem construtor de cabeçalho — é recurso Pro. Em
vez de exigir licença paga ou repetir o cabeçalho dentro de cada um dos
quatro templates, ele é montado no `functions.php` e injetado via
`wp_body_open`.

O menu do celular é um elemento `<details>`, **sem uma linha de
JavaScript**: o navegador já entrega o acordeão, o gerenciamento de foco e
o anúncio de estado para leitor de tela.

### 4. Dados estruturados de busca local

O `functions.php` imprime um JSON-LD do tipo `MedicalClinic` com endereço,
telefone e horário de funcionamento. Para clínica de bairro, a busca local
é o que traz paciente — e é o tipo de detalhe que separa um site bonito de
um site que funciona.

---

## As seis armadilhas do Elementor, já resolvidas

Este projeto nasce com as correções que a demo 1 só descobriu depois de
publicada. O validador do gerador **reprova o build** se alguma voltar:

| Armadilha | Correção |
|---|---|
| Classe CSS tem nome diferente por tipo de elemento | `css_classes` em container, `_css_classes` em widget |
| Container `boxed` injeta `.e-con-inner` e quebra todo grid | Todo container é `full`; largura fica no CSS |
| O `::before` de container é o overlay do Elementor, `position: absolute` | `position: static` nos ícones |
| O kit global pinta títulos e botões com as cores dele | Cores declaradas com prefixo `.elementor` |
| O kit global também pinta **todo o texto** com `#7A7A7A` (4,29:1) | `.elementor-widget-text-editor` no override |
| `display` e `gap` de container empatam em especificidade com `.e-con` | Layout também com prefixo `.elementor` |

A última é a mais traiçoeira: sem o prefixo, o layout funciona ou não
conforme a ordem de carregamento dos arquivos CSS — que muda entre o
WordPress e o export estático. Na demo 1 funcionou por sorte até a
publicação.

---

## Stack

- WordPress 6.x
- Elementor **gratuito** (nenhum widget Pro)
- Hello Elementor como tema pai
- Child theme próprio para visual, cabeçalho, rodapé e WhatsApp
- Node 18+ apenas para gerar os templates

---

Desenvolvido por **Bruno Bigelli** · [github.com/bbigelli](https://github.com/bbigelli)
