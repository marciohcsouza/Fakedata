import pandas as pd
import random
from faker import Faker
from datetime import date

# incializações
fake = Faker('pt_BR')
random.seed(42)

# definindo constantes
total_clientes = 1000

# distribuição dos e-mails válidos que vão compor a base, simulando um cenário real, neste caso deixo 80% da base com e-mail válido, 15% com e-mail fake e 5% null sendo a diferença de (validos - fakes)
qtd_emails_validos = int(total_clientes * 0.80)
qtd_emails_fakes = int(total_clientes * 0.15)
qtd_emails_nulos = total_clientes - qtd_emails_validos - qtd_emails_fakes

# lista de domínios @
dominios_validos = ["@gmail.com", "@hotmail.com", "@outlook.com", "@terra.com", "@bol.com", "@icloud.com"]
dominios_fakes = ["@papagaio.tabajara", "@ehdementira.br", "@fallenmaiordobrasil.com", "@fakehaha.com"]

# estados possíveis na base
estados = ["MT", "SP", "RJ", "PR", "SC"]

clientes = []

# criando a base fake (aqui podemos customizar, por exemplo eu crio uma coluna de data de nascimento e padronizei que os clientes nasceram entre 1994 e 2008, que o cadastro deles foi somente em 2024 e por ai vai)
for i in range(total_clientes):
    nome = fake.name()
    estado = random.choice(estados)
    data_nascimento = fake.date_between(start_date=date(1994, 1, 1), end_date=date(2008, 12, 31))
    data_cadastro = fake.date_between(start_date=date(2024, 1, 1), end_date=date(2024, 5, 31))
    clientes.append({
        "id_cliente": i + 1,
        "nome": nome,
        "estado": estado,
        "data_nascimento": data_nascimento,
        "data_cadastro": data_cadastro,
        "email": "placeholder"
    })

# randomiza os indices e distribui os tipos de e-mail (válidos e fakes)
indices = list(range(total_clientes))
random.shuffle(indices)
limite_validos = qtd_emails_validos
limite_fakes = qtd_emails_validos + qtd_emails_fakes

for i, idx in enumerate(indices):
    if i < limite_validos:
        usuario = fake.user_name()
        clientes[idx]["email"] = usuario + random.choice(dominios_validos)
    elif i < limite_fakes:
        usuario = fake.user_name()
        clientes[idx]["email"] = usuario + random.choice(dominios_fakes)
    else:
        clientes[idx]["email"] = None

# cria o df contendo os clientes
df_clientes = pd.DataFrame(clientes)

# salva como csv e está pronto p/ usarmos em nossas análises :D
df_clientes.to_csv("clientesfake.csv", index=False, encoding='utf-8')

print("deu bom!")