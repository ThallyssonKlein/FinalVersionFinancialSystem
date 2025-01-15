import { Request, Response, NextFunction } from 'express';
import ResourceOwner from '@ports/inbound/http/api/v1/middleware/ResourceOwnerMiddleware';
describe('resourceOwner', () => {
    let req: Partial<Request> & { user?: any };
    let res: Partial<Response>;
    let next: jest.Mock<NextFunction>;

    beforeEach(() => {
        req = {
            params: { userId: '123' },
            user: { id: 123 }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        next = jest.fn();
    });

    it('should call next if req.params.userId matches req.user.id', () => {
        const resourceOwner = new ResourceOwner();
        resourceOwner.handle(req as Request, res as Response, next);
        expect(next).toHaveBeenCalled();
    });

    it('should return 403 if req.params.userId does not match req.user.id', () => {
        req.params.userId = '456';
        const resourceOwner = new ResourceOwner();
        resourceOwner.handle(req as Request, res as Response, next);
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ error: 'Forbidden' });
    });
});