import PaymentController from '@ports/inbound/http/api/v1/controller/PaymentController';
import InboundTransactionAdapter from '@adapters/inbound/http/api/v1/InboundPaymentAdapter';
import CustomRequest from '@ports/inbound/http/api/v1/middleware/CustomRequest';
import { Response, NextFunction } from 'express';
import { NotFoundError } from '@ports/inbound/http/api/v1/error';
import PaginatedResultsDTO from '@ports/inbound/http/api/v1/dto/PaginatedResultsDTO';

// live-pix-service/src/ports/inbound/http/api/v1/controller/PaymentController.test.ts

jest.mock('@adapters/inbound/http/api/v1/InboundPaymentAdapter');

describe('PaymentController', () => {
    let paymentController: PaymentController;
    let inboundPaymentAdapterMock: jest.Mocked<InboundTransactionAdapter>;
    let req: Partial<CustomRequest>;
    let res: Partial<Response>;
    let next: NextFunction;

    beforeEach(() => {
        inboundPaymentAdapterMock = {
            getPaymentsByReceiverWithPagination: jest.fn(),
            getTransactionsByReceiverWithPagination: jest.fn()
        } as unknown as jest.Mocked<InboundTransactionAdapter>;
        paymentController = new PaymentController(inboundPaymentAdapterMock);
        req = {
            params: { userId: '1' },
            query: {},
            traceId: 'test-trace-id'
        };
        res = {
            json: jest.fn()
        };
        next = jest.fn();
    });

    test('should handle valid request', async () => {
        req.query = { page: '1', limit: '10' };
        const dto = new PaginatedResultsDTO([
            { id: 1, senderId: 1, amount: 100, currency: 'BRL', createdAt: new Date() }
        ], 1, 1)
        inboundPaymentAdapterMock.getTransactionsByReceiverWithPagination.mockResolvedValue(dto);

        await paymentController.getTransactionsByReceiverWithPagination(req as CustomRequest, res as Response, next);

        expect(inboundPaymentAdapterMock.getTransactionsByReceiverWithPagination).toHaveBeenCalledWith(1, 10, undefined, undefined, 'test-trace-id', 1);
        expect(res.json).toHaveBeenCalledWith(dto);
    });

    test('should handle invalid userId and call next with NotFoundError', async () => {
        req.params.userId = 'invalid';

        await paymentController.getTransactionsByReceiverWithPagination(req as CustomRequest, res as Response, next);

        expect(next).toHaveBeenCalledWith(new NotFoundError('User not found'));
    });

    test('should handle with startDate and endDate', async () => {
        req.query = { page: '1', limit: '10', startDate: '2021-01-01', endDate: '2021-01-31' };
        const dto = new PaginatedResultsDTO([
            { id: 1, senderId: 1, amount: 100, currency: 'BRL', createdAt: new Date('2021-06-01') }
        ], 1, 1)
        inboundPaymentAdapterMock.getTransactionsByReceiverWithPagination.mockResolvedValue(dto);

        await paymentController.getTransactionsByReceiverWithPagination(req as CustomRequest, res as Response, next);

        expect(inboundPaymentAdapterMock.getTransactionsByReceiverWithPagination).toHaveBeenCalledWith(1, 10, new Date('2021-01-01'), new Date('2021-01-31'), 'test-trace-id', 1);
        expect(res.json).toHaveBeenCalledWith(dto);
    });

    test('should handle without page and limit', async () => {
        req.query = {}
        const dto = new PaginatedResultsDTO([
            { id: 1, senderId: 1, amount: 100, currency: 'BRL', createdAt: new Date() }
        ], 1, 1)
        inboundPaymentAdapterMock.getTransactionsByReceiverWithPagination.mockResolvedValue(dto);

        await paymentController.getTransactionsByReceiverWithPagination(req as CustomRequest, res as Response, next);

        expect(inboundPaymentAdapterMock.getTransactionsByReceiverWithPagination).toHaveBeenCalledWith(1, 10, undefined, undefined, 'test-trace-id', 1);
        expect(res.json).toHaveBeenCalledWith(dto);
    });

    test('should handle errors and call next with error', async () => {
        const error = new Error('Test error');
        inboundPaymentAdapterMock.getTransactionsByReceiverWithPagination.mockRejectedValue(error);

        await paymentController.getTransactionsByReceiverWithPagination(req as CustomRequest, res as Response, next);

        expect(next).toHaveBeenCalledWith(error);
    });
});