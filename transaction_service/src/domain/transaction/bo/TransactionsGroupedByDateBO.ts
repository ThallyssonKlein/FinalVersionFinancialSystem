import { TransactionFromBankBO } from "./TransactionFromBankBO";

export default class TransactionsGroupedByDateBO {
    constructor(private date: Date, private transactions: TransactionFromBankBO[]) {}

    getDate() {
        return this.date;
    }

    getTransactions() {
        return this.transactions;
    }

    setDate(date: Date) {
        this.date = date;
    }

    setTransactions(transactions: TransactionFromBankBO[]) {
        this.transactions = transactions;
    }
}