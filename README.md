# Gerador de Dados Fakes (Fakedata)

Este projeto contém scripts Python para gerar bases de dados relacionais com características realistas (clientes, produtos, vendedores, vendas, itens_venda) para fins de teste, prototipagem ou análise.

## Configuração e Execução

### Pré-requisitos
Certifique-se de ter o Python 3 instalado.

### 1. Clonar o Repositório

Para obter uma cópia completa do projeto para sua máquina, use o comando git clone e navegue para o diretório:

git clone https://github.com/marciohcsouza/Fakedata.git
cd Fakedata

### 2. Configurar o Ambiente Virtual

Crie e ative o ambiente virtual para isolar as dependências do projeto:

python -m venv venv
#### No Windows:
.\venv\Scripts\activate

### 3. Instalar Dependências

Com o ambiente virtual ativo, instale todas as libs necessárias listas no requirements.txt:

pip install -r requirements.txt

### 4. Rodar o Gerador Completo

Execute o script central run_all.py para gerar todas as cinco bases de dados na ordem correta, o run_all já orquestra a ordem pois a df-itens_venda tem que ser gerado após as demais:

python run_all.py

Os cinco arquivos CSV serão gerados na pasta raiz e estarão prontos para análise.
## Projeto de portfólio — escala ampliada

A versão local gera 10.185 clientes, 450 produtos, 13 vendedores, 10.357 vendas e 25.463 itens de venda. As sementes do Faker e do módulo random estão fixas em 42. Os pedidos selecionam clientes e vendedores diretamente dos CSVs gerados. O catálogo contém 10 modelos por combinação de tipo de produto e marca.

Fluxo atual: **geração sintética → CSV → PostgreSQL/raw**. O tratamento futuro será feito em M/Power Query e as medidas em DAX no Power BI.

- [Infraestrutura e carga PostgreSQL](docs/01_postgres.md)
- [Contrato inicial de KPIs](docs/02_kpis.md)
- [Carga bruta transacional com psql](sql/01_carga_raw.sql)

Arquivos CSV, ambiente virtual, credenciais e runtime PostgreSQL ficam fora do versionamento. A base continua sintética; o aumento de escala não a torna representativa de uma empresa real. As inconsistências dos registros são preservadas para a etapa de qualidade de dados no Power Query.
