import pandas as pd
import random
from faker import Faker
from datetime import date

# inicializações
fake = Faker('pt_BR')
fake.seed_instance(42)
random.seed(42)

# definindo constantes e faixas de ids
total_vendas = 10357
clientes_ids = pd.read_csv("clientesfake.csv")["id_cliente"].tolist()
vendedores_ids = pd.read_csv("vendedoresfake.csv")["id_vendedor"].tolist()
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