export type IBalances = Pick<IUserDAO, 'btc_balance' | 'brl_balance'>;

export default interface IUserDAO {
    id?: number;
    username?: string;
    password?: string;
    email?: string;
    is_deleted?: boolean;
    btc_balance?: number;
    brl_balance?: number;
    photo_url?: string;
    tax_value?: number;
    x_username?: string;
    instagram_username?: string;
    facebook_username?: string;
    nostr_username?: string;
    telegram_username?: string;
    whatsapp_username?: string;
    youtube_username?: string;
    twitch_username?: string;
}