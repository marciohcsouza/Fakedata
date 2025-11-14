# Gerador de Dados Fakes (Fakedata)

Este projeto contém scripts Python para gerar bases de dados relacionais com características realistas (clientes, produtos, vendedores, vendas, itens_venda) para fins de teste, prototipagem ou análise.

## Configuração e Execução

### Pré-requisitos
Certifique-se de ter o Python 3 instalado.

### 1. Clonar o Repositório

Para obter uma cópia completa do projeto para sua máquina, use o comando git clone e navegue para o diretório:

git clone https://github.com/marciohcsouza/Fakedata.git
cd Fakedata

### 2. Configurar o Ambiente Virtual (venv)

Crie e ative o ambiente virtual para isolar as dependências do projeto:

python -m venv venv
# No Windows:
.\venv\Scripts\activate

### 3. Instalar Dependências

Com o ambiente virtual ativo, instale todas as libs necessárias listas no requirements.txt:

pip install -r requirements.txt

### 4. Rodar o Gerador Completo

Execute o script central run_all.py para gerar todas as cinco bases de dados na ordem correta, o run_all já orquestra a ordem pois a df-itens_venda tem que ser gerado após as demais:

python run_all.py

Os cinco arquivos CSV serão gerados na pasta raiz e estarão prontos para análise.