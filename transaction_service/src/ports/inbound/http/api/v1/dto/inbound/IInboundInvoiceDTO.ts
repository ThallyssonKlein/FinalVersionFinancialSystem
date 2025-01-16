import TransactionFromBankBO from "@domain/transaction/bo/TransactionFromBankBO";

export default interface IInboundInvoiceDTO {
    date: Date;
    total: number;
    market: string;
    items: TransactionFromBankBO[];
}