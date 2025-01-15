import OutboundUserAdapter from "@adapters/outbound/OutboundUserAdapter";
import Loggable from "@shared/Loggable";
import InsufficientBalanceError from "../error/InsufficientBalanceError";
import OutboundTransactionAdapter from "@adapters/outbound/OutboundTransactionAdapter";
import IWithdrawBO from "../bo/IWithdrawBO";
import OutboundEfiBankAPIAdapter from "@adapters/outbound/OutboundEfiBankAPIAdapter";
import OutboundLNBitsAdapter from "@adapters/outbound/OutboundLNBitsAdapter";

export default class WithdrawService extends Loggable {
    constructor(
        private outboundUserAdapter: OutboundUserAdapter,
        private outboundWithdrawAdapter: OutboundTransactionAdapter,
        private outboundEfiBankAPIAdapter: OutboundEfiBankAPIAdapter,
        private outboundLNBitsAdapter: OutboundLNBitsAdapter
    ) {
        super("WithdrawService");
    }

    async pixWithdraw(userId: number, amount: string, pixKey: string, traceId: string): Promise<void> {
        const userBalance = await this.outboundUserAdapter.getUserBrlBalance(userId, traceId);
        this.log.info(`User ${userId} has balance of ${userBalance}`, traceId);

        if (Number(amount) > userBalance) {
            this.log.info(`User ${userId} has insufficient balance`, traceId);
            throw new InsufficientBalanceError();
        }

        const withdraw: IWithdrawBO = await this.outboundWithdrawAdapter.createWithdrawAndReturnBO(userId, Number(amount), 'BRL', traceId);
        this.log.info(`Withdraw created for user ${userId} with id ${withdraw.id}`, traceId);

        await this.outboundUserAdapter.discountUserBrlBalance(userId, Number(amount), traceId);
        this.log.info(`User ${userId} has been discounted by ${amount}`, traceId);

        try {
            await this.outboundEfiBankAPIAdapter.doPixWithdraw(amount, pixKey, withdraw.id, traceId);
        } catch (err) {
            await this.outboundWithdrawAdapter.deleteWithdrawById(withdraw.id, traceId);
            throw err;
        }
    }

    async btcWithdraw(userId: number, invoice: string, traceId: string): Promise<void> {
        let invoiceAmount: number = await this.outboundLNBitsAdapter.getInvoiceAmount(invoice, traceId);
        invoiceAmount = invoiceAmount / 1000
        this.log.info(`Invoice ${invoice} has amount of ${invoiceAmount}`, traceId);
        const userBalance = await this.outboundUserAdapter.getUserBtcBalance(userId, traceId);
        this.log.info(`User ${userId} has balance of ${userBalance}`, traceId);

        if (invoiceAmount > userBalance) {
            this.log.error(`User ${userId} has insufficient balance`, traceId);
            throw new InsufficientBalanceError();
        }

        const withdraw: IWithdrawBO = await this.outboundWithdrawAdapter.createWithdrawAndReturnBO(userId, invoiceAmount, 'BTC', traceId);
        this.log.info(`Withdraw created for user ${userId}`, traceId);

        await this.outboundUserAdapter.discountUserBtcBalance(userId, invoiceAmount, traceId);
        this.log.info(`User ${userId} has been discounted by ${invoiceAmount}`, traceId);

        try {
            await this.outboundLNBitsAdapter.doBtcWithdraw(invoice, traceId);
            this.log.info(`Withdraw completed for user ${userId}`, traceId);
        } catch (err) {
            await this.outboundWithdrawAdapter.deleteWithdrawById(withdraw.id, traceId);
            this.log.error(`Error while doing withdraw for user ${userId}`, traceId);
            throw err;
        }
    }

    async virtualWithdraw(userId: number, amount: number, currency: "BTC" | "BRL", traceId: string): Promise<void> {
        let userCurrentBalance

        if (currency === "BRL") {
            userCurrentBalance = await this.outboundUserAdapter.getUserBrlBalance(userId, traceId);
            this.log.info(`User ${userId} has balance of ${userCurrentBalance}`, traceId);
            if (amount > userCurrentBalance) {
                this.log.error(`User ${userId} has insufficient balance`, traceId);
                throw new InsufficientBalanceError();
            }
        } else {
            userCurrentBalance = await this.outboundUserAdapter.getUserBtcBalance(userId, traceId);
            this.log.info(`User ${userId} has balance of ${userCurrentBalance}`, traceId);
            if (amount > userCurrentBalance) {
                this.log.error(`User ${userId} has insufficient balance`, traceId);
                throw new InsufficientBalanceError();
            }
        }

        const withdraw = await this.outboundWithdrawAdapter.createWithdrawAndReturnBO(userId, amount, currency, traceId);
        this.log.info(`Virtual withdraw created for user ${userId}`, traceId);

        try {
            if (currency === "BRL") {
                await this.outboundUserAdapter.discountUserBrlBalance(userId, Number(amount), traceId);
                this.log.info(`User ${userId} has been discounted by ${amount}`, traceId);
            } else {
                await this.outboundUserAdapter.discountUserBtcBalance(userId, Number(amount), traceId);
                this.log.info(`User ${userId} has been discounted by ${amount}`, traceId);
            }
        } catch (err) {
            this.log.error(`Error while creating virtual withdraw for user ${userId}`, traceId);
            await this.outboundWithdrawAdapter.deleteWithdrawById(withdraw.id, traceId);
            this.log.info(`Withdraw ${withdraw.id} deleted`, traceId);
            throw err;
        }
    }
}