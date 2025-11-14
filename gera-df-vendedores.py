import pandas as pd
import random
from faker import Faker

# inicializações
fake = Faker('pt_BR')
random.seed(42)

# definindo constantes
total_vendedores = 50 # número fixo de vendedores para a base
estados = ["MT", "SP", "RJ", "PR", "SC"] # estados baseados nos dados fornecidos

# definindo a distribuição de status de cadastro (simulando um cenário próximo da realidade onde a maioria está inativa/status 0)
# 45% dos vendedores terão situacao 0, 55% terão situacao 1
qtd_ativos = int(total_vendedores * 0.55)
qtd_inativos = total_vendedores - qtd_ativos

vendedores = []

# preenchendo a lista com os dados base
for i in range(total_vendedores):
    nome = fake.name()
    estado = random.choice(estados)
    loja = f"Filial {estado}"
    vendedores.append({
        "id_vendedor": i + 1,
        "nome": nome,
        "estado": estado,
        "situacao_cadastro": "placeholder",
        "Loja": loja
    })

# randomiza os indices para distribuir as situações de cadastro
indices = list(range(total_vendedores))
random.shuffle(indices)

# distribuindo os status: 1 (ativo) e 0 (inativo)
for i, idx in enumerate(indices):
    if i < qtd_ativos:
        vendedores[idx]["situacao_cadastro"] = 1
    else:
        vendedores[idx]["situacao_cadastro"] = 0
        
# cria o df contendo os vendedores
df_vendedores = pd.DataFrame(vendedores)

# salva como csv e está pronto p/ usarmos em nossas análises :D
df_vendedores.to_csv("vendedoresfake.csv", index=False, encoding='utf-8')

print("geração de vendedores deu bom!")