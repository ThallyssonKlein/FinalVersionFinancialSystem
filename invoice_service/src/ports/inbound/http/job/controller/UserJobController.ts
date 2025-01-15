import InboundUserJobAdapter from '@adapters/inbound/http/job/InboundUserJobAdapter';
import Loggable from '@shared/Loggable';

import { Response, NextFunction } from 'express';
import CustomRequest from '@ports/inbound/http/api/v1/middleware/CustomRequest';

export default class UserJobController extends Loggable {
    constructor(private inboundUserJobAdapter: InboundUserJobAdapter) {
        super("UserJobController");
    }

    async physicalDelete(req: CustomRequest, res: Response, next: NextFunction) {
        try {
            this.log.info("Request received to physically delete all logically deleted users", req.traceId);
            await this.inboundUserJobAdapter.deletePhysicallyAllLogicallyDeletedUsers(req.traceId);

            res.status(200).send();
        } catch (error) {
            next(error);
        }
    }
}