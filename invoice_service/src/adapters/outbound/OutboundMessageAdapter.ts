import MessageQueryBuilder from "@adapters/inbound/http/api/v1/message/MessageQueryBuilder";
import IMessageDAO from "@ports/outbound/mongodb/message/IMessageDAO";
import OutboundMessageRepositoryPort from "@ports/outbound/mongodb/message/OutboundMessageRepositoryPort";

export default class OutboundMessageAdapter {
    private messageQueryBuilder: MessageQueryBuilder = new MessageQueryBuilder();

    constructor(private outboundMessageRepository: OutboundMessageRepositoryPort) {}

    async findMessageByPaymentId(paymentId: string): Promise<IMessageDAO> {
        this.messageQueryBuilder.withPaymentIdFilter(paymentId);
        const message = await this.outboundMessageRepository.getModel().findOne(this.messageQueryBuilder.getQuery());
        this.messageQueryBuilder.reset();
        return message;
    }
}