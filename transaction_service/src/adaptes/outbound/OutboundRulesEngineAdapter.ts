import { ConfigBO } from "@domain/config/ConfigBO";
import { TransactionFromBankBO } from "@domain/transaction/bo/TransactionFromBankBO";
import TransactionsGroupedByDateBO from "@domain/transaction/bo/TransactionsGroupedByDateBO";
import OutboundRulesEngineRepositoryPort from "@ports/outbound/rules_engine/OutboundRulesEngineRepositoryPort";
import Loggable from "@shared/Loggable";

export default class OutboundRulesEngineAdapter extends Loggable {
    constructor(
        private outboundRulesEngineRepositoryPort: OutboundRulesEngineRepositoryPort,
    ) {
        super('OutboundRulesEngineAdapter');
    }

    async determineConfigsForTransactions(defaultConfig: ConfigBO, allConfigs: ConfigBO[], transactions: TransactionFromBankBO[], transactionsGroupedByDate: TransactionsGroupedByDateBO[]): Promise<ConfigsForTransactionsBO> {
        this.log.info(`Determining configs for transactions`);
        const result = await this.outboundRulesEngineRepositoryPort.determineConfigsForTransactions(defaultConfig, allConfigs, transactions, transactionsGroupedByDate);
        this.log.info(`Configs determined`);
        return result;
    }
}