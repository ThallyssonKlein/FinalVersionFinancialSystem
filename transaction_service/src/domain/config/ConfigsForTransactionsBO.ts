import TransactionBO from "@domain/transaction/bo/TransactionBO";
import { ConfigBO } from "./ConfigBO";

class PairBO {
    constructor(
        private pairName: string,
        private config: ConfigBO,
        private transactions: TransactionBO[]
    ) {}

    getPairName() {
        return this.pairName;
    }

    getConfig() {
        return this.config;
    }

    getTransactions() {
        return this.transactions;
    }

    setPairName(pairName: string) {
        this.pairName = pairName;
    }

    setConfig(config: ConfigBO) {
        this.config = config;
    }
    
    setTransactions(transactions: TransactionBO[]) {
        this.transactions = transactions;
    }
}
export default class ConfigsForTransactionsBO {
    constructor(private configTransactionAssociation: Map<string, ConfigBO>, private pairBOS: PairBO[]) {}

    getConfigTransactionAssociation() {
        return this.configTransactionAssociation;
    }

    getPairBOS() {
        return this.pairBOS;
    }

    setConfigTransactionAssociation(configTransactionAssociation: Map<string, ConfigBO>) {
        this.configTransactionAssociation = configTransactionAssociation;
    }

    setPairBOS(pairBOS: PairBO[]) {
        this.pairBOS = pairBOS;
    }
}