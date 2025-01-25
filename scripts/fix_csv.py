import csv

def process_csv(input_file, output_file):
    try:
        with open(input_file, 'r', newline='', encoding='utf-8') as infile:
            # Read the CSV and detect delimiters
            reader = csv.reader(infile)
            
            # Infer the header row and number of columns
            rows = list(reader)
            if not rows:
                print("O arquivo CSV está vazio.")
                return
            
            header = rows[0]
            num_columns = len(header)
            
            # Prepare normalized rows
            normalized_rows = []
            for row in rows:
                # Ensure the row has the right number of columns
                row = row[:num_columns] + [''] * (num_columns - len(row))
                normalized_rows.append(row)
        
        # Write the normalized rows to a new CSV file
        with open(output_file, 'w', newline='', encoding='utf-8') as outfile:
            writer = csv.writer(outfile)
            writer.writerows(normalized_rows)
        
        print(f"CSV processado com sucesso e salvo em: {output_file}")
    
    except Exception as e:
        print(f"Ocorreu um erro ao processar o CSV: {e}")

# Exemplos de uso
input_csv = './test.csv'
output_csv = './test2.csv'
process_csv(input_csv, output_csv)
