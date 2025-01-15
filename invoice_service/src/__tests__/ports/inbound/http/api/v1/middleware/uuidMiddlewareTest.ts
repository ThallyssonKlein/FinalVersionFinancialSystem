import { Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import UuidMiddleware from '@ports/inbound/http/api/v1/middleware/UuidMiddleware';
import CustomRequest from '@ports/inbound/http/api/v1/middleware/CustomRequest';

jest.mock('uuid', () => ({
    v4: jest.fn(),
}));

describe('uuidMiddleware', () => {
    let req: CustomRequest;
    let res: Response;
    let next: NextFunction;

    beforeEach(() => {
        req = {} as CustomRequest;
        res = {} as Response;
        next = jest.fn();
    });

    it('should add a traceId to the request object', () => {
        const mockUuid = '123e4567-e89b-12d3-a456-426614174000';
        (uuidv4 as jest.Mock).mockReturnValue(mockUuid);

        const uuidMiddleware = new UuidMiddleware();
        uuidMiddleware.handle(req, res, next);

        expect(req.traceId).toBe(mockUuid);
    });

    it('should call the next function', () => {
        const uuidMiddleware = new UuidMiddleware();
        uuidMiddleware.handle(req, res, next);

        expect(next).toHaveBeenCalled();
    });
});