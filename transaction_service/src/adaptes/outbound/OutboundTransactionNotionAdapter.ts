import TransactionBO from "@domain/transaction/bo/TransactionBO";
import OutboundTransactionNotionRepositoryPort from "@ports/outbound/notion/OutboundTransactionNotionRepositoryPort";
import Loggable from "@shared/Loggable";

export default class OutboundTransactionNotionAdapter extends Loggable {
    constructor(
        private outboundTransactionNotionRepositoryPort: OutboundTransactionNotionRepositoryPort,
    ) {
        super('OutboundTransactionNotionAdapter');
    }

    async createTransaction(transaction: TransactionBO) {
        this.log.info(`Creating transaction ${transaction.getName()}`);
        const result = await this.outboundTransactionNotionRepositoryPort.createTransaction(transaction);
        this.log.info(`Transaction created with id ${result.getId()}`);
        return result;
    }

    async deleteTransactionById(id: string) {
        this.log.info(`Deleting transaction with id ${id}`);
        await this.outboundTransactionNotionRepositoryPort.deleteTransactionById(id);
        this.log.info(`Transaction deleted with id ${id}`);
    }
}