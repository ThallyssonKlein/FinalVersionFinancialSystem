import { NextFunction, Response } from "express";
import InboundTransactionAdapter from "../../../../../../adaptes/inbound/InboundTransactionAdapter";
import Loggable from "../../../../../../shared/Loggable";
import CustomRequest from "../middleware/CustomRequest";
import { IInboundFrequencyDTO } from "../dto/inbound/IInboundFrequencyDTO";
import InboundSaveTransactionsInBatchDTO from "../dto/inbound/InboundSaveTransactionsInBatchDTO";

export default class TransactionController extends Loggable {

    constructor(
        private inboundTransactionAdapter: InboundTransactionAdapter
    ) {
        super("TransactionController")
    }

    async findTransactionsXValueXUnityAgo(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            // this.log.info(`Request received to find transactions x value x unity ago`, req.traceId);
            const query = req.query as unknown as IInboundFrequencyDTO

            res.status(200).json(
                await this.inboundTransactionAdapter.findTransactionsXValueXUnityAgo(req.token, query, req.traceId)
            )
        } catch (err) {
            next(err);
        }
    }

    async saveTransactionInBatch(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            // this.log.info(`Request received to save transactions in batch`, req.traceId);
            const userToken = req.token;
            const body = req.body as InboundSaveTransactionsInBatchDTO;
            const customName = body.custom_name;

            res.status(200).json(
                await this.inboundTransactionAdapter.saveTransactionInBatch(customName, userToken, body.transactions, req.traceId)
            )
        } catch (err) {
            next(err);
        }
    }
}