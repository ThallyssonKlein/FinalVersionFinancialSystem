import TransactionFromBankBO from "@domain/transaction/bo/TransactionFromBankBO";
import OutboundTransactionFromBankRepositoryPort from "@ports/outbound/database/transaction/OutboundTransactionFromBankRepositoryPort";
import Loggable from "@shared/Loggable";

export default class OutboundTransactionFromBankAdapter extends Loggable {
    constructor(
        private outboundTransactionFromBankRepositoryPort: OutboundTransactionFromBankRepositoryPort,
    ) {
        super('OutboundTransactionFromBankAdapter');
    }

    async saveTransaction(transaction: TransactionFromBankBO): Promise<TransactionFromBankBO> {
        this.log.info(`Saving transaction ${transaction.getDescription()}`);
        const result = await this.outboundTransactionFromBankRepositoryPort.saveTransaction(transaction);
        this.log.info(`Transaction saved with id ${result.getId()}`);
        return result;
    }
}