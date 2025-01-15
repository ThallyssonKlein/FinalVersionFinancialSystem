export enum ESavedTransactionFromBankType {
    PIX = 'PIX',
    TED = 'TED',
    DOC = 'DOC',
    BOLETO = 'BOLETO',
    DEPOSITO = 'DEPOSITO',
    CREDITO = 'CREDITO',
    DEBIDO = 'DEBITO'
}

export default interface ISavedTransactionFromBankDAO {
    id?: string;
    description: string;
    type: ESavedTransactionFromBankType;
    value: number;
    date: Date;
}