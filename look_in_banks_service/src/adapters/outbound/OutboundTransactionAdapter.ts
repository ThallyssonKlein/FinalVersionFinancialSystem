import IWithdrawBO from "@domain/user/bo/IWithdrawBO";
import ITransactionDAO from "@ports/outbound/postgresql/transaction/ITransactionDAO";
import OutboundTransactionRepositoryPort from "@ports/outbound/postgresql/transaction/OutboundTransactionRepositoryPort";
import Loggable from "@shared/Loggable";

export default class OutboundTransactionAdapter extends Loggable {
    constructor(
        private outboundTransactionRepositoryPort: OutboundTransactionRepositoryPort,
    ) {
        super("OutboundTransactionAdapter");
    }

    private mapIWithdrawDAOToIWithdrawBO(withdraw: ITransactionDAO): IWithdrawBO {
        return {
            id: withdraw.id,
            amount: withdraw.amount,
            currency: withdraw.currency,
            receiver_id: withdraw.receiver_id,
        };
    }

    async createWithdrawAndReturnBO(userId: number, amount: number, currency: "BRL" | "BTC", traceId: string): Promise<IWithdrawBO> {
        const result: ITransactionDAO = await this.outboundTransactionRepositoryPort.createWithdraw({
            amount: amount,
            currency,
            receiver_id: userId,
            transaction_type: "withdraw"
        });
        this.log.info(`Withdraw created for user ${userId}`, traceId);
        return this.mapIWithdrawDAOToIWithdrawBO(result);
    }

    async createWithdraw(userId: number, amount: number, currency: "BRL" | "BTC", traceId: string): Promise<ITransactionDAO> {
        const result: ITransactionDAO = await this.outboundTransactionRepositoryPort.createWithdraw({
            amount,
            currency,
            receiver_id: userId,
            transaction_type: "withdraw"
        });
        this.log.info(`Withdraw created for user ${userId}`, traceId);
        return result;
    }

    async deleteWithdrawById(withdrawId: number, traceId: string): Promise<void> {
        await this.outboundTransactionRepositoryPort.deleteTransactionById(withdrawId);
        this.log.info(`Withdraw ${withdrawId} deleted`, traceId);
    }
}