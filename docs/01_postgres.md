# PostgreSQL local e carga bruta

Instância dedicada ao projeto, PostgreSQL 17.11, binários Windows da EDB: https://www.enterprisedb.com/download-postgresql-binaries

- Servidor para o Power BI: `localhost:55432`
- Banco: `fakedata_portfolio`
- Schema: `raw`
- Usuário de leitura: `pbi_reader`
- Senha: consultar localmente `.local/connection.json`; não publicar esse arquivo nem capturar sua tela em imagens do portfólio.
- Runtime, dados e logs: `work/postgres/`; ignorados pelo Git.
- Não está registrado como serviço do Windows. Após reiniciar o computador, executar `scripts/start-postgres.ps1`. Para desligar a instância, executar `scripts/stop-postgres.ps1`.
- Acesso TCP restrito a 127.0.0.1, com autenticação SCRAM-SHA-256.

## Carga

O arquivo `sql/01_carga_raw.sql` usa `psql` e `\copy`, com caminhos relativos à raiz do repositório. Executar com a raiz do projeto como diretório atual. A carga cria as cinco tabelas e importa tudo em uma transação. Ela não apaga tabelas existentes; uma segunda execução contra o mesmo schema falha, evitando sobrescrever a base sem intenção explícita.

Todas as colunas de negócio são armazenadas como texto; campos CSV vazios não delimitados por aspas são importados como NULL pelo COPY. O cabeçalho `Loja` é representado como `loja` no PostgreSQL. Não há filtros, deduplicação, correção de datas, agregação ou conversão de valores comerciais. Esses passos ficarão para M/Power Query. Tipagem, chaves e relacionamentos serão definidos após o perfilamento.

## Separação das ferramentas

Python: somente gerador de dados sintéticos. PowerShell e psql: infraestrutura e ingestão. PostgreSQL: armazenamento bruto. Power Query/M: perfilamento e transformação futura. DAX: medidas futuras no Power BI. Python analítico e Metabase pertencem a uma segunda versão do projeto.
