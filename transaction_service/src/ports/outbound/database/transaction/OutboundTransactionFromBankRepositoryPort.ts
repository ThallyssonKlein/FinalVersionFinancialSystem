import TransactionFromBankBO from "@domain/transaction/bo/TransactionFromBankBO";
import { IInboundFrequencyDTO, EUnityDTO } from "../../../inbound/http/api/v1/dto/inbound/IInboundFrequencyDTO";
import { Pool } from 'pg';

export default class OutboundTransactionFromBankRepositoryPort {
    constructor(private database: Pool) {}

    async findTransactionsInLastXFrequencyX(userToken: string, frequency: IInboundFrequencyDTO): Promise<TransactionFromBankBO[]> {
        let query: string = "SELECT * FROM original_transactions WHERE date "

        switch(frequency.unity) {
            case EUnityDTO.DAY:
                 query += "BETWEEN NOW() - INTERVAL " + frequency.value + " DAY AND NOW()";
                 break;
            case EUnityDTO.WEEK:
                query += "BETWEEN NOW() - INTERVAL " + frequency.value + " WEEK AND NOW()";
                break;
            case EUnityDTO.MONTH:
                query += "BETWEEN NOW() - INTERVAL " + frequency.value + " MONTH AND NOW()";
                break;
            case EUnityDTO.YEAR:
                query += "BETWEEN NOW() - INTERVAL " + frequency.value + " YEAR AND NOW()";
                break;
        }

        query += " AND user_token = '" + userToken + "'";

        return (await this.database.query(query)).rows as TransactionFromBankBO[]; 
    }

    async saveTransaction(transaction: TransactionFromBankBO): Promise<TransactionFromBankBO> {
        const { rows } = await this.database.query('INSERT INTO original_transactions(description, type, value, date) VALUES ($1, $2, $3, $4) RETURNING *', 
            [transaction.getDescription(), transaction.getType(), transaction.getValue(), transaction.getDate()]);
        return rows[0];
    }
}