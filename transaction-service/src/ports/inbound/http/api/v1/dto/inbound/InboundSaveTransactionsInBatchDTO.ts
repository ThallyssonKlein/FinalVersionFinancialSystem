import TransactionFromBankBO from "@domain/transaction/bo/TransactionFromBankBO";

export default interface InboundSaveTransactionsInBatchDTO {
    transactions: TransactionFromBankBO[];
    custom_name?: string;
}