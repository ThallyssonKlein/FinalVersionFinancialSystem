import { Pool } from "pg";
import ITransactionDAO from "./ITransactionDAO";

export default class OutboundTransactionRepositoryPort {
    constructor(private database: Pool) {}

    async deleteTransactionById(id: number): Promise<void> {
        await this.database.query('DELETE FROM transactions WHERE id = $1', [id]);
    }

    async findAllTransactionsWithPagination(page: number, pageSize: number, userId?: number): Promise<ITransactionDAO[]> {
        const offset = (page - 1) * pageSize;
        if (userId) {
            return (await this.database.query(`
                SELECT p.id, p.amount, p.currency, p.sender_id, p.created_At, u.username as receiver_name, u.id as user_id, p.transaction_type 
                FROM transactions p 
                JOIN users u ON p.receiver_id = u.id 
                WHERE p.receiver_id = $1
                ORDER BY p.created_at DESC 
                LIMIT $2 OFFSET $3`, [userId, pageSize, offset])).rows;
        } else {
            return (await this.database.query(`
                SELECT p.id, p.amount, p.currency, p.sender_id, p.created_At, u.username as receiver_name, u.id as user_id, p.transaction_type 
                FROM transactions p 
                JOIN users u ON p.receiver_id = u.id 
                ORDER BY p.created_at DESC 
                LIMIT $1 OFFSET $2`, [pageSize, offset])).rows;
        }
    }

    async countAllTransactions(userId?: number): Promise<number> {
        if (userId) {
            return (await this.database.query('SELECT COUNT(*) FROM transactions WHERE receiver_id = $1', [userId])).rows[0].count;
        } else {
            return (await this.database.query('SELECT COUNT(*) FROM transactions')).rows[0].count;
        }
    }

    async countAllTransactionsWithDateRange(startDate: Date, endDate: Date, userId?: number): Promise<number> {
        if (userId) {
            if (startDate && endDate) {
                return (await this.database.query('SELECT COUNT(*) FROM transactions WHERE receiver_id = $1 AND created_at BETWEEN $2 AND $3', [userId, startDate, endDate])).rows[0].count;
            } else if (startDate) {
                const startDateUtc = new Date(startDate);
                startDateUtc.setUTCHours(0, 0, 0, 0); // Zera horas, minutos, segundos e milissegundos
                return (await this.database.query('SELECT COUNT(*) FROM transactions WHERE receiver_id = $1 AND created_at >= $2 AND created_at < $2 + interval \'1 day\'', [userId, startDateUtc])).rows[0].count;
            }
        } else {
            if (startDate && endDate) {
                return (await this.database.query('SELECT COUNT(*) FROM transactions WHERE created_at BETWEEN $1 AND $2', [startDate, endDate])).rows[0].count;
            } else if (startDate) {
                const startDateUtc = new Date(startDate);
                startDateUtc.setUTCHours(0, 0, 0, 0); // Zera horas, minutos, segundos e milissegundos
                return (await this.database.query('SELECT COUNT(*) FROM transactions WHERE created_at >= $1 AND created_at < $1 + interval \'1 day\'', [startDateUtc])).rows[0].count;
            }
        }
    }

    async findAllTransactionsWithDateRangeWithPagination(page: number, pageSize: number, startDate: Date, endDate: Date, userId?: number): Promise<ITransactionDAO[]> {
        const offset = (page - 1) * pageSize;
        if (userId) {
            if (startDate && endDate) {
                return (await this.database.query(`
                    SELECT p.id, p.amount, p.currency, p.sender_id, p.created_At, u.username as receiver_name, p.transaction_type 
                    FROM transactions p 
                    JOIN users u ON p.receiver_id = u.id 
                    WHERE p.receiver_id = $1 AND p.created_at BETWEEN $2 AND $3
                    ORDER BY p.created_at DESC 
                    LIMIT $4 OFFSET $5`, [userId, startDate, endDate, pageSize, offset])).rows;
            } else if (startDate) {
                const startDateUtc = new Date(startDate);
                startDateUtc.setUTCHours(0, 0, 0, 0); // Zera horas, minutos, segundos e milissegundos
                return (await this.database.query(`
                    SELECT p.id, p.amount, p.currency, p.sender_id, p.created_At, u.username as receiver_name, p.transaction_type 
                    FROM transactions p 
                    JOIN users u ON p.receiver_id = u.id 
                    WHERE p.receiver_id = $1 AND created_at >= $2 AND created_at < $2 + interval '1 day'
                    ORDER BY p.created_at DESC 
                    LIMIT $3 OFFSET $4`, [userId, startDateUtc, pageSize, offset])).rows;
            }
        } else {
            if (startDate && endDate) {
                return (await this.database.query(`
                    SELECT p.id, p.amount, p.currency, p.sender_id, p.created_At, u.username as receiver_name, p.transaction_type 
                    FROM transactions p 
                    JOIN users u ON p.receiver_id = u.id 
                    WHERE p.created_at BETWEEN $1 AND $2
                    ORDER BY p.created_at DESC 
                    LIMIT $3 OFFSET $4`, [startDate, endDate, pageSize, offset])).rows;
            } else if (startDate) {
                const startDateUtc = new Date(startDate);
                startDateUtc.setUTCHours(0, 0, 0, 0); // Zera horas, minutos, segundos e milissegundos
                return (await this.database.query(`
                    SELECT p.id, p.amount, p.currency, p.sender_id, p.created_At, u.username as receiver_name, p.transaction_type 
                    FROM transactions p 
                    JOIN users u ON p.receiver_id = u.id 
                    WHERE created_at >= $1 AND created_at < $1 + interval '1 day'
                    ORDER BY p.created_at DESC 
                    LIMIT $2 OFFSET $3`, [startDateUtc, pageSize, offset])).rows;
            }
        }
    }

    async createWithdraw(withdraw: ITransactionDAO): Promise<ITransactionDAO> {
        const result = await this.database.query('INSERT INTO transactions (id, amount, currency, receiver_id, transaction_type) VALUES (DEFAULT, $1, $2, $3, \'withdraw\') RETURNING *', 
                                                [withdraw.amount, withdraw.currency, withdraw.receiver_id]);
        console.log(result)
        return result.rows[0];
    }
}