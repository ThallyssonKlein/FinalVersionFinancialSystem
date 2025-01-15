import InboundMessageAdapter from "@adapters/inbound/http/api/v1/message/InboundMessageAdapter";
import Loggable from "@shared/Loggable";
import { NextFunction, Response } from "express";
import CustomRequest from "../middleware/CustomRequest";
import { EPaymentType } from "../dto/EPaymentType";
import IMessageDTO from "../dto/IMessageDTO";
import ForbiddenError from "../error/ForbiddenError";
import { BadRequestError } from "../error";

export default class MessageController extends Loggable {
    private brlAmountPattern = /^[0-9]{1,10}\.[0-9]{2}$/;

    constructor(private inboundMessageAdapter: InboundMessageAdapter) {
        super("MessageController");
    }

    async getReceiverMessagesWithPagination(req: CustomRequest, res: Response, next: NextFunction) {
        const page = req.query.page ? parseInt(req.query.page as string) : 1;
        const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
        const ordered = req.query.ordered ? req.query.ordered === 'true' : false;
        const receiver = req.params.userId as string;
        const startDate = req.query.startDate as string;
        const endDate = req.query.endDate as string;
        const query = req.query.query as string;

        try {
            this.log.info(`Request received to get messages for receiver: ${receiver}`, req.traceId);
            const result = await this.inboundMessageAdapter.getMessagesWithPagination(page, limit, ordered, startDate, endDate, query, req.traceId, receiver);
            res.status(200).send(result);
        } catch (error) {
            next(error);
        }
    }

    async saveMessage(req: CustomRequest, res: Response, next: NextFunction) {
        const message = req.body as IMessageDTO;
        const receiver = req.params.userId;
        const paymentType: EPaymentType = EPaymentType[message.currency as keyof typeof EPaymentType];
        
        if (paymentType === EPaymentType.BRL) {
            if (!this.brlAmountPattern.test(message.amount)) {
                return next(new BadRequestError("Invalid amount"));
            }

            if (Number(message.amount) < 1) {
                return next(new BadRequestError("Amount must be greater than 1"));
            }
        }

        if (paymentType === EPaymentType.BTC) {
            if (Number(message.amount) < 300) {
                return next(new BadRequestError("Amount must be greater than 300"));
            }
        }

        try {
            this.log.info(`Request received to save message for receiver: ${receiver}`, req.traceId);

            const result = await this.inboundMessageAdapter.saveMessage(message, receiver, req.traceId, paymentType);
            res.status(201).send(result);
        } catch (error) {
            next(error);
        }
    }

    async getTotalAndCountForAReceiver(req: CustomRequest, res: Response, next: NextFunction) {
        const receiver = req.params.userId as string;
        const startDate = req.query.startDate as string;
        const endDate = req.query.endDate as string;

        try {
            this.log.info(`Request received to get total and count for receiver: ${receiver}`, req.traceId);
            const result = await this.inboundMessageAdapter.getTotalAndCountForAReceiver(receiver, startDate, endDate, req.traceId);
            res.status(200).send(result);
        } catch (error) {
            next(error);
        }
    }

    async markMessageAsRead(req: CustomRequest, res: Response, next: NextFunction) {
        const messageId = req.params.messageId as string;
        const userId = Number(req.user.id);

        try {
            this.log.info(`Request received to mark message as read: ${messageId}`, req.traceId);
            const result = await this.inboundMessageAdapter.markMessageAsRead(userId, messageId, req.traceId);
            res.status(200).send(result);
        } catch (error) {
            next(error);
        }
    }

    async markMessageAsUnread(req: CustomRequest, res: Response, next: NextFunction) {
        const messageId = req.params.messageId as string;
        const userId = Number(req.user.id);

        try {
            this.log.info(`Request received to mark message as unread: ${messageId}`, req.traceId);
            const result = await this.inboundMessageAdapter.markMessageAsUnread(userId, messageId, req.traceId);
            res.status(200).send(result);
        } catch (error) {
            next(error);
        }
    }

    async getAllWithPaginationAndUserIdFilter(req: CustomRequest, res: Response, next: NextFunction) {
        const page = req.query.page ? parseInt(req.query.page as string) : 1;
        const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
        const ordered = req.query.ordered ? req.query.ordered === 'true' : false;
        const startDate = req.query.startDate as string;
        const endDate = req.query.endDate as string;
        const query = req.query.query as string;
        const userId = req.query.userId as string;

        try {
            this.log.info(`Request received to get all messages`, req.traceId);
            const result = await this.inboundMessageAdapter.getMessagesWithPagination(page, limit, ordered, startDate, endDate, query, req.traceId, userId);
            res.status(200).send(result);
        } catch (error) {
            next(error);
        }
    }
}