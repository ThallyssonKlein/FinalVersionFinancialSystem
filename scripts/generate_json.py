import csv
import json

def convert_csv_to_json(input_file, output_file):
    data = []
    
    with open(input_file, 'r', encoding='utf-8') as csv_file:
        reader = csv.DictReader(csv_file)
        
        for row in reader:
            try:
                # Renomeia as colunas e converte valores
                json_row = {
                    "id": row.get("Id"),
                    "description": row.get("Descrição"),
                    "value": parse_value(row.get("Valor")),
                    "date": row.get("Data")
                }
                data.append(json_row)
            except Exception as e:
                print(f"Erro ao processar linha: {row}. Erro: {e}")
    
    # Salvar os dados em um arquivo JSON
    with open(output_file, 'w', encoding='utf-8') as json_file:
        json.dump(data, json_file, ensure_ascii=False, indent=4)
    
    print(f"Dados convertidos e salvos em '{output_file}'")

def parse_value(value):
    """
    Converte o valor para float, ignorando valores inválidos.
    """
    if value:
        # Verificar se o valor é realmente um número, substituindo vírgulas
        try:
            return float(value.replace(",", ".").replace("−", "-").strip("R$ ").strip())
        except ValueError:
            return None  # Retorna None se não for possível converter
    return None


# Arquivo de entrada e saída
input_csv = 'ifood_uuid.csv'   # Substitua pelo caminho do CSV
output_json = 'ifood.json' # Nome do arquivo JSON gerado

# Executar a conversão
convert_csv_to_json(input_csv, output_json)
