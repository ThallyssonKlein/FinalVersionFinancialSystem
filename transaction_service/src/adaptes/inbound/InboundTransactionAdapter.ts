import ConfigService from "@domain/config/ConfigService";
import { IInboundFrequencyDTO } from "../../ports/inbound/http/api/v1/dto/inbound/IInboundFrequencyDTO";
import OutboundTransactionFromBankRepositoryPort from "../../ports/outbound/database/transaction/OutboundTransactionFromBankRepositoryPort";
import Loggable from "../../shared/Loggable";
import TransactionService from "@domain/transaction/TransactionService";
import TransactionFromBankBO from "@domain/transaction/bo/TransactionFromBankBO";
import IInboundInvoiceDTO from "@ports/inbound/http/api/v1/dto/inbound/IInboundInvoiceDTO";
import IToken from "@ports/outbound/database/token/IToken";
import NotFoundError from "@ports/inbound/http/api/v1/error/NotFoundError";
import TransactionServiceResultBO from "@domain/transaction/bo/TransactionServiceResultBO";

export default class InboundTransactionAdapter extends Loggable {
    constructor(
        private outboundTransactionRepositoryPort: OutboundTransactionFromBankRepositoryPort,
        private configService: ConfigService,
        private transactionService: TransactionService
    ) {
        super('InboundTransactionAdapter');
    }

    async findTransactionsXValueXUnityAgo(userToken: IToken, frequency: IInboundFrequencyDTO, traceId: string): Promise<TransactionFromBankBO[]> {
        this.log.info(`Finding transactions in last ${frequency.value} ${frequency.unity} for user ${userToken}`, traceId);
        const result = await this.outboundTransactionRepositoryPort.findTransactionsInLastXFrequencyX(userToken, frequency);
        this.log.info(`Found ${result.length} transactions in last ${frequency.value} ${frequency.unity} for user ${userToken}`, traceId);
        return result;
    }

    async saveTransactionInBatch(customName: string, userToken: IToken, transactions: TransactionFromBankBO[], traceId: string): Promise<TransactionServiceResultBO[]> {
        this.log.info(`Saving ${transactions.length} transactions in batch for user ${userToken}`, traceId);
        const configAssociations = await this.configService.findConfigsAssociationsForAllTransactions(userToken, transactions, traceId);
        this.log.info(configAssociations, traceId)
        this.log.info(`Found ${configAssociations.getConfigTransactionAssociation().keys.length} config associations for ${transactions.length} transactions`, traceId);

        const result: TransactionServiceResultBO[] = [];
        for (const transaction of transactions) {
            result.push(await this.transactionService.saveTransaction(customName, transaction, configAssociations, userToken, traceId));
        }

        return result;
    }

    async divideTransactionFromGivenInvoice(userToken: IToken, invoice: IInboundInvoiceDTO, traceId: string) {
        this.log.info(`Dividing transaction from given invoice for user ${userToken}`, traceId);
        const transaction: TransactionFromBankBO = await this.outboundTransactionRepositoryPort.findTransactionFromAGivenInvoice(userToken, invoice);
        if (!transaction) {
            throw new NotFoundError(`Transaction not found for given invoice ${traceId}`);
        }

        this.log.info(`Found transaction from given invoice for user ${userToken}`, traceId);

        this.log.info(`Deleting transaction from given invoice for user ${userToken}`, traceId);
        await this.outboundTransactionRepositoryPort.deleteTransactionById(transaction.getId());
        this.log.info(`Deleted transaction from given invoice for user ${userToken}`, traceId);

        for (const item of invoice.items) {
            await this.outboundTransactionRepositoryPort.saveTransaction(userToken, item);
        }
    }
}