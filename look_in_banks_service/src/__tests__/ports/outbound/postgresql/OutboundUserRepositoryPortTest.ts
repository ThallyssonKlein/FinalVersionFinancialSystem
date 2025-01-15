import { Pool } from 'pg';
import OutboundUserRepositoryPort from '@ports/outbound/postgresql/user/OutboundUserRepositoryPort';

jest.mock('pg');

describe('OutboundUserRepositoryPort', () => {
    let repository: OutboundUserRepositoryPort;
    let pool: jest.Mocked<Pool>;

    beforeEach(() => {
        pool = new Pool() as jest.Mocked<Pool>;
        repository = new OutboundUserRepositoryPort(pool);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('findUserByUsername', () => {
        it('should return user data when username is found', async () => {
            const mockUser = { id: '1', username: 'testuser' };
            (pool.query as jest.Mock).mockResolvedValue({rows: [mockUser]});

            const result = await repository.findUserByUsername('testuser');

            expect(result[0]).toEqual(mockUser);
            expect(pool.query).toHaveBeenCalledWith('SELECT id, username, photo_url, password, x_username, instagram_username, facebook_username, nostr_username, telegram_username, whatsapp_username, youtube_username, twitch_username FROM users WHERE username = $1 AND is_deleted = FALSE', ['testuser']);
        });

        it('should return empty array when username is not found', async () => {
            (pool.query as jest.Mock).mockResolvedValue({rows: []});

            const result = await repository.findUserByUsername('nonexistentuser');

            expect(result).toEqual([]);
            expect(pool.query).toHaveBeenCalledWith('SELECT id, username, photo_url, password, x_username, instagram_username, facebook_username, nostr_username, telegram_username, whatsapp_username, youtube_username, twitch_username FROM users WHERE username = $1 AND is_deleted = FALSE', ['nonexistentuser']);
        });
    });

    describe('logicalDelete', () => {
        it('should call the correct query with userId', async () => {
            await repository.logicalDelete(1);

            expect(pool.query).toHaveBeenCalledWith(
                'UPDATE users SET is_deleted = TRUE, deleted_at = NOW() WHERE id = $1',
                [1]
            );
        });
    });

    describe('physicalDelete', () => {
        it('should call the correct query with userId', async () => {
            await repository.physicalDelete(1);

            expect(pool.query).toHaveBeenCalledWith(
                'DELETE FROM users WHERE id = $1',
                [1]
            );
        });
    });

    describe('findUserById', () => {
        it('should return user data when userId is found', async () => {
            const mockUser = { id: '1', username: 'testuser' };
            (pool.query as jest.Mock).mockResolvedValue({ rows: [mockUser] });

            const result = await repository.findUserById(1);

            expect(result[0]).toEqual(mockUser);
            expect(pool.query).toHaveBeenCalledWith(
                'SELECT id, username, email, is_deleted, btc_balance, brl_balance, photo_url, tax_value, x_username, instagram_username, facebook_username, nostr_username, telegram_username, whatsapp_username, youtube_username, twitch_username FROM users WHERE id = $1 AND is_deleted = FALSE',
                [1]
            );
        });

        it('should return empty array when userId is not found', async () => {
            (pool.query as jest.Mock).mockResolvedValue({ rows: [] });

            const result = await repository.findUserById(999);

            expect(result).toEqual([]);
            expect(pool.query).toHaveBeenCalledWith(
                'SELECT id, username, email, is_deleted, btc_balance, brl_balance, photo_url, tax_value, x_username, instagram_username, facebook_username, nostr_username, telegram_username, whatsapp_username, youtube_username, twitch_username FROM users WHERE id = $1 AND is_deleted = FALSE',
                [999]
            );
        });
    });

    describe('findAllLogicallyDeletedUsersMoreThan1MonthAgo', () => {
        it('should return user data for users deleted more than 1 month ago', async () => {
            const mockUser = { id: '1', username: 'testuser' };
            (pool.query as jest.Mock).mockResolvedValue({ rows: [mockUser] });

            const result = await repository.findAllLogicallyDeletedUsersMoreThan1MonthAgo();

            expect(result[0]).toEqual(mockUser);
            expect(pool.query).toHaveBeenCalledWith(
                'SELECT id FROM users WHERE is_deleted = TRUE AND deleted_at < NOW() - INTERVAL \'1 month\''
            );
        });

        it('should return empty array when no users are found', async () => {
            (pool.query as jest.Mock).mockResolvedValue({ rows: [] });

            const result = await repository.findAllLogicallyDeletedUsersMoreThan1MonthAgo();

            expect(result).toEqual([]);
            expect(pool.query).toHaveBeenCalledWith(
                'SELECT id FROM users WHERE is_deleted = TRUE AND deleted_at < NOW() - INTERVAL \'1 month\''
            );
        });
    });

    describe('getBalances', () => {
        it('should return balances when userId is found', async () => {
            const mockBalances = { brl_balance: 1000, btc_balance: 0.5 };
            (pool.query as jest.Mock).mockResolvedValue({ rows: [mockBalances] });

            const result = await repository.getBalances(1);

            expect(result[0]).toEqual(mockBalances);
            expect(pool.query).toHaveBeenCalledWith(
                'SELECT brl_balance, btc_balance FROM users WHERE id = $1',
                [1]
            );
        });

        it('should return empty array when userId is not found', async () => {
            (pool.query as jest.Mock).mockResolvedValue({ rows: [] });

            const result = await repository.getBalances(999);

            expect(result).toEqual([]);
            expect(pool.query).toHaveBeenCalledWith(
                'SELECT brl_balance, btc_balance FROM users WHERE id = $1',
                [999]
            );
        });
    });

    describe('registerUser', () => {
        it('should call the correct query with username and hashedPassword', async () => {
            const username = 'testuser';
            const hashedPassword = 'hashedpassword';

            await repository.registerUser({
                username,
                password: hashedPassword
            });

            expect(pool.query).toHaveBeenCalledWith("INSERT INTO users (username, password) VALUES ($1, $2)", [username, hashedPassword]);
        });

        it('should handle errors during query execution', async () => {
            const username = 'testuser';
            const hashedPassword = 'hashedpassword';
            const error = new Error('Query failed');

            (pool.query as jest.Mock).mockRejectedValue(error);

            await expect(repository.registerUser({
                username,
                password: hashedPassword
            })).rejects.toThrow('Query failed');
        });
    });
    
    describe('updateUser', () => {
        it('should update only the username', async () => {
            await repository.updateUser(1, { username: 'newusername' });

            expect(pool.query).toHaveBeenCalledWith(
                {
                    text: `
                UPDATE users
                SET username = $1
                WHERE id = $2
            `,    
                    values: ['newusername', 1],
                }
            );
        });

        it('should update only the file URL', async () => {
            await repository.updateUser(1, null, 'newfileurl');

            expect(pool.query).toHaveBeenCalledWith(
                {
                    text: `
                UPDATE users
                SET photo_url = $1
                WHERE id = $2
            `,
                    values: ['newfileurl', 1],
                }
            );
        });

        it('should handle errors during query execution', async () => {
            const error = new Error('Query failed');
            (pool.query as jest.Mock).mockRejectedValue(error);

            await expect(repository.updateUser(1, { username: 'newusername' })).rejects.toThrow('Query failed');
        });
    });

    describe('removePhoto', () => {
        it('should call the correct query with userId', async () => {
            await repository.removePhoto(1);

            expect(pool.query).toHaveBeenCalledWith(
                "UPDATE users SET photo_url = null WHERE id = $1",
                [1]
            );
        });

        it('should handle errors during query execution', async () => {
            const error = new Error('Query failed');
            (pool.query as jest.Mock).mockRejectedValue(error);

            await expect(repository.removePhoto(1)).rejects.toThrow('Query failed');
        });
    });

    describe('getUserBRLBalance', () => {
        it('should return BRL balance when userId is found', async () => {
            const mockBalance = { brl_balance: 1000 };
            (pool.query as jest.Mock).mockResolvedValue({ rows: [mockBalance] });

            const result = await repository.getBRLBalance(1);

            expect(result).toEqual(mockBalance);
            expect(pool.query).toHaveBeenCalledWith(
                'SELECT brl_balance FROM users WHERE id = $1',
                [1]
            );
        });

        it('should return undefined when userId is not found', async () => {
            (pool.query as jest.Mock).mockResolvedValue({ rows: [] });

            const result = await repository.getBRLBalance(999);

            expect(result).toBeUndefined();
            expect(pool.query).toHaveBeenCalledWith(
                'SELECT brl_balance FROM users WHERE id = $1',
                [999]
            );
        });
    });

    describe('getUserBTCBalance', () => {
        it('should return BTC balance when userId is found', async () => {
            const mockBalance = { btc_balance: 0.5 };
            (pool.query as jest.Mock).mockResolvedValue({ rows: [mockBalance] });

            const result = await repository.getBTCBalance(1);

            expect(result).toEqual(mockBalance);
            expect(pool.query).toHaveBeenCalledWith(
                'SELECT btc_balance FROM users WHERE id = $1',
                [1]
            );
        });

        it('should return undefined when userId is not found', async () => {
            (pool.query as jest.Mock).mockResolvedValue({ rows: [] });

            const result = await repository.getBTCBalance(999);

            expect(result).toBeUndefined();
            expect(pool.query).toHaveBeenCalledWith(
                'SELECT btc_balance FROM users WHERE id = $1',
                [999]
            );
        });
    });

    describe('discountBRLBalance', () => {
        it('should call the correct query with userId and amount', async () => {
            await repository.discountBRLBalance(1, 100);

            expect(pool.query).toHaveBeenCalledWith(
                'UPDATE users SET brl_balance = brl_balance - $1 WHERE id = $2',
                [100, 1]
            );
        });

        it('should handle errors during query execution', async () => {
            const error = new Error('Query failed');
            (pool.query as jest.Mock).mockRejectedValue(error);

            await expect(repository.discountBRLBalance(1, 100)).rejects.toThrow('Query failed');
        });
    });

    describe('discountBTCBalance', () => {
        it('should call the correct query with userId and amount', async () => {
            await repository.discountBTCBalance(1, 0.1);

            expect(pool.query).toHaveBeenCalledWith(
                'UPDATE users SET btc_balance = btc_balance - $1 WHERE id = $2',
                [0.1, 1]
            );
        });

        it('should handle errors during query execution', async () => {
            const error = new Error('Query failed');
            (pool.query as jest.Mock).mockRejectedValue(error);

            await expect(repository.discountBTCBalance(1, 0.1)).rejects.toThrow('Query failed');
        });
    });

    describe('getAllPaginated', () => {
        it('should return paginated users when users are found', async () => {
            const mockUsers = [{ id: '1', username: 'user1', photo_url: 'url1' }];
            (pool.query as jest.Mock).mockResolvedValue({ rows: mockUsers });

            const result = await repository.getAllPaginated(1, 10);

            expect(result).toEqual(mockUsers);
            expect(pool.query).toHaveBeenCalledWith(
                'SELECT id, username, photo_url FROM users WHERE is_deleted = FALSE ORDER BY id LIMIT $1 OFFSET $2',
                [10, 0]
            );
        });

        it('should return empty array when no users are found', async () => {
            (pool.query as jest.Mock).mockResolvedValue({ rows: [] });

            const result = await repository.getAllPaginated(1, 10);

            expect(result).toEqual([]);
            expect(pool.query).toHaveBeenCalledWith(
                'SELECT id, username, photo_url FROM users WHERE is_deleted = FALSE ORDER BY id LIMIT $1 OFFSET $2',
                [10, 0]
            );
        });

        it('should handle errors during query execution', async () => {
            const error = new Error('Query failed');
            (pool.query as jest.Mock).mockRejectedValue(error);

            await expect(repository.getAllPaginated(1, 10)).rejects.toThrow('Query failed');
        });
    });
});