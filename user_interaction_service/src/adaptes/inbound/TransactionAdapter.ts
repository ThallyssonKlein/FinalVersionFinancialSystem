import { FrequencyDTO } from "../../ports/inbound/http/api/v1/dto/FrequencyDTO";
import OutboundSavedTransactionFromBankRepositoryPort from "../../ports/outbound/database/saved_transaction_from_bank/OutboundTransactionRepositoryPort";
import Loggable from "../../shared/loggable";

export default class TransactionAdapter extends Loggable {
    constructor(
        private outboundTransactionRepositoryPort: OutboundSavedTransactionFromBankRepositoryPort
    ) {
        super('TransactionAdapter');
    }

    async findTransactionsXValueXUnityAgo(frequency: FrequencyDTO): Promise<any> {
        return await this.outboundTransactionRepositoryPort.findTransactionsXValueXUnityAgo(frequency);
    }
}