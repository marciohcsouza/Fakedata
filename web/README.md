# Fakedata Web

Interface estática em HTML, CSS e JavaScript. Geração e ZIP executados no navegador em Web Worker. Sem API, CDN, bibliotecas externas ou acesso ao banco de dados.

## Executar localmente

Na raiz do repositório:

```sh
python -m http.server 8765 --bind 127.0.0.1 --directory web
```

Abra http://127.0.0.1:8765. Não abra `index.html` por `file://`: Web Workers precisam de uma origem HTTP/HTTPS.

```sh
node --test tests/web.test.cjs
```

## Contrato da geração

- Quantidades independentes, com limites: 100 mil clientes, 10 mil produtos, 10 mil vendedores, 100 mil vendas e 300 mil itens. O limite considera a memória do dispositivo; não garante desempenho em todo celular.
- Mesmo algoritmo/versão, semente e parâmetros reproduzem os arquivos. A versão web não reproduz Faker/random do Python.
- Mantém os nomes de CSV e cabeçalhos existentes, inclusive `Loja`. UTF-8 com BOM, CRLF, vírgula ou ponto e vírgula; valores monetários com ponto decimal, duas casas, em BRL. Datas ISO.
- CSVs são baixados individualmente ou em um ZIP STORE, sem compressão. O ZIP inclui `parametros.json` e `dicionario.json`.
- Cadastros são distribuídos nos primeiros 30% do período (a partir do segundo dia). Vendas consistentes ocorrem entre cadastro e fim do período. Nascimentos são sorteados entre 1960 e 1999. Essa distribuição simplificada é para estudo, não uma amostra representativa.
- Vendedores têm situação cadastral atual (55% ativos, arredondado para baixo); ela não determina se fizeram vendas no passado.
- Itens usam preços do catálogo e cálculos em centavos inteiros. Produtos podem se repetir no mesmo pedido; não há limite de linhas por pedido.
- Sem inconsistências, todas as vendas têm pelo menos um item. O total solicitado de itens deve comportar essa cobertura.
- Com inconsistências, as variáveis `missingEmail`, `invalidEmail`, `earlySales` e `emptySales` controlam cada ocorrência de forma independente. Todos os percentuais são arredondados para baixo: `floor(total * percentual / 100)`.
- E-mails ausentes e inválidos são categorias disjuntas e somam no máximo 100%. Os e-mails com sintaxe válida usam nomes normalizados, ID e domínios variados (gmail.com, hotmail.com, outlook.com, terra.com, bol.com, icloud.com). São endereços sintéticos, sem verificação da existência das caixas; os inválidos têm sintaxe inválida.
- Vendas anteriores ao cadastro e pedidos sem itens podem se sobrepor. A quantidade restante de vendas recebe ao menos um item; não são aceitas configurações impossíveis ou 100% de pedidos sem itens com itens solicitados.
- Dados gerados ficam na memória da aba e nos downloads do visitante. Alterar o formulário não altera downloads anteriores; é necessário gerar novamente. Cancelar termina o Worker.

## Hospedar na Contabo

Sirva **somente esta pasta `web`** em um servidor estático, como Nginx ou Caddy. Não publique a raiz do repositório, que pode conter CSVs locais, `.git`, ambientes virtuais e configurações privadas. Não há serviço Python ou Node necessário em produção.

1. Verifique os serviços, recursos e portas atuais da VM antes de alterar a infraestrutura.
2. Transfira `web/` para uma pasta exclusiva, por exemplo `/home/marcio/portfolio/fakedata/web/`.
3. Configure o servidor HTTP para usar essa pasta como raiz. O worker precisa ser servido na mesma origem, com MIME JavaScript.
4. Aponte o domínio para a VM e configure HTTPS no proxy existente. Preserve os serviços e regras de firewall atuais.
5. Verifique página, Worker e download ZIP pela URL pública antes de considerar a publicação concluída.

Exemplo de serviço Compose **a acrescentar à infraestrutura existente após inspeção**, se ela usar Docker:

```yaml
services:
  fakedata-web:
    image: nginx:stable-alpine
    restart: unless-stopped
    ports:
      - "127.0.0.1:8088:80"
    volumes:
      - /home/marcio/portfolio/fakedata/web:/usr/share/nginx/html:ro
    mem_limit: 64m
```

O bind em loopback exige um proxy HTTP/HTTPS no host encaminhando para `127.0.0.1:8088`. Se o proxy estiver em container, use rede Docker compartilhada e o nome do serviço em vez do loopback. Confirme a porta livre e a topologia antes de aplicar. Fixe a imagem por versão/digest na implantação. O limite de 64 MB é um ponto de partida para o servidor estático, não uma medição de consumo.

O Fakedata não se conecta ao PostgreSQL do portfólio. O maior consumidor de memória desse conjunto tende a ser Metabase/PostgreSQL e suas consultas. Para avaliar capacidade, observe memória disponível, swap, CPU e concorrência; não deduza o consumo pelo tamanho do HTML.
