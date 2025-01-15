export default interface IMessageDTO {
    sender: string;
    receiver?: string;
    content: string;
    amount: string;
    currency: string;
    timestamp?: Date;
    paid?: boolean;
    paymentId?: string;
    read?: boolean;
}