import json
from collections import defaultdict

# Função para ler o arquivo JSON e agrupar os itens por data
def group_by_date(input_file, output_file):
    # Lê o conteúdo do arquivo JSON
    with open(input_file, 'r') as file:
        data = json.load(file)

    # Cria um dicionário para agrupar os itens por data
    grouped_data = defaultdict(list)

    # Itera sobre os itens e agrupa pelo campo 'date'
    for item in data:
        date = item.get('date')
        if date:
            grouped_data[date].append(item)

    # Salva os dados agrupados em um novo arquivo JSON
    with open(output_file, 'w') as file:
        json.dump(grouped_data, file, indent=4)

# Exemplo de uso
input_file = 'ifood.json'  # Caminho para o arquivo de entrada
output_file = 'ifood_grouped.json'  # Caminho para o arquivo de saída

group_by_date(input_file, output_file)
