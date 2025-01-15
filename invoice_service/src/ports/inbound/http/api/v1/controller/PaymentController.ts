import InboundTransactionAdapter from "@adapters/inbound/http/api/v1/InboundPaymentAdapter";
import CustomRequest from '@ports/inbound/http/api/v1/middleware/CustomRequest';
import { Response, NextFunction } from "express";
import { NotFoundError } from "../error";
import Loggable from "@shared/Loggable";

export default class PaymentController extends Loggable {
    constructor(private inboundPaymentAdapter: InboundTransactionAdapter) {
        super("PaymentController");
    }

    async getTransactionsByReceiverWithPagination(req: CustomRequest, res: Response, next: NextFunction) {
        try {
            const userId = Number(req.params.userId);
            if (isNaN(userId)) {
                next(new NotFoundError('User not found'));
            }
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            let startDate: Date | undefined;
            let endDate: Date | undefined;
            if (req.query.startDate) {
                startDate = new Date(req.query.startDate as string);
            }
            if (req.query.endDate) {
                endDate = new Date(req.query.endDate as string);
            }
            
            this.log.info(`getTransactionsByReceiverWithPagination: userId=${userId}, page=${page}, limit=${limit}, startDate=${startDate}, endDate=${endDate}`, req.traceId);
            res.json(await this.inboundPaymentAdapter.getTransactionsByReceiverWithPagination(page, limit, startDate, endDate, req.traceId, userId));
        } catch (error) {
            next(error);
        }
    }

    async getAllWithPaginationAndUserIdFilter(req: CustomRequest, res: Response, next: NextFunction) {
        try {
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            let startDate: Date | undefined;
            let endDate: Date | undefined;
            if (req.query.startDate) {
                startDate = new Date(req.query.startDate as string);
            }
            if (req.query.endDate) {
                endDate = new Date(req.query.endDate as string);
            }

            const userId = Number(req.query.userId) || undefined;

            this.log.info(`getAllWithPaginationAndUserIdFilter: page=${page}, limit=${limit}, startDate=${startDate}, endDate=${endDate}, userId=${userId}`, req.traceId);
            res.json(await this.inboundPaymentAdapter.getTransactionsByReceiverWithPagination(page, limit, startDate, endDate, req.traceId, userId));
        } catch (error) {
            next(error);
        }
    }
}