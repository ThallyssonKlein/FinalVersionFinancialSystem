import Config from "@config/index";
import Loggable from "@shared/Loggable";
import { ConfigBO } from "./ConfigBO";
import TransactionFromBankBO from "@domain/transaction/bo/TransactionFromBankBO";
import TransactionsGroupedByDateBO from "@domain/transaction/bo/TransactionsGroupedByDateBO";
import OutboundConfigAdapter from "@adapters/outbound/OutboundConfigAdapter";
import ConfigsForTransactionsBO from "./ConfigsForTransactionsBO";
import OutboundRulesEngineAdapter from "@adapters/outbound/OutboundRulesEngineAdapter";
import IToken from "@ports/outbound/database/token/IToken";

export default class ConfigService extends Loggable {
    private config = new Config().getConfig();

    constructor(
        private outboundConfigAdapter: OutboundConfigAdapter,
        private outboundRulesEngineAdapter: OutboundRulesEngineAdapter,
    ) {
        super('ConfigService');
    }

    private groupTransactionsByDate(allTransactions: TransactionFromBankBO[]): TransactionsGroupedByDateBO[] {
        const transactionsGroupedByDate: TransactionsGroupedByDateBO[] = [];
        for (const transaction of allTransactions) {
            const foundTransaction = transactionsGroupedByDate.find(t => t.getDate() === transaction.getDate());
            if (foundTransaction) {
                foundTransaction.getTransactions().push(transaction);
            } else {
                transactionsGroupedByDate.push(new TransactionsGroupedByDateBO(transaction.getDate(), [transaction]));
            }
        }

        return transactionsGroupedByDate;
    }

     async findConfigsAssociationsForAllTransactions(userToken: IToken, allTransactions: TransactionFromBankBO[], traceId: string): Promise<ConfigsForTransactionsBO> {
        this.log.info(`Finding config for that transaction`, traceId);
        const allConfigs: ConfigBO[] = await this.outboundConfigAdapter.findAllConfigs(userToken, traceId);
        this.log.info(`Found ${allConfigs.length} configs`, traceId);
        this.log.info(`Finding default config`, traceId);
        const defaultConfig: ConfigBO = this.findDefaultConfig(allConfigs);
        this.log.info(`Found default config`, traceId);
        this.log.info(`Grouping transactions by date`, traceId);
        const transactionsGroupedByDate = this.groupTransactionsByDate(allTransactions);
        this.log.info(`Grouped transactions by date`, traceId);

        this.log.info(`Determining configs for transactions`, traceId);
        return await this.outboundRulesEngineAdapter.determineConfigsForTransactions(defaultConfig, allConfigs, allTransactions, transactionsGroupedByDate, traceId);
    }


    private findDefaultConfig(allConfigs: ConfigBO[]) {
        this.log.info(`Finding default config`);
        const foundConfig = allConfigs.find(config => config.getId() === this.config.business.defaultConfigId);

        if (!foundConfig) {
            this.log.error(`Default config not found`);
            throw new Error(`Default config not found`);
        }

        this.log.info(`Found default config`);
        return foundConfig;
    }
}