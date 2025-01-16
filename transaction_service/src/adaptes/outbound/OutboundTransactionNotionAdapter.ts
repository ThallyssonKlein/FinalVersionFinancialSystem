import TransactionBO from "@domain/transaction/bo/TransactionBO";
import IToken from "@ports/outbound/database/token/IToken";
import OutboundTransactionNotionRepositoryPort from "@ports/outbound/notion/OutboundTransactionNotionRepositoryPort";
import Loggable from "@shared/Loggable";

export default class OutboundTransactionNotionAdapter extends Loggable {
    constructor(
        private outboundTransactionNotionRepositoryPort: OutboundTransactionNotionRepositoryPort,
    ) {
        super('OutboundTransactionNotionAdapter');
    }

    async createTransaction(userToken: IToken, transaction: TransactionBO, traceId: string): Promise<TransactionBO> {
        this.log.info(`Creating transaction ${transaction.getName()}`);
        const result = await this.outboundTransactionNotionRepositoryPort.createTransaction(userToken, transaction, traceId);
        this.log.info(`Transaction created with id ${result.getId()}`);
        return result;
    }

    async deleteTransactionById(id: string, traceId: string) {
        this.log.info(`Deleting transaction with id ${id}`);
        await this.outboundTransactionNotionRepositoryPort.deleteTransactionById(id, traceId);
        this.log.info(`Transaction deleted with id ${id}`);
    }
}