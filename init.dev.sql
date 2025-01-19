-- Criação do tipo ENUM para type
CREATE TYPE ETransactionFromBankType AS ENUM (
    'PIX',
    'TED',
    'DOC',
    'BOLETO',
    'DEPOSITO',
    'CREDITO',
    'DEBITO'
);

-- Criação da tabela TransactionFromBank
CREATE TABLE TransactionFromBank (
    id UUID PRIMARY KEY NOT NULL,
    description TEXT NOT NULL,
    type ETransactionFromBankType NOT NULL,
    value NUMERIC(15, 2) NOT NULL,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    user_token UUID NOT NULL
);
