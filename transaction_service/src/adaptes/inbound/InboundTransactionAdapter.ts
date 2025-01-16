import ConfigService from "@domain/config/ConfigService";
import { IInboundFrequencyDTO } from "../../ports/inbound/http/api/v1/dto/inbound/IInboundFrequencyDTO";
import { ITransactionDAO, ITransactionFromBankDAO } from "../../ports/outbound/database/transaction/ITransactionFromBankDAO";
import OutboundTransactionFromBankRepositoryPort from "../../ports/outbound/database/transaction/OutboundTransactionFromBankRepositoryPort";
import OutboundTransactionNotionRepositoryPort from "../../ports/outbound/notion/OutboundTransactionNotionRepositoryPort";
import Loggable from "../../shared/Loggable";
import TransactionService from "@domain/transaction/TransactionService";

export default class InboundTransactionAdapter extends Loggable {
    constructor(
        private outboundTransactionRepositoryPort: OutboundTransactionFromBankRepositoryPort,
        private configService: ConfigService,
        private transactionService: TransactionService
    ) {
        super('InboundTransactionAdapter');
    }

    async findTransactionsXValueXUnityAgo(userToken: string, frequency: IInboundFrequencyDTO, traceId: string): Promise<ITransactionFromBankDAO[]> {
        this.log.info(`Finding transactions in last ${frequency.value} ${frequency.unity} for user ${userToken}`, traceId);
        return await this.outboundTransactionRepositoryPort.findTransactionsInLastXFrequencyX(userToken, frequency);
    }

    async saveTransactionInBatch(transactions: ITransactionFromBankDAO[], traceId: string) {
        const configAssociations = await this.configService.findConfigsAssociationsForAllTransactions(transactions, traceId);

        for (const transaction of transactions) {
            await this.transactionService.saveTransaction(transaction, configAssociations, traceId);
        }
    }
}