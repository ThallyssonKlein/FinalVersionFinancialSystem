import OutboundMessageRepositoryPort from '@ports/outbound/mongodb/message/OutboundMessageRepositoryPort';
import MessageQueryBuilder from './MessageQueryBuilder';
import MessageDAO from '@ports/outbound/mongodb/message/IMessageDAO';
import IMessageDTO from '@ports/inbound/http/api/v1/dto/IMessageDTO';
import OutboundTotalsDTO from '@ports/inbound/http/api/v1/dto/OutboundTotalsDTO';
import PaginatedResultsDTO from '@ports/inbound/http/api/v1/dto/PaginatedResultsDTO';
import Loggable from '@shared/Loggable';
import PaymentResponseDTO from '@ports/inbound/http/api/v1/dto/PaymentResponseDTO';
import { EPaymentType } from '@ports/inbound/http/api/v1/dto/EPaymentType';
import OutboundEfiBankApiPort from '@ports/outbound/http/OutboundEfiBankApiPort';
import OutboundChargeDTO from '@ports/outbound/http/dto/OutboundChargeDTO';
import OutboundLNBitsApiPort from '@ports/outbound/http/OutboundLNBitsAPIPort';
import { ForbiddenError, NotFoundError } from '@ports/inbound/http/api/v1/error';
import IMessageDAO from '@ports/outbound/mongodb/message/IMessageDAO';
import OutboundUserRepositoryPort from '@ports/outbound/postgresql/user/OutboundUserRepositoryPort';

export default class InboundMessageAdapter extends Loggable {
    constructor(private outboundMessageRepositoryPort: OutboundMessageRepositoryPort,
                private outboundEfiBankApiPort: OutboundEfiBankApiPort,
                private outboundLNBitsApiPort: OutboundLNBitsApiPort,
                private outboundUserRepositoryPort: OutboundUserRepositoryPort) {
        super("InboundMessageAdapter");
    }

    async getMessagesWithPagination(page: number, limit: number, 
                                            ordered: boolean,
                                            startDate: string, endDate: string, query: string, traceId: string, receiver?: string): Promise<PaginatedResultsDTO> {
        const messageQueryBuilder = new MessageQueryBuilder();

        messageQueryBuilder.withPaidFilter();
        if (receiver) {
            messageQueryBuilder.withFilterByReceiver(receiver);
        }

        if (ordered) {
            messageQueryBuilder.withOrderByTimestamp()
        }

        if(query) {
            messageQueryBuilder.withQueryOnReceiverOrContent(query);
        }

        if(startDate && endDate) {
            messageQueryBuilder.withDateRangeFilter(new Date(startDate), new Date(endDate));
        } else if (startDate) {
            messageQueryBuilder.withExactDateFilter(new Date(startDate));
        } 
        
        this.log.info("Query built to get the messages. Query: " + JSON.stringify(messageQueryBuilder.getQuery()), traceId);

        const totalRecords = await this.outboundMessageRepositoryPort.getModel().countDocuments(messageQueryBuilder.getQuery());
        const totalPages = Math.ceil(Number(totalRecords) / limit);
        this.log.info("Total records found: " + totalRecords, traceId);

        const result: MessageDAO[] = await this.outboundMessageRepositoryPort.getModel().find(messageQueryBuilder.getQuery())
                                                                            .sort(messageQueryBuilder.getSort())
                                                                            .skip((page - 1) * limit).limit(limit);
        this.log.info("Messages found: " + result.length, traceId);

        messageQueryBuilder.reset();

        return new PaginatedResultsDTO(result, Number(totalRecords), totalPages);
    }

    async saveMessage(message: IMessageDTO, receiver: string, traceId: string, paymentType: EPaymentType): Promise<PaymentResponseDTO> {
        const user = await this.outboundUserRepositoryPort.findUserById(Number(receiver));
        if (user.length === 0) {
            throw new NotFoundError("User not found");
        }
        message.receiver = receiver;
        delete message.timestamp
        delete message.paid
        delete message.paymentId
        let qrCode;

        if (paymentType === EPaymentType.BRL) {
            const paymentProviderResponse: OutboundChargeDTO = await this.outboundEfiBankApiPort.createCharge(message.amount, traceId);

            message.paymentId = paymentProviderResponse.paymentId;
            qrCode = paymentProviderResponse.qrCode;
            this.log.info("QR Code: " + qrCode, traceId);
        } else {
            const paymentProviderResponse: OutboundChargeDTO = await this.outboundLNBitsApiPort.createCharge(parseFloat(message.amount), traceId);

            message.paymentId = paymentProviderResponse.paymentId;
            qrCode = paymentProviderResponse.qrCode;
            this.log.info("QR Code: " + qrCode, traceId);
        }

        const amount = parseFloat(message.amount);
        delete message.amount;
        const messageDAO = { ...message, amount } as unknown as IMessageDAO;
        const result = await this.outboundMessageRepositoryPort.getModel().create(messageDAO);
        this.log.info("Message saved: " + JSON.stringify(result), traceId);

        return new PaymentResponseDTO(
          qrCode  
        );
    }

    private async runTotalsAggregation(messageQueryBuilder: MessageQueryBuilder): Promise<any> {
        this.log.info("Query when running aggregation: " + JSON.stringify(messageQueryBuilder.getQuery()));
        return await this.outboundMessageRepositoryPort.getModel().aggregate([
            { $match: messageQueryBuilder.getQuery() },
            { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } }
        ]).exec();
    }

    async getTotalAndCountForAReceiver(receiver: string, startDate: string, endDate: string, traceId: string): Promise<OutboundTotalsDTO> {
        let count = 0, btcTotal = 0, brlTotal = 0;
        const messageQueryBuilder = new MessageQueryBuilder();
        
        messageQueryBuilder.withPaidFilter();
        messageQueryBuilder.withFilterByReceiver(receiver);
        messageQueryBuilder.withBTCCurrencyFilter();

        if(startDate && endDate) {
            messageQueryBuilder.withDateRangeFilter(new Date(startDate), new Date(endDate));
        }

        this.log.info("Query built to get the totals. Query: " + JSON.stringify(messageQueryBuilder.getQuery()), traceId);
        const result1 = await this.runTotalsAggregation(messageQueryBuilder);
        if(result1.length > 0) {
            btcTotal = result1[0].total;
            count += result1[0].count;
        }
        
        messageQueryBuilder.withoutCurrencyFilter();
        messageQueryBuilder.withBRLCurrencyFilter();
        const result2 = await this.runTotalsAggregation(messageQueryBuilder);
        if(result2.length > 0) {
            console.log(result2)
            brlTotal = result2[0].total;
            count += result2[0].count;
        }
        
        messageQueryBuilder.reset();

        const totals = new OutboundTotalsDTO(brlTotal, btcTotal, count);
        this.log.info("Totals found: " + JSON.stringify(totals), traceId);

        return totals;
    }

    async markMessageAsRead(userId: number, messageId: string, traceId: string): Promise<void> {
        const message = await this.outboundMessageRepositoryPort.getModel().findOne({ _id: messageId });
        if (Number(message.receiver) !== userId) {
            throw new ForbiddenError("User is not the receiver of the message");
        }
        await this.outboundMessageRepositoryPort.getModel().updateOne({ _id: messageId }, { read: true });
        this.log.info("Message marked as read with id: " + messageId, traceId);
    }

    async markMessageAsUnread(userId: number, messageId: string, traceId: string): Promise<void> {
        const message = await this.outboundMessageRepositoryPort.getModel().findOne({ _id: messageId });
        if (Number(message.receiver) !== userId) {
            throw new ForbiddenError("User is not the receiver of the message");
        }
        await this.outboundMessageRepositoryPort.getModel().updateOne({ _id: messageId }, { read: false });
        this.log.info("Message marked as unread with id: " + messageId, traceId);
    }
}