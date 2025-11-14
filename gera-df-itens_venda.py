import pandas as pd
import random
from faker import Faker

# inicializações
random.seed(42)

# definindo constantes
total_registros = 2500
max_produtos_por_venda = 5
max_quantidade_por_item = 3

# lendo chaves estrangeiras das outras bases já geradas
try:
    df_vendas = pd.read_csv("vendasfake.csv")
    df_produtos = pd.read_csv("produtosfake.csv")

    vendas_ids = df_vendas['id_venda'].tolist()
    produtos_ids = df_produtos['id_produto'].tolist()
    
    precos_produtos = df_produtos.set_index('id_produto')['preco'].to_dict()

except FileNotFoundError:
    print("erro: confere as bases ai, se gerou em ordem.")
    exit()

itens_venda = []
id_item_venda = 1

# loop principal criando as linhas de detalhes, respeitando id da venda, do produto, valores etc
for i in range(total_registros):

    id_venda_selecionada = random.choice(vendas_ids)
    
    id_produto_selecionado = random.choice(produtos_ids)
    
    quantidade = random.randint(1, max_quantidade_por_item)
    
    valor_unitario = precos_produtos.get(id_produto_selecionado, 0)
    
    valor_total_item = round(quantidade * valor_unitario, 2)

    itens_venda.append({
        "id_item_venda": id_item_venda,
        "id_venda": id_venda_selecionada, 
        "id_produto": id_produto_selecionado,
        "quantidade": quantidade,
        "valor_unitario_na_venda": valor_unitario,
        "valor_total_item": valor_total_item
    })
    
    id_item_venda += 1

# cria o df contendo os itens de venda
df_itens_venda = pd.DataFrame(itens_venda)

# salva como csv e ta pronto pra análise
df_itens_venda.to_csv("itens_venda_fake.csv", index=False, encoding='utf-8')

print("geração de itens de venda deu bom!", len(df_itens_venda), "registros.")