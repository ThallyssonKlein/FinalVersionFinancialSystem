import { Pool } from "pg";
import IToken from "./IToken";

export default class OutboundTokenRepositoryPort {
    constructor(private database: Pool) {}

    async findToken(token: string): Promise<IToken> {
        const { rows } = await this.database.query('SELECT * FROM tokens WHERE token = $1', [token]);
        return rows[0];
    }
}