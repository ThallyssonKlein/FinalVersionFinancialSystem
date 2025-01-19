import TransactionBO from "./TransactionBO";
import TransactionFromBankBO from "./TransactionFromBankBO";

export default class TransactionServiceResultBO {
    constructor(
        private savedTransactionFromBank: TransactionFromBankBO,
        private savedOnNotionTransaction: TransactionBO
    ) {}

    getSavedTransactionFromBank() {
        return this.savedTransactionFromBank;
    }

    getSavedOnNotionTransaction() {
        return this.savedOnNotionTransaction;
    }

    setSavedTransactionFromBank(savedTransactionFromBank: TransactionFromBankBO) {
        this.savedTransactionFromBank = savedTransactionFromBank;
    }

    setSavedOnNotionTransaction(savedOnNotionTransaction: TransactionBO) {
        this.savedOnNotionTransaction = savedOnNotionTransaction;
    }
}