import { Request, Response, NextFunction } from 'express';
import AdminRouteMiddleware from '@ports/inbound/http/api/v1/middleware/AdminRouteMiddleware';

describe('AdminRouteTest', () => {
    let req: Partial<Request> & { user?: any };
    let res: Partial<Response>;
    let next: jest.Mock<NextFunction>;

    beforeEach(() => {
        req = {
            user: { id: 3 }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        next = jest.fn();
    });

    it('should call next if req.user.id is 3', () => {
        const adminRoute = new AdminRouteMiddleware();
        adminRoute.handle(req as Request, res as Response, next);
        expect(next).toHaveBeenCalled();
    });

    it('should return 403 if req.user.id is not 3', () => {
        req.user.id = 456;
        const adminRoute = new AdminRouteMiddleware();
        adminRoute.handle(req as Request, res as Response, next);
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ error: 'Forbidden' });
    });
});