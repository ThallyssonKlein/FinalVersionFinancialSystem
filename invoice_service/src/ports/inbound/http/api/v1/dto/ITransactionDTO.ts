export default interface ITransactionDTO {
    id: number;
    amount: number;
    currency: string;
    senderId: string;
    createdAt: Date;
    receiverName?: string;
    receiverId?: number;
    transactionType?: string;
}