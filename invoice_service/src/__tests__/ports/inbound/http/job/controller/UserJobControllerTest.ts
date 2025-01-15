import { Request, Response, NextFunction } from 'express';
import InboundUserJobAdapter from '@adapters/inbound/http/job/InboundUserJobAdapter';
import UserJobController from '@ports/inbound/http/job/controller/UserJobController';

describe('UserJobController', () => {
    let inboundUserJobAdapter: InboundUserJobAdapter;
    let userJobController: UserJobController;
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;

    beforeEach(() => {
        inboundUserJobAdapter = {
            deletePhysicallyAllLogicallyDeletedUsers: jest.fn()
        } as unknown as InboundUserJobAdapter;

        userJobController = new UserJobController(inboundUserJobAdapter);

        req = {};
        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn()
        } as Partial<Response>;

        next = jest.fn();
    });

    it('should call deletePhysicallyAllLogicallyDeletedUsers on the adapter', async () => {
        await userJobController.physicalDelete(req as Request, res as Response, next);

        expect(inboundUserJobAdapter.deletePhysicallyAllLogicallyDeletedUsers).toHaveBeenCalled();
    });

    it('should send a 200 status code on success', async () => {
        await userJobController.physicalDelete(req as Request, res as Response, next);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalled();
    });

    it('should call next with an error on failure', async () => {
        const error = new Error('Test error');
        (inboundUserJobAdapter.deletePhysicallyAllLogicallyDeletedUsers as jest.Mock).mockRejectedValue(error);

        await userJobController.physicalDelete(req as Request, res as Response, next);

        expect(next).toHaveBeenCalledWith(error);
    });
});