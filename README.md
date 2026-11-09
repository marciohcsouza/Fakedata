# Fakedata — gerador de bases de vendas

Crie bases relacionais de clientes, produtos, vendedores, vendas e itens de venda para praticar SQL, Power Query e Power BI, testar sistemas e montar projetos de análise.

**[Acessar o gerador online](https://fakedata.projectmarcio.com.br/)**

## Gerar pelo navegador

Não precisa clonar o repositório, instalar Python ou executar scripts. Configure as quantidades, escolha o período das vendas e gere sua base diretamente no site.

- Cenários prontos e quantidades personalizadas para as cinco tabelas.
- Semente para reproduzir uma geração na mesma versão do gerador.
- Base consistente ou percentuais configuráveis de e-mails ausentes, e-mails inválidos, vendas anteriores ao cadastro e pedidos sem itens.
- Prévia das tabelas e downloads individuais em CSV ou de todos os arquivos em ZIP.
- CSV em UTF-8 com BOM, separador configurável e arquivos JSON com parâmetros e esquema.

A interface usa HTML, CSS e JavaScript, sem dependências externas. Um Web Worker faz a geração e prepara os downloads no dispositivo do visitante. A hospedagem na VM Contabo serve os arquivos por Nginx, com HTTPS pelo Caddy; o gerador web não se conecta ao banco do portfólio.

Os dados são sintéticos e não representam uma empresa real. E-mails são fictícios, sem verificação de existência das caixas. Os algoritmos web e Python são independentes: a mesma semente não produz arquivos iguais entre as duas versões.

### Executar a interface localmente

Na raiz do repositório:

```sh
python -m http.server 8765 --bind 127.0.0.1 --directory web
```

Abra http://127.0.0.1:8765. A interface precisa de HTTP/HTTPS para carregar o Worker.

### Testes do gerador web

Com Node.js instalado, sem instalar pacotes:

```sh
node --test tests/web.test.cjs
```

Os testes verificam relações entre tabelas, cálculos monetários, repetibilidade, diversidade dos e-mails, percentuais de inconsistência e configurações impossíveis.

[Detalhes do gerador web e hospedagem](web/README.md)

## Gerador Python

### Configuração e execução

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

O gerador Python gera 10.185 clientes, 450 produtos, 13 vendedores, 10.357 vendas e 25.463 itens de venda. As sementes do Faker e do módulo random estão fixas em 42. Os pedidos selecionam clientes e vendedores diretamente dos CSVs gerados. O catálogo contém 10 modelos por combinação de tipo de produto e marca.

O fluxo documentado do estudo de portfólio é **geração sintética → CSV → PostgreSQL/raw → Power Query → Power BI**. A documentação de infraestrutura local e o contrato inicial de KPIs registram a preparação da base; são separados do gerador web.

- [Infraestrutura e carga PostgreSQL](docs/01_postgres.md)
- [Contrato inicial de KPIs](docs/02_kpis.md)
- [Carga bruta transacional com psql](sql/01_carga_raw.sql)

Arquivos CSV, ambiente virtual, credenciais e runtime PostgreSQL ficam fora do versionamento. A base continua sintética; o aumento de escala não a torna representativa de uma empresa real. As inconsistências dos registros são preservadas para a etapa de qualidade de dados no Power Query.
