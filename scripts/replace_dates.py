import re

# Função para realizar a substituição no arquivo de texto
def replace_dates_in_file(input_file, output_file):
    # Lê o conteúdo do arquivo de texto
    with open(input_file, 'r') as file:
        content = file.read()

    # Função para substituir as datas no formato DD/MM
    def replace_date(match):
        day, month = match.groups()
        
        # Decide o ano dependendo do mês
        year = '2025' if int(month) in [1, 2, 3] else '2024'
        
        # Formata a data como 2024-MM-DD ou 2025-MM-DD
        return f'{year}-{month.zfill(2)}-{day.zfill(2)}'

    # Expressão regular para encontrar datas no formato DD/MM
    date_pattern = r'(\d{2})/(\d{2})'

    # Substitui as datas no conteúdo
    updated_content = re.sub(date_pattern, replace_date, content)

    # Salva o conteúdo atualizado em um novo arquivo
    with open(output_file, 'w') as file:
        file.write(updated_content)

# Exemplo de uso
input_file = 'ifood.json'  # Caminho para o arquivo de entrada
output_file = 'ifood_grouped_correct_dates_2.json'  # Caminho para o arquivo de saída

replace_dates_in_file(input_file, output_file)
