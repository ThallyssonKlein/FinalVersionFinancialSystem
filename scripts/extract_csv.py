import csv

def extrair(arquivo_origem, arquivo_destino):
    colunas = ["Compra", "Data", "Descrição", "Parcela", "R$", "US$"]
    linhas_ifood = []
    linhas_restantes = []

    with open(arquivo_origem, "r", encoding="utf-8") as f:
        leitor = csv.DictReader(f)
        for linha in leitor:
            if None in linha.keys():
                continue
            if "IFOOD" in linha["Descrição"]:
                linhas_ifood.append(linha)
            else:
                linhas_restantes.append(linha)


    with open(arquivo_destino, "w", newline="", encoding="utf-8") as f_dest:
        escritor = csv.DictWriter(f_dest, fieldnames=colunas)
        escritor.writeheader()
        escritor.writerows(linhas_ifood)

    with open(arquivo_origem, "w", newline="", encoding="utf-8") as f_orig:
        escritor = csv.DictWriter(f_orig, fieldnames=colunas)
        escritor.writeheader()
        escritor.writerows(linhas_restantes)

# Exemplo de uso:
extrair("./test.csv",
              "./ifood.csv")