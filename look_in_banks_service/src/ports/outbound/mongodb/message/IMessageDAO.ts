export default interface IMessageDAO {
    sender: string;
    receiver: number;
    content: string;
    amount: number;
    currency: string;
    timestamp?: Date;
    paid?: boolean;
    paymentId?: string;
    read?: boolean;
}