#!/bin/bash
set -e

CONFIG_FILE="/etc/mongod.conf"

echo "Iniciando MongoDB sem autenticação..."
mongod --config "$CONFIG_FILE" --noauth --bind_ip_all --fork --logpath /var/log/mongod-init.log

echo "Aguardando MongoDB iniciar..."
until mongosh --eval "db.adminCommand('ping')" >/dev/null 2>&1; do
  sleep 2
done

echo "Inserindo configs..."
mongosh <<EOF
use financial_system;

db.configs.insertMany([
  {
    "use": {
        "category": "2 - Life Cost",
        "subcategory": "2 - Services",
        "default_name": "Club iFood",
        "custom_name": false
    },
    "use_in_calculation": {
        "reimbursement": 0,
        "time": "1.0 months",
        "values_average": 5
    },
    "display": {
        "monthly_total": 5,
        "next_buy_date": "2020-10-21",
        "source": "source",
        "amount": 1
    },
    "id": 1,
    "name": "Club IFood Service",
    "rules": [
        {
            "use_calculated": "values_average",
            "type": "number",
            "between": {
                "value1": 4,
                "value2": 7
            }
        },
        {
            "property": "name",
            "type": "string",
            "contains": "iFood"
        }
    ]
  },
  {
    "use": {
        "category": "1 - Compulsions",
        "subcategory": "1 - Delivery",
        "default_name": "Delivery",
        "custom_name": false
    },
    "use_in_calculation": {
        "reimbursement": 0,
        "time": "0.5 week",
        "values_average": 60
    },
    "display": {
        "monthly_total": 2000,
        "source": "source",
        "amount": 1
    },
    "id": 30,
    "name": "Delivery",
    "rules": [
        {
            "property": "name",
            "type": "string",
            "contains": "iFood"
        },
        {
            "property": "value",
            "type": "number",
            "between": {
                "value1": 8,
                "value2": 200
            }
     }
   ]
 },
 {
    "use": {
        "category": "3 - Extras",
        "subcategory": "3 - Default Config",
        "default_name": "Default Config",
        "custom_name": true
    },
    "use_in_calculation": {
        "reimbursement": 0,
        "time": "1.0 day",
        "values_average": 50
    },
    "display": {
        "monthly_total": 3000,
        "next_buy_date": "2020-10-21",
        "source": "source",
        "amount": 1
    },
    "id": 33,
    "name": "Default Config",
    "rules": []
 }
]);

print("10 mensagens inseridas no banco de dados 'livetip'.");
EOF

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
