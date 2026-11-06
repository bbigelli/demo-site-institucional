# fonts/

Coloque aqui os dois arquivos da Inter:

- `inter-400.woff2`
- `inter-700.woff2`

Subset `latin`, que cobre toda a acentuacao do portugues.
Baixe em https://gwfh.mranftl.com/fonts/inter (ja entrega woff2).

Arquivo de fonte nao vai para o repositorio: e binario, pesa, e muda o
diff a cada reconversao. O tema trata a ausencia com `file_exists()` --
sem os arquivos o site cai para a fonte do sistema, sem quebrar.
