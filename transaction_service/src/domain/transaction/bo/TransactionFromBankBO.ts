export enum ETransactionFromBankType {
    PIX = 'PIX',
    TED = 'TED',
    DOC = 'DOC',
    BOLETO = 'BOLETO',
    DEPOSITO = 'DEPOSITO',
    CREDITO = 'CREDITO',
    DEBIDO = 'DEBITO'
}

export default class TransactionFromBankBO {
    constructor(
        private description: string,
        private type: ETransactionFromBankType,
        private value: number,
        private date: Date,
        private user_token: string,
        private id?: string,
    ) {}

    getId(): string {
        return this.id;
    }

    getDescription(): string {
        return this.description;
    }

    getType(): ETransactionFromBankType {
        return this.type;
    }

    getValue(): number {
        return this.value;
    }

    getDate(): Date {
        return this.date;
    }

    getUserToken(): string {
        return this.user_token;
    }

    setId(id: string): void {
        this.id = id;
    }

    setDescription(description: string): void {
        this.description = description;
    }

    setType(type: ETransactionFromBankType): void {
        this.type = type;
    }

    setValue(value: number): void {
        this.value = value;
    }

    setDate(date: Date): void {
        this.date = date;
    }

    setUserToken(user_token: string): void {
        this.user_token = user_token;
    }
}