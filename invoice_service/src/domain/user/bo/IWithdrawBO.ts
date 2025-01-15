export default interface IWithdrawBO {
    id?: number;
    amount: number;
    currency: 'BRL' | 'BTC';
    receiver_id: number;
    created_at?: Date;
}