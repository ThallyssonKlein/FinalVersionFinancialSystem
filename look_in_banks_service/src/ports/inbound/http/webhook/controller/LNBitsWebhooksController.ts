import Loggable from "@shared/Loggable";
import { NextFunction, Response } from "express";
import InboundTransactionAdapter from "@adapters/inbound/http/api/v1/InboundPaymentAdapter";
import CustomRequest from "../../api/v1/middleware/CustomRequest";
import { EPaymentType } from "../../api/v1/dto/EPaymentType";

const allowedIps = ['190.53.100.34']
export default class LNBitsWebhooksController extends Loggable {

    constructor(private inboundPaymentAdapter: InboundTransactionAdapter) {
        super("LNBitsWebhooksController");
    }

    async receiveBTCConfirmation(req: CustomRequest, res: Response, next: NextFunction) {
        const message = req.body;

        const clientIp = req.headers['x-forwarded-for']

        if (!allowedIps.includes(clientIp as string)) {
            this.log.error("Invalid request received from ip: " + clientIp);
            return res.status(403).json({ message: 'Forbidden'})
        }

        this.log.info(JSON.stringify(req.body), req.traceId);
        if (!message.payment_hash) {
            this.log.error(`Invalid request received to process btc transaction`, req.traceId);
            return res.status(400).send({ message: 'Invalid request' });
        }

        try {
            res.status(200).send({ message: 'Received' });
            this.log.info(`Request received to process btc transaction`, req.traceId);
            await this.inboundPaymentAdapter.receivePaymentConfirmation(message.payment_hash, req.traceId, EPaymentType.BTC);
        } catch (error) {
            next(error);
        }
    }
}