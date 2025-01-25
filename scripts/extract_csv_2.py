import csv

def extract_ifood_lines(input_file, output_file, remaining_file):
    with open(input_file, 'r', encoding='utf-8') as infile:
        reader = csv.DictReader(infile)
        fieldnames = reader.fieldnames

        # Abrir arquivos para saída
        with open(output_file, 'w', encoding='utf-8', newline='') as outfile, \
             open(remaining_file, 'w', encoding='utf-8', newline='') as remainfile:
            
            writer_ifood = csv.DictWriter(outfile, fieldnames=fieldnames)
            writer_remaining = csv.DictWriter(remainfile, fieldnames=fieldnames)

            # Escrever cabeçalhos nos arquivos
            writer_ifood.writeheader()
            writer_remaining.writeheader()

            # Iterar pelas linhas do CSV
            for row in reader:
                if "IFOOD" in row['Descrição']:
                    writer_ifood.writerow(row)  # Linhas com "IFOOD" vão para o novo arquivo
                else:
                    writer_remaining.writerow(row)  # Linhas restantes ficam no outro arquivo


# Configuração de arquivos
input_csv = 'unified_csv.csv'        # Arquivo original
output_csv = 'ifood_2.csv' # Arquivo com as linhas extraídas
remaining_csv = 'unified_csv_2.csv' # Arquivo sem as linhas extraídas

# Executar a extração
extract_ifood_lines(input_csv, output_csv, remaining_csv)

print(f"Linhas com 'IFOOD' extraídas para '{output_csv}'. Restante salvo em '{remaining_csv}'.")
