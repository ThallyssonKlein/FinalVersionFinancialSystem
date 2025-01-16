import { NextFunction, Response } from "express";
import InboundTransactionAdapter from "../../../../../../adaptes/inbound/InboundTransactionAdapter";
import Loggable from "../../../../../../shared/Loggable";
import CustomRequest from "../middleware/CustomRequest";
import { IInboundFrequencyDTO } from "../dto/inbound/IInboundFrequencyDTO";

export default class TransactionController extends Loggable {

    constructor(
        private inboundTransactionAdapter: InboundTransactionAdapter
    ) {
        super("TransactionController")
    }

    async findTransactionsXValueXUnityAgo(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const query = req.query as unknown as IInboundFrequencyDTO

            res.status(200).json(
                await this.inboundTransactionAdapter.findTransactionsXValueXUnityAgo(query)
            )
        } catch (err) {
            next(err);
        }
    }
}