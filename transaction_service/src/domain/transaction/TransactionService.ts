import OutboundTransactionNotionAdapter from "adaptes/outbound/OutboundTransactionNotionAdapter";
import Loggable from "@shared/Loggable";
import ConfigsForTransactionsBO from "@domain/config/ConfigsForTransactionsBO";
import TransactionBO from "./bo/TransactionBO";
import { ConfigBO } from "@domain/config/ConfigBO";
import TransactionFromBankBO from "./bo/TransactionFromBankBO";
import OutboundCustomNameQueueAdapter from "adaptes/outbound/OutboundCustomNameQueueAdapter";
import OutboundTransactionFromBankAdapter from "adaptes/outbound/OutboundTransactionFromBankAdapter";
import TransactionServiceResultBO from "./bo/TransactionServiceResultBO";

export default class TransactionService extends Loggable {
    constructor(
        private outboundTransactionNotionAdapter: OutboundTransactionNotionAdapter,
        private outboundCustomNameQueueAdapter: OutboundCustomNameQueueAdapter,
        private outboundTransactionFromBankAdapter: OutboundTransactionFromBankAdapter,
    ) {
        super('TransactionService');
    }

    private getTransactionConfigFromAssociation(transactionId: string, configAssociations: ConfigsForTransactionsBO): ConfigBO | null {
        return configAssociations.getConfigTransactionAssociation()[transactionId];
    }

    private convertTransactionFromBankToTransaction(transaction: TransactionFromBankBO, configAssociations: ConfigsForTransactionsBO): TransactionBO {
        let config: ConfigBO | null = null

        config = this.getTransactionConfigFromAssociation(transaction.getId(), configAssociations);
        
        let name = "";

        if (!config.getCustonName()) {
            name = config.getUse().getDefaultName() ? config.getUse().getDefaultName() : transaction.getDescription();
        } else {
            name = transaction.getCustonName();
        }

        if (config) {
            return new TransactionBO(
                name,
                transaction.getValue(),
                transaction.getDate(),
                config.getUse().getCategory(),
                config.getUse().getSubcategory()
            );
        } else {
            for(const pairBO of configAssociations.getPairBOS()) {
                const theresTransactionIdInThePair = pairBO.getTransactions().find(transaction => transaction.getId() === transaction.getId());

                if (theresTransactionIdInThePair) {
                    return new TransactionBO(
                        pairBO.getPairName(),
                        pairBO.getTransactions().reduce((acc, transaction) => acc + transaction.getValue(), 0),
                        transaction.getDate(),
                        config.getUse().getCategory(),
                        config.getUse().getSubcategory()
                    )
                }
            }
        }
    }

    async saveTransaction(transaction: TransactionFromBankBO, configAssociations: ConfigsForTransactionsBO, traceId: string): Promise<TransactionServiceResultBO> {
        this.log.info(`Saving transaction ${transaction.getDescription()}`, traceId);

        let configForThisTransaction: ConfigBO = this.getTransactionConfigFromAssociation(transaction.getId(), configAssociations);
        if (configForThisTransaction.getCustonName() && !transaction.getCustonName()) {
            await this.outboundCustomNameQueueAdapter.sendToCustomNameQueue(transaction);
            return;
        }
        let transactionBO: TransactionBO = this.convertTransactionFromBankToTransaction(transaction, configAssociations)

        let saveOnNotionResponse: TransactionBO | null = null
        try {
            this.log.info(`Saving transaction on Notion`, traceId);
            saveOnNotionResponse = await this.outboundTransactionNotionAdapter.createTransaction(transactionBO);
            this.log.info(`Transaction saved on Notion with id ${saveOnNotionResponse.getId()}`, traceId);
        } catch (err) {
            this.log.error('Error saving transaction on Notion', err);
            throw err;
        }

        let savedOnBankResponse: TransactionFromBankBO | null = null

        if (saveOnNotionResponse && saveOnNotionResponse.getId()) {
            this.log.info(`Transaction saved on Notion with id ${saveOnNotionResponse.getId()}. Saving on bank`, traceId);
            try {
                this.log.info(`Saving transaction on bank`, traceId);
                savedOnBankResponse = await this.outboundTransactionFromBankAdapter.saveTransaction(transaction);
                this.log.info(`Transaction saved on bank with id ${savedOnBankResponse.getId()}`, traceId);
            } catch (err) {
                this.log.error('Error saving transaction on bank', err);
                try {
                    this.log.info(`Deleting transaction on Notion with id ${saveOnNotionResponse.getId()}`, traceId);
                    await this.outboundTransactionNotionAdapter.deleteTransactionById(saveOnNotionResponse.getId());
                    this.log.info(`Transaction deleted on Notion with id ${saveOnNotionResponse.getId()}`, traceId);
                } catch (err) {
                    this.log.error('Error deleting transaction on Notion', err);
                    throw err;
                }
            }
        } else {
            throw new Error("Error saving transaction on Notion");
        }

        return new TransactionServiceResultBO(
            savedOnBankResponse,
            saveOnNotionResponse
        )
    }
}