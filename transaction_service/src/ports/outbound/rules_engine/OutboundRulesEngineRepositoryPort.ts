import { ApisauceInstance } from "apisauce";
import { ConfigBO } from "@domain/config/ConfigBO";
import TransactionsGroupedByDateBO from "@domain/transaction/bo/TransactionsGroupedByDateBO";
import ConfigsForTransactionsBO from "@domain/config/ConfigsForTransactionsBO";
import TransactionFromBankBO from "@domain/transaction/bo/TransactionFromBankBO";

export default class OutboundRulesEngineRepositoryPort {
    constructor(private rulesEngineClient: ApisauceInstance) {}

    async determineConfigsForTransactions(defaultConfig: ConfigBO, allConfigs: ConfigBO[], transactions: TransactionFromBankBO[], transactionsGroupedByDate: TransactionsGroupedByDateBO[]): Promise<ConfigsForTransactionsBO> {
        const response = await this.rulesEngineClient.post('/api/v1/determine_configs_for_transactions', {
            default_config: defaultConfig,
            all_configs: allConfigs,
            transactions: transactions,
            transactions_grouped_by_date: transactionsGroupedByDate
        });

        return response.data as ConfigsForTransactionsBO;
    }
}