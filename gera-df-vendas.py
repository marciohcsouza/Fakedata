import pandas as pd
import random
from faker import Faker
from datetime import date

# inicializações
fake = Faker('pt_BR')
random.seed(42)

# definindo constantes e faixas de ids
total_vendas = 1017
clientes_ids = list(range(1, 560)) 
vendedores_ids = list(range(1, 51))
canais = ["Site", "Linktree", "Landing Page"]

vendas = []

# criando a base de vendas, gerando ids aleatórios e datas
for i in range(total_vendas):
    id_venda = i + 1
    id_cliente = random.choice(clientes_ids)
    id_vendedor = random.choice(vendedores_ids)
    data_venda = fake.date_between(start_date=date(2024, 1, 1), end_date=date(2025, 6, 30))
    canal_venda = random.choice(canais)

    vendas.append({
        "id_venda": id_venda,
        "id_cliente": id_cliente,
        "id_vendedor": id_vendedor,
        "data_venda": data_venda,
        "canal_venda": canal_venda
    })

# cria o df contendo as vendas
df_vendas = pd.DataFrame(vendas)

# salva como csv e está pronto p/ usarmos em nossas análises :D
df_vendas.to_csv("vendasfake.csv", index=False, encoding='utf-8')

print("gerador de vendas deu bom!")