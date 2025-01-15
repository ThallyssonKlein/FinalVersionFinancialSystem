import Loggable from "@shared/Loggable";
import { NextFunction, Response } from "express";
import InboundTransactionAdapter from "@adapters/inbound/http/api/v1/InboundPaymentAdapter";
import CustomRequest from "../../api/v1/middleware/CustomRequest";
import { EPaymentType } from "../../api/v1/dto/EPaymentType";

interface PixMessage {
    evento: string;
    pix: Pix[];
}

interface Pix {
    txid: string;
}

const allowedIps = ['52.67.22.130','52.67.133.213','52.67.128.220','52.67.210.55','52.67.87.232','52.67.201.12','52.67.90.164','52.67.189.75','52.67.35.112','52.67.188.36','52.67.196.17','52.67.183.243','52.67.169.217','52.67.182.245','52.67.79.91','34.199.187.141','34.199.194.54','34.192.27.251','34.199.165.182','34.192.243.178','34.199.226.208','34.193.116.226','34.199.226.102','34.199.188.192','34.199.214.108','34.199.222.108','34.199.188.181','34.199.219.73','34.196.63.100']

export default class EfiBankWebhooksController extends Loggable {

    constructor(private inboundPaymentAdapter: InboundTransactionAdapter) {
        super("EfiBankWebhooksController");
    }

    async receivePixConfirmations(req: CustomRequest, res: Response, next: NextFunction) {
        const message = req.body;

        const clientIp = req.headers['x-forwarded-for']

        if (!allowedIps.includes(clientIp as string)) {
            this.log.error("Invalid request received from ip: " + clientIp);
            return res.status(403).json({ message: 'Forbidden'})
        }

        this.log.info(JSON.stringify(req.body), req.traceId);

        if (!message.pix || message.pix.length === 0) {
            this.log.error(`Invalid request received to process pix transactions`, req.traceId);
            return res.status(400).send({ message: 'Invalid request' });
        }

        try {
            res.status(200).send({ message: 'Received' });
            this.log.info(`Request received to process pix transactions`, req.traceId);
            (message as PixMessage).pix.forEach(async pix => {
                await this.inboundPaymentAdapter.receivePaymentConfirmation(pix.txid, req.traceId, EPaymentType.BRL);
            });
        } catch (error) {
            next(error);
        }
    }
}