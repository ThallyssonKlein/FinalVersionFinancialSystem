import csv
import uuid

def add_uuids_to_csv(input_file, output_file):
    with open(input_file, 'r', encoding='utf-8') as infile:
        reader = csv.DictReader(infile)
        fieldnames = reader.fieldnames  # Nomes das colunas existentes no CSV
        
        # Certifique-se de que o campo 'Id' está nos fieldnames
        if 'Id' not in fieldnames:
            fieldnames.insert(0, 'Id')

        # Abrir arquivo de saída
        with open(output_file, 'w', encoding='utf-8', newline='') as outfile:
            writer = csv.DictWriter(outfile, fieldnames=fieldnames)
            writer.writeheader()

            for row in reader:
                # Garante que só campos esperados estão no dicionário
                row = {key: row[key] for key in fieldnames if key in row}
                
                # Adiciona UUID caso o campo 'Id' esteja vazio
                if not row['Id']:
                    row['Id'] = str(uuid.uuid4())
                
                writer.writerow(row)

# Configuração de arquivos
input_csv = 'ifood.csv'   # Substitua pelo nome do arquivo CSV de entrada
output_csv = 'ifood_uuid.csv' # Nome do arquivo de saída

# Adicionar UUIDs
add_uuids_to_csv(input_csv, output_csv)

print(f"IDs adicionados com sucesso! Confira o arquivo '{output_csv}'.")
