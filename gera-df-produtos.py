import pandas as pd
import random

# inicializações
random.seed(42)

# definindo constantes da base de produtos
nomes_produtos = [
    "Teclado", "Mouse", "Monitor", "Headset", "Microfone", "HD", "SSD 1TB", 
    "Placa mãe", "Memória Ram 8GB", "Cooler Fan", "Gabinete", 
    "Processador", "Placa de Vídeo", "Webcam", "Fonte 650w"
]
marcas = ["InnoSphere", "TechNova", "ByteCore"]

# definindo faixas de preço por marca (simulando realismo: Innosphere mais caro, ByteCore mais acessível)
faixas_preco = {
    "InnoSphere": (500, 5000),
    "TechNova": (200, 2500),
    "ByteCore": (50, 1500)
}

produtos = []
id_produto = 1

# criando a base fake de produtos, combinando nome, marca e preços
for nome in nomes_produtos:
    for marca in marcas:
        min_preco, max_preco = faixas_preco[marca]
        preco = round(random.uniform(min_preco, max_preco), 2)
        produtos.append({
            "id_produto": id_produto,
            "nome_produto": nome,
            "marca": marca,
            "preco": preco
        })
        id_produto += 1

# cria o df contendo os produtos
df_produtos = pd.DataFrame(produtos)

# salva como csv e está pronto p/ usarmos em nossas análises :D
df_produtos.to_csv("produtosfake.csv", index=False, encoding='utf-8')

print("geração de produtos deu bom!")