import { NotFoundError } from "@ports/inbound/http/api/v1/error";
import IUserDAO, { IBalances } from "@ports/outbound/postgresql/user/IUserDAO";
import OutboundUserRepositoryPort from "@ports/outbound/postgresql/user/OutboundUserRepositoryPort";
import Loggable from "@shared/Loggable";

export default class OutboundUserAdapter extends Loggable {
    constructor(
        private outboundUserRepositoryPort: OutboundUserRepositoryPort
    ) {
        super("OutboundUserAdapter");
    }

    async getUserBrlBalance(userId: number, traceId: string): Promise<number> {
        const result: Pick<IBalances, "brl_balance"> = await this.outboundUserRepositoryPort.getBRLBalance(userId);
        this.log.info(`User ${userId} has balance of ${result.brl_balance}`, traceId);

        return result.brl_balance;
    }

    async getUserBtcBalance(userId: number, traceId: string): Promise<number> {
        const result: Pick<IBalances, "btc_balance"> = await this.outboundUserRepositoryPort.getBTCBalance(userId);
        this.log.info(`User ${userId} has balance of ${result.btc_balance}`, traceId);

        return result.btc_balance;
    }

    async discountUserBrlBalance(userId: number, amount: number, traceId: string): Promise<void> {
        await this.outboundUserRepositoryPort.discountBRLBalance(userId, amount);
        this.log.info(`User ${userId} has been discounted by ${amount}`, traceId);
    }

    async discountUserBtcBalance(userId: number, amount: number, traceId: string): Promise<void> {
        await this.outboundUserRepositoryPort.discountBTCBalance(userId, amount);
        this.log.info(`User ${userId} has been discounted by ${amount}`, traceId);
    }

    async findUserById(userId: number, traceId: string): Promise<IUserDAO> {
        const result = await this.outboundUserRepositoryPort.findUserById(userId);
        if (result.length === 0) {
            this.log.error(`User ${userId} not found`, traceId);
            throw new NotFoundError("User not found");
        }
        this.log.info(`User ${userId} found: ${result}`, traceId);

        return result[0];
    }
}