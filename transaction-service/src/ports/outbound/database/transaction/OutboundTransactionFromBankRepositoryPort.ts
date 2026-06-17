import TransactionFromBankBO from "@domain/transaction/bo/TransactionFromBankBO";
import { IInboundFrequencyDTO, EUnityDTO } from "../../../inbound/http/api/v1/dto/inbound/IInboundFrequencyDTO";
import { Pool } from 'pg';
import IInboundInvoiceDTO from "@ports/inbound/http/api/v1/dto/inbound/IInboundInvoiceDTO";
import IToken from "../token/IToken";

export default class OutboundTransactionFromBankRepositoryPort {
    constructor(private database: Pool) {}

    async findTransactionsInLastXFrequencyX(userToken: IToken, frequency: IInboundFrequencyDTO): Promise<TransactionFromBankBO[]> {
        const unityMap: Record<EUnityDTO, string> = {
            [EUnityDTO.DAY]: 'DAY',
            [EUnityDTO.WEEK]: 'WEEK',
            [EUnityDTO.MONTH]: 'MONTH',
            [EUnityDTO.YEAR]: 'YEAR',
        };

        const unitySql = unityMap[frequency.unity];
        if (!unitySql) return [];

        const query = `SELECT description, type, value, date, user_token, id, custom_name FROM original_transactions WHERE date BETWEEN NOW() - ($1::int * INTERVAL '1 ${unitySql}') AND NOW() AND user_token = $2`;

        return (await this.database.query(query, [frequency.value, userToken.value])).rows as TransactionFromBankBO[];
    }

    async saveTransaction(userToken: IToken, transaction: TransactionFromBankBO): Promise<TransactionFromBankBO> {
        const { rows } = await this.database.query('INSERT INTO original_transactions(description, type, value, date, user_token) VALUES ($1, $2, $3, $4, $5) RETURNING *', 
            [transaction.getDescription(), transaction.getType(), transaction.getValue(), transaction.getDate(), userToken.value]);
        
        if (rows.length > 0) {
            return rows[0];
        }

        return null;
    }

    async findTransactionFromAGivenInvoice(userToken: IToken, invoice: IInboundInvoiceDTO): Promise<TransactionFromBankBO> {
        const query = `
        SELECT description, type, value, date, user_token, id, custom_name 
        FROM original_transactions WHERE date = $ AND user_token = $ AND value = $ AND description LIKE '%$%'`;

        const { rows } = await this.database.query(query, [invoice.date, userToken.value, invoice.total, invoice.market]);
        
        if (rows.length > 0) {
            return rows[0];
        }

        return null;
    }

    async deleteTransactionById(transactionId: string): Promise<void> {
        await this.database.query('DELETE FROM original_transactions WHERE id = $1', [transactionId]);
    }
}