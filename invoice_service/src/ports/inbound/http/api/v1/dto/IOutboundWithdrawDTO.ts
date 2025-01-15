export default interface IOutboundWithdrawDTO {
    id?: number;
    amount: number;
    currency: 'BRL' | 'BTC';
    user_id: number;
    created_at?: Date;
}