import { Pool, PoolClient } from 'pg';
// import { ClientSession, startSession } from 'mongoose';
import OutboundMessageRepositoryPort from './mongodb/message/OutboundMessageRepositoryPort';
import { EPaymentType } from '@ports/inbound/http/api/v1/dto/EPaymentType';
import Loggable from '@shared/Loggable';
import ITransactionDAO from './postgresql/transaction/ITransactionDAO';

export default class OutboundTransactionalPaymentConfirmationRepository extends Loggable {
    constructor(private database: Pool, private outboundMessageRepositoryPort: OutboundMessageRepositoryPort) {
        super("TransactionalPaymentConfirmationRepository");
    }

    async savePayment(payment: ITransactionDAO, client: PoolClient): Promise<ITransactionDAO> {
        const { rows } = await client.query('INSERT INTO transactions (amount, currency, receiver_id, sender_id, transaction_type) VALUES ($1, $2, $3, $4, $5) RETURNING *', 
                                                    [payment.amount, payment.currency, payment.receiver_id, payment.sender_id, payment.transaction_type]);
        return rows[0];
    }

    async increaseBRLBalance(userId: number, amount: number, client: PoolClient): Promise<void> {
        await client.query('UPDATE users SET brl_balance = brl_balance + $1 WHERE id = $2', [amount, userId]);
    }

    async increaseBTCBalance(userId: number, amount: number, client: PoolClient): Promise<void> {
        await client.query('UPDATE users SET btc_balance = btc_balance + $1 WHERE id = $2', [amount, userId]);
    }

    async setMessageToPaidThenSavePaymentThenIncreaseBalance(payment: ITransactionDAO, amount: number, paymentId: string, paymentType: EPaymentType): Promise<void> {
        // const mongoSession: ClientSession = await startSession();
        const client = await this.database.connect();

        try {
            await client.query('BEGIN');
            // mongoSession.startTransaction();
            await this.savePayment(payment, client);
            this.log.info("passou no pagamento")
            await this.outboundMessageRepositoryPort.getModel().updateOne({ paymentId }, { $set: { paid: true } }) //{ session: mongoSession });
            if (paymentType === EPaymentType.BRL) {
                await this.increaseBRLBalance(payment.receiver_id, amount, client);
            } else {
                await this.increaseBTCBalance(payment.receiver_id, amount, client);
            }
            this.log.info("passou nos balances")
            await client.query('COMMIT');
            // await mongoSession.commitTransaction();
        } catch (error) {
            this.log.error(error);
            await client.query('ROLLBACK');
            // await mongoSession.abortTransaction();
            throw error;
        } finally {
            client.release();
            // mongoSession.endSession();
        }
    }
}