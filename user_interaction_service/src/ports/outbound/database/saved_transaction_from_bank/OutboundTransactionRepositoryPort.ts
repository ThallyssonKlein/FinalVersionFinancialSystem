import { FrequencyDTO, EUnityDTO } from "../../../inbound/http/api/v1/dto/FrequencyDTO";
import { Pool } from 'pg';
import ISavedTransactionFromBankDAO from "./ITransactionDAO";

export default class OutboundSavedTransactionFromBankRepositoryPort {
    constructor(private database: Pool) {}

    async findTransactionsInLastXFrequencyX(frequency: FrequencyDTO): Promise<ISavedTransactionFromBankDAO[]> {
        let query: string = "SELECT * FROM transactions WHERE date "

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

        return (await this.database.query(query)).rows as ISavedTransactionFromBankDAO[]; 
    }

    async saveTransaction(transaction: ISavedTransactionFromBankDAO): Promise<ISavedTransactionFromBankDAO> {
        const { rows } = await this.database.query('INSERT INTO original_transactions(description, type, value, date) VALUES ($1, $2, $3, $4) RETURNING *', 
            [transaction.description, transaction.type, transaction.value, transaction.date]);
        return rows[0];
    }
}