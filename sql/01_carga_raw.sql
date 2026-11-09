\set ON_ERROR_STOP on
BEGIN;
CREATE SCHEMA IF NOT EXISTS raw;
CREATE TABLE raw.clientes (id_cliente text, nome text, estado text, data_nascimento text, data_cadastro text, email text);
CREATE TABLE raw.produtos (id_produto text, nome_produto text, marca text, preco text);
CREATE TABLE raw.vendedores (id_vendedor text, nome text, estado text, situacao_cadastro text, loja text);
CREATE TABLE raw.vendas (id_venda text, id_cliente text, id_vendedor text, data_venda text, canal_venda text);
CREATE TABLE raw.itens_venda (id_item_venda text, id_venda text, id_produto text, quantidade text, valor_unitario_na_venda text, valor_total_item text);
\copy raw.clientes FROM 'clientesfake.csv' WITH (FORMAT csv, HEADER true, ENCODING 'UTF8');
\copy raw.produtos FROM 'produtosfake.csv' WITH (FORMAT csv, HEADER true, ENCODING 'UTF8');
\copy raw.vendedores FROM 'vendedoresfake.csv' WITH (FORMAT csv, HEADER true, ENCODING 'UTF8');
\copy raw.vendas FROM 'vendasfake.csv' WITH (FORMAT csv, HEADER true, ENCODING 'UTF8');
\copy raw.itens_venda FROM 'itens_venda_fake.csv' WITH (FORMAT csv, HEADER true, ENCODING 'UTF8');
GRANT CONNECT ON DATABASE fakedata_portfolio TO pbi_reader;
GRANT USAGE ON SCHEMA raw TO pbi_reader;
GRANT SELECT ON ALL TABLES IN SCHEMA raw TO pbi_reader;
ALTER DEFAULT PRIVILEGES IN SCHEMA raw GRANT SELECT ON TABLES TO pbi_reader;
COMMIT;
SELECT 'clientes' tabela, count(*) registros FROM raw.clientes
UNION ALL SELECT 'produtos', count(*) FROM raw.produtos
UNION ALL SELECT 'vendedores', count(*) FROM raw.vendedores
UNION ALL SELECT 'vendas', count(*) FROM raw.vendas
UNION ALL SELECT 'itens_venda', count(*) FROM raw.itens_venda;
