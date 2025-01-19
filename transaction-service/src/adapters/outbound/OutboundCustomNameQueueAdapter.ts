import TransactionFromBankBO from "@domain/transaction/bo/TransactionFromBankBO";
import Loggable from "@shared/Loggable";

export default class OutboundCustomNameQueueAdapter extends Loggable {
    constructor(
    ) {
        super('OutboundCustomNameQueueAdapter');
    }

    async sendToCustomNameQueue(transaction: TransactionFromBankBO) {
        // mockend send to queue
        this.log.info(`Sending transaction to custom name queue`);
    }
}