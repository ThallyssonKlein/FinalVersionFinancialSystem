import { Pool, type QueryConfig } from 'pg';
import IUserDAO, { IBalances } from './IUserDAO';
import IInboundUserDTO from '@ports/inbound/http/api/v1/dto/IInboundUserDTO';

export default class OutboundUserRepositoryPort {
    constructor(private database: Pool) {}

    async registerUser(dto: IInboundUserDTO): Promise<void> {
        let query = 'INSERT INTO users (';
        let values = 'VALUES (';
        const params: any[] = [];
        let paramsCounter = 3;
    

        query += 'username, ';
        values += '$1, ';
        params.push(dto.username);

        query += 'password, ';
        values += '$2, ';
        params.push(dto.password);
    
        if (dto.email) {
          query += 'email, ';
          values += `$${paramsCounter}, `;
          paramsCounter += 1
          params.push(dto.email);
        }

        if (dto.xUsername) {
          query += 'x_username, ';
          values += `$${paramsCounter}, `;
          paramsCounter += 1
          params.push(dto.xUsername);
        }

        if (dto.instagramUsername) {
          query += 'instagram_username, ';
          values += `$${paramsCounter}, `;
          paramsCounter += 1
          params.push(dto.instagramUsername);
        }

        if (dto.facebookUsername) {
          query += 'facebook_username, ';
          values += `$${paramsCounter}, `;
          paramsCounter += 1
          params.push(dto.facebookUsername);
        }

        if (dto.nostrUsername) {
          query += 'nostr_username, ';
          values += `$${paramsCounter}, `;
          paramsCounter += 1
          params.push(dto.nostrUsername);
        }

        if (dto.telegramUsername) {
          query += 'telegram_username, ';
          values += `$${paramsCounter}, `;
          paramsCounter += 1
          params.push(dto.telegramUsername);
        }

        if (dto.whatsappUsername) {
          query += 'whatsapp_username, ';
          values += `$${paramsCounter}, `;
          paramsCounter += 1
          params.push(dto.whatsappUsername);
        }

        if (dto.youtubeUsername) {
          query += 'youtube_username, ';
          values += `$${paramsCounter}, `;
          paramsCounter += 1
          params.push(dto.youtubeUsername);
        }

        if (dto.twitchUsername) {
          query += 'twitch_username, ';
          values += `$${paramsCounter}, `;
          paramsCounter += 1
          params.push(dto.twitchUsername);
        }
    
        // Remove the trailing comma and space
        query = query.slice(0, -2) + ') ';
        values = values.slice(0, -2) + ')';
    
        query += values;

        console.log(query)
    
        await this.database.query(query, params);
    }    

    async updateUser(id: number, dto: IInboundUserDTO, fileUrl?: string): Promise<void> {
        const setClauses = []
        const values: any[] = []
        let paramIndex = 1

        if (dto !== null && dto !== undefined && dto.username) {
            setClauses.push(`username = $${paramIndex}`)
            values.push(dto.username);
            paramIndex++
        }

        if (dto !== null && dto !== undefined && dto.email) {
            setClauses.push(`email = $${paramIndex}`)
            values.push(dto.email);
            paramIndex++
        }

        if (fileUrl) {
            setClauses.push(`photo_url = $${paramIndex}`)
            values.push(fileUrl);
            paramIndex++
        }

        if (dto !== null && dto !== undefined && dto.xUsername !== null && dto.xUsername !== undefined) {
            setClauses.push(`x_username = $${paramIndex}`)
            values.push(dto.xUsername);
            paramIndex++
        }

        if (dto !== null && dto !== undefined && dto.instagramUsername !== null && dto.instagramUsername !== undefined) {
            setClauses.push(`instagram_username = $${paramIndex}`)
            values.push(dto.instagramUsername);
            paramIndex++
        }

        if (dto !== null && dto !== undefined && dto.facebookUsername !== null && dto.facebookUsername !== undefined) {
            setClauses.push(`facebook_username = $${paramIndex}`)
            values.push(dto.facebookUsername);
            paramIndex++
        }

        if (dto !== null && dto !== undefined && dto.nostrUsername !== null && dto.nostrUsername !== undefined) {
            setClauses.push(`nostr_username = $${paramIndex}`)
            values.push(dto.nostrUsername);
            paramIndex++
        }

        if (dto !== null && dto !== undefined && dto.telegramUsername !== null && dto.telegramUsername !== undefined) {
            setClauses.push(`telegram_username = $${paramIndex}`)
            values.push(dto.telegramUsername);
            paramIndex++
        }

        if (dto !== null && dto !== undefined && dto.whatsappUsername !== null && dto.whatsappUsername !== undefined) {
            setClauses.push(`whatsapp_username = $${paramIndex}`)
            values.push(dto.whatsappUsername);
            paramIndex++
        }

        if (dto !== null && dto !== undefined && dto.youtubeUsername !== null && dto.youtubeUsername !== undefined) {
            setClauses.push(`youtube_username = $${paramIndex}`)
            values.push(dto.youtubeUsername);
            paramIndex++
        }

        if (dto !== null && dto !== undefined && dto.twitchUsername !== null && dto.twitchUsername !== undefined) {
            setClauses.push(`twitch_username = $${paramIndex}`)
            values.push(dto.twitchUsername);
            paramIndex++
        }
        
        const query: QueryConfig = {
            text: `
                UPDATE users
                SET ${setClauses.join(', ')}
                WHERE id = $${paramIndex}
            `,
            values: [...values, id],
        }
    
        await this.database.query(query);
    }

    async findUserByUsername(username: string): Promise<IUserDAO[]> {
        return (await this.database.query('SELECT id, username, photo_url, password, x_username, instagram_username, facebook_username, nostr_username, telegram_username, whatsapp_username, youtube_username, twitch_username FROM users WHERE username = $1 AND is_deleted = FALSE', [username])).rows
    }

    async findUserByUsernameWithAllFields(username: string): Promise<IUserDAO[]> {
        return (await this.database.query('SELECT id, username, password, email, is_deleted, btc_balance, brl_balance, photo_url, tax_value, x_username, instagram_username, facebook_username, nostr_username, telegram_username, whatsapp_username, youtube_username, twitch_username FROM users WHERE username = $1 AND is_deleted = FALSE', [username])).rows
    }

    async findUserByUsernameOrEmail(username: string, email: string): Promise<IUserDAO[]> {
        return (await this.database.query('SELECT id password FROM users WHERE (username = $1 OR email = $2) AND is_deleted = FALSE', [username, email])).rows
    }

    async findUserByEmail(email: string): Promise<IUserDAO[]> {
        return (await this.database.query('SELECT id FROM users WHERE email = $1 AND is_deleted = FALSE', [email])).rows
    }

    async logicalDelete(userId: number): Promise<void> {
        await this.database.query('UPDATE users SET is_deleted = TRUE, deleted_at = NOW() WHERE id = $1', [userId]);  
    }

    async physicalDelete(userId: number): Promise<void> {
        await this.database.query('DELETE FROM users WHERE id = $1', [userId]);
    }

    async findUserById(userId: number): Promise<IUserDAO[]> {
        return (await this.database.query('SELECT id, username, email, is_deleted, btc_balance, brl_balance, photo_url, tax_value, x_username, instagram_username, facebook_username, nostr_username, telegram_username, whatsapp_username, youtube_username, twitch_username FROM users WHERE id = $1 AND is_deleted = FALSE', [userId])).rows
    }

    async findAllLogicallyDeletedUsersMoreThan1MonthAgo(): Promise<IUserDAO[]> {
        return (await this.database.query('SELECT id FROM users WHERE is_deleted = TRUE AND deleted_at < NOW() - INTERVAL \'1 month\'')).rows
    }

    async getBalances(userId: number): Promise<IBalances[]> {
        return (await this.database.query('SELECT brl_balance, btc_balance FROM users WHERE id = $1', [userId])).rows
    }

    async getBRLBalance(userId: number): Promise<Pick<IBalances, "brl_balance">> {
        return (await this.database.query('SELECT brl_balance FROM users WHERE id = $1', [userId])).rows[0]
    }

    async getBTCBalance(userId: number): Promise<Pick<IBalances, "btc_balance">> {
        return (await this.database.query('SELECT btc_balance FROM users WHERE id = $1', [userId])).rows[0]
    }

    async discountBRLBalance(userId: number, amount: number): Promise<void> {
        await this.database.query('UPDATE users SET brl_balance = brl_balance - $1 WHERE id = $2', [amount, userId]);
    }

    async discountBTCBalance(userId: number, amount: number): Promise<void> {
        await this.database.query('UPDATE users SET btc_balance = btc_balance - $1 WHERE id = $2', [amount, userId]);
    }

    async setUserBRLBalance(userId: number, amount: number): Promise<void> {
        await this.database.query('UPDATE users SET brl_balance = $1 WHERE id = $2', [amount, userId]);
    }

    async setUserBTCBalance(userId: number, amount: number): Promise<void> {
        await this.database.query('UPDATE users SET btc_balance = $1 WHERE id = $2', [amount, userId]);
    }

    async removePhoto(userId: number) {
        await this.database.query("UPDATE users SET photo_url = null WHERE id = $1", [userId])
    }

    async getAllPaginated(page: number, limit: number): Promise<IUserDAO[]> {
        return (await this.database.query('SELECT id, username, photo_url FROM users WHERE is_deleted = FALSE ORDER BY id LIMIT $1 OFFSET $2', [limit, (page - 1) * limit])).rows
    }

    async countAllUsers(): Promise<number> {
        return (await this.database.query('SELECT COUNT(*) FROM users WHERE is_deleted = FALSE')).rows[0].count
    }

    async getUserPhoto(userId: number): Promise<IUserDAO[]> {
        console.log('SELECT photo_url FROM users WHERE id = $1'.replace('$1', userId.toString()))
        return (await this.database.query('SELECT photo_url FROM users WHERE id = $1', [userId])).rows
    }
}