#!/bin/bash
set -e

CONFIG_FILE="/etc/mongod.conf"

echo "Iniciando MongoDB sem autenticação..."
mongod --config "$CONFIG_FILE" --noauth --bind_ip_all --fork --logpath /var/log/mongod-init.log

echo "Aguardando MongoDB iniciar..."
until mongosh --eval "db.adminCommand('ping')" >/dev/null 2>&1; do
  sleep 2
done

# echo "Inserindo mensagens aleatórias no banco de dados 'livetip'..."
# mongosh <<EOF
# use livetip;

# const senders = ['Alice', 'Bob', 'Charlie', 'Dave'];
# const contents = ['Hello!', 'How are you?', 'Good morning!', 'Good night!'];
# const currencies = ['BTC', 'BRL'];

# // Função para gerar uma mensagem aleatória
# const generateRandomMessage = () => {
#     return {
#         sender: senders[Math.floor(Math.random() * senders.length)],
#         receiver: '2',
#         content: contents[Math.floor(Math.random() * contents.length)],
#         timestamp: new Date(),
#         amount: Math.floor(Math.random() * 1000),
#         paid: Math.random() < 0.5,
#         currency: currencies[Math.floor(Math.random() * currencies.length)],
#         paymentId: Math.random().toString(36).substring(7),
#         read: Math.random() < 0.5
#     };
# };

# // Gera e insere 10 mensagens aleatórias na coleção 'messages'
# const messages = [];
# for (let i = 0; i < 10; i++) {
#     messages.push(generateRandomMessage());
# }

# db.messages.insertMany(messages);

# print("10 mensagens inseridas no banco de dados 'livetip'.");
# EOF

echo "Criando usuário para o banco de dados 'financial_system'..."
mongosh <<EOF
use financial_system;
db.createUser({
  user: "user",
  pwd: "password",
  roles: [
    { role: "readWrite", db: "financial_system" }
  ]
});
EOF

echo "Parando MongoDB..."
mongod --shutdown --dbpath /data/db

echo "Habilitando autenticação no arquivo de configuração..."
if ! grep -q "security:" "$CONFIG_FILE"; then
  echo -e "\nsecurity:\n  authorization: 'enabled'" >> "$CONFIG_FILE"
  echo "Autenticação habilitada no arquivo de configuração."
else
  echo "A configuração de autenticação já existe no arquivo de configuração."
fi

echo "Reiniciando MongoDB com autenticação habilitada..."
mongod --config "$CONFIG_FILE" --auth --bind_ip_all --fork --logpath /var/log/mongod-auth.log

echo "Aguardando MongoDB reiniciar..."
until mongosh -u user -p password --authenticationDatabase "financial_system" --eval "db.adminCommand('ping')" >/dev/null 2>&1; do
  sleep 2
done

echo "Configuração inicial concluída com sucesso. MongoDB está em execução."
tail -f /var/log/mongod-auth.log
