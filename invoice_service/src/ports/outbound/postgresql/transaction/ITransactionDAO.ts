export default interface ITransactionDAO {
    id?: number;
    amount: number;
    currency: 'BRL' | 'BTC';
    receiver_id?: number;
    sender_id?: string;
    created_at?: Date;
    receiver_name?: string;
    transaction_type: 'payment' | 'withdraw';
}