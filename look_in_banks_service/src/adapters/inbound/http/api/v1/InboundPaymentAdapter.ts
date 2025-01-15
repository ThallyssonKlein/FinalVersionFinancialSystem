import ITransactionDTO from "@ports/inbound/http/api/v1/dto/ITransactionDTO";
import PaginatedResultsDTO from "@ports/inbound/http/api/v1/dto/PaginatedResultsDTO";
import Loggable from "@shared/Loggable";
import SocketIO from "@ports/outbound/socketio/SocketIO";
import { EPaymentType } from "@ports/inbound/http/api/v1/dto/EPaymentType";
import MessageQueryBuilder from "./message/MessageQueryBuilder";
import OutboundMessageRepositoryPort from "@ports/outbound/mongodb/message/OutboundMessageRepositoryPort";
import Config from "@config/index";
import IUserDAO from "@ports/outbound/postgresql/user/IUserDAO";
import OutboundUserAdapter from "@adapters/outbound/OutboundUserAdapter";
import ITransactionDAO from "@ports/outbound/postgresql/transaction/ITransactionDAO";
import OutboundTransactionRepositoryPort from "@ports/outbound/postgresql/transaction/OutboundTransactionRepositoryPort";
import OutboundTransactionalPaymentConfirmationRepository from "@ports/outbound/OutboundTransactionalPaymentConfirmationRepository";

export default class InboundTransactionAdapter extends Loggable {
    private messageQueryBuilder: MessageQueryBuilder = new MessageQueryBuilder();
    private config = new Config().getConfig();

    constructor(private wss: SocketIO,
                private outboundMessageRepository: OutboundMessageRepositoryPort,
                private outboundTransactionRepositoryPort: OutboundTransactionRepositoryPort,
                private outboundTransactionalPaymentConfirmationRepositor: OutboundTransactionalPaymentConfirmationRepository,
                private outboundUserAdapter: OutboundUserAdapter) {
        super("InboundPaymentAdapter");
    }

    private mapITransactionDAOToIPaymentDTO(transaction: ITransactionDAO): ITransactionDTO {
        return {
            id: transaction.id,
            senderId: transaction.sender_id,
            amount: transaction.amount,
            currency: transaction.currency,
            createdAt: transaction.created_at,
            receiverName: transaction.receiver_name,
            receiverId: transaction.receiver_id,
            transactionType: transaction.transaction_type
        }
    }

    async getTransactionsByReceiverWithPagination(page: number, limit: number, startDate: Date, endDate: Date, traceId: string, userId?: number): Promise<PaginatedResultsDTO> {
        let resultsFromDatabase: ITransactionDAO[];
        let totalRecords: number;

        if(startDate || endDate) {
            resultsFromDatabase = await this.outboundTransactionRepositoryPort.findAllTransactionsWithDateRangeWithPagination(page, limit, startDate, endDate, userId);
            totalRecords = await this.outboundTransactionRepositoryPort.countAllTransactionsWithDateRange(startDate, endDate, userId);
            this.log.info(`${resultsFromDatabase.length} results found in getTransactionsByReceiverWithPagination for userId ${userId}`, traceId);
        } else {
            resultsFromDatabase = await this.outboundTransactionRepositoryPort.findAllTransactionsWithPagination(page, limit, userId);
            totalRecords = await this.outboundTransactionRepositoryPort.countAllTransactions(userId);
            this.log.info(`${resultsFromDatabase.length} results found in getTransactionsByReceiverWithPagination for userId ${userId}`, traceId);
        }

        const results = resultsFromDatabase.map(payment => this.mapITransactionDAOToIPaymentDTO(payment));

        return new PaginatedResultsDTO(results, Number(totalRecords), Math.ceil(totalRecords / limit));
    }

    async receivePaymentConfirmation(paymentId: string, traceId: string, paymentType: EPaymentType): Promise<void> {
        this.messageQueryBuilder.withPaymentIdFilter(paymentId);

        const message = await this.outboundMessageRepository.getModel().findOne(this.messageQueryBuilder.getQuery());
        
        this.messageQueryBuilder.reset();

        try {  
            this.log.info(JSON.stringify(message), traceId);
            
            const user: IUserDAO = await this.outboundUserAdapter.findUserById(message.receiver, traceId);
            const newAmount = message.amount - (message.amount * (user.tax_value / 100));

            this.log.info("New amount: " + newAmount, traceId);
            this.log.info("User tax value: " + user.tax_value, traceId);
            this.log.info("message.amount: " + message.amount, traceId);
            
            await this.outboundTransactionalPaymentConfirmationRepositor.setMessageToPaidThenSavePaymentThenIncreaseBalance(
                {
                    sender_id: message.sender,
                    receiver_id: message.receiver,
                    amount: message.currency === 'BRL' ? Number(newAmount.toFixed(2)) : Math.round(newAmount),
                    currency: message.currency as 'BRL' | 'BTC',
                    created_at: new Date(),
                    transaction_type: 'payment'
                },
                message.currency === 'BRL' ? Number(newAmount.toFixed(2)) : Math.round(newAmount),
                paymentId,
                paymentType
            )

            this.wss.sendMessageToRoom(this.config.websocket.senderPrefix + message.sender, paymentId);
            message.paid = true;
            this.wss.sendMessageToRoom(this.config.websocket.receiverPrefix + String(message.receiver), JSON.stringify(message));
        } catch (error) {
            this.log.error(`Error receiving payment confirmation for paymentId: ${paymentId}`, traceId);
            throw error;
        }
    }
}