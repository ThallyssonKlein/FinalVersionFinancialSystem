import IMessageDAO from './IMessageDAO';
import { Schema, model } from 'mongoose';

const messageSchema = new Schema({
    sender: { type: String, required: true },
    receiver: { type: String, required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, required: true, default: Date.now },
    amount: { type: Number, required: true },
    paid: { type: Boolean, required: true, default: false },
    currency: { 
        type: String, 
        required: true,
        enum: ['BTC', 'BRL']
    },
    paymentId: { type: String },
    read: { type: Boolean, required: true, default: false }
});

const MessageModel = model<IMessageDAO>("Message", messageSchema);

export default class OutboundMessageRepositoryPort {
    getModel() {
        return MessageModel;
    }
}