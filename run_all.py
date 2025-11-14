import subprocess
import os
import time

# definindo o caminho no ambiente virtual
python_path = r'.\venv\Scripts\python.exe'

# definindo a ordem de execução
scripts = [
    "gera-df-clientes.py",
    "gera-df-produtos.py",
    "gera-df-vendedores.py",
    "gera-df-vendas.py", 
    "gera-df-itens_venda.py"
]

print("iniciando a geração de todos os datasets fakes...")
print("-" * 7)

# loop executando cada script na ordem definida
for script in scripts:
    print(f"executando {script}...")
    
    python_path = r'.\venv\Scripts\python.exe'
    processo = subprocess.run([python_path, script], capture_output=True, text=True, check=True)
    
    print(processo.stdout.strip())
    
    time.sleep(1)

print("-" * 14)
print("todos os datasets foram gerados com sucesso! :)")
