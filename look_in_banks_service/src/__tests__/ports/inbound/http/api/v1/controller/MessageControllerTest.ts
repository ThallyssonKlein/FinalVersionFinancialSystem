import MessageController from '@ports/inbound/http/api/v1/controller/MessageController';
import InboundMessageAdapter from '@adapters/inbound/http/api/v1/message/InboundMessageAdapter';
import { Response, NextFunction } from 'express';
import CustomRequest from '@ports/inbound/http/api/v1/middleware/CustomRequest';
import { EPaymentType } from '@ports/inbound/http/api/v1/dto/EPaymentType';
import OutboundUserAdapter from '@adapters/outbound/OutboundUserAdapter';

describe('MessageController', () => {
  let messageController: MessageController;
  let inboundMessageAdapterMock: jest.Mocked<InboundMessageAdapter>;
  let req: CustomRequest;
  let res: Response;
  let next: NextFunction;

  beforeEach(() => {
    inboundMessageAdapterMock = {
      getReceiverMessagesWithPagination: jest.fn(),
      saveMessage: jest.fn(),
      getTotalAndCountForAReceiver: jest.fn(),
      markMessageAsRead: jest.fn(),
      markMessageAsUnread: jest.fn(),
      getMessagesWithPagination: jest.fn(),
    } as unknown as jest.Mocked<InboundMessageAdapter>;

    messageController = new MessageController(inboundMessageAdapterMock);

    req = {
      params: { userId: 1 },
      query: {},
      body: {},
      traceId: 'test-trace-id',
    } as unknown as CustomRequest;

    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    } as unknown as Response;

    next = jest.fn();
  });

  describe('getReceiverMessagesWithPagination', () => {
    it('should return paginated messages with status 200', async () => {
      const paginatedMessages = { results: [], count: 10, totalPages: 2 };
      inboundMessageAdapterMock.getMessagesWithPagination.mockResolvedValue(paginatedMessages);

      req.query = { page: '1', limit: '10', ordered: 'true', startDate: '2021-01-01', endDate: '2021-12-31', query: 'test' };
      req.params.userId = 'receiver1';

      await messageController.getReceiverMessagesWithPagination(req, res, next);

      expect(inboundMessageAdapterMock.getMessagesWithPagination).toHaveBeenCalledWith(
        1, 10, true, '2021-01-01', '2021-12-31', 'test', 'test-trace-id', 'receiver1'
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(paginatedMessages);
    });

    it('should call next with error if adapter throws', async () => {
      const error = new Error('Test Error');
      inboundMessageAdapterMock.getMessagesWithPagination.mockRejectedValue(error);

      await messageController.getReceiverMessagesWithPagination(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('saveMessage', () => {
    it('should save message and return status 200', async () => {
      const message = { content: 'Hello world', currency: 'BTC' };
      const paymentResponse = { code: 'code'}
      inboundMessageAdapterMock.saveMessage.mockResolvedValue(paymentResponse);

      req.body = message;
      req.params.userId = '1';

      await messageController.saveMessage(req, res, next);

      expect(inboundMessageAdapterMock.saveMessage).toHaveBeenCalledWith(message, "1", 'test-trace-id', EPaymentType.BTC);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.send).toHaveBeenCalledWith(paymentResponse);
    });

    it('should call next with error if adapter throws', async () => {
      const error = new Error('Test Error');
      inboundMessageAdapterMock.saveMessage.mockRejectedValue(error);

      await messageController.saveMessage(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getTotalAndCountForAReceiver', () => {
    it('should return total and count with status 200', async () => {
      const totals = { brlTotal: 500, btcTotal: 0.0001, count: 5 };
      inboundMessageAdapterMock.getTotalAndCountForAReceiver.mockResolvedValue(totals);

      req.query = { startDate: '2021-01-01', endDate: '2021-12-31' };
      req.params.userId = 'receiver1';

      await messageController.getTotalAndCountForAReceiver(req, res, next);

      expect(inboundMessageAdapterMock.getTotalAndCountForAReceiver).toHaveBeenCalledWith(
        'receiver1', '2021-01-01', '2021-12-31', 'test-trace-id'
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(totals);
    });

    it('should call next with error if adapter throws', async () => {
      const error = new Error('Test Error');
      inboundMessageAdapterMock.getTotalAndCountForAReceiver.mockRejectedValue(error);

      await messageController.getTotalAndCountForAReceiver(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('markMessageAsRead', () => {
    it('should mark message as read with status 200', async () => {
      req.params.messageId = 'message1';
      req.user = { id: '1' };

      inboundMessageAdapterMock.markMessageAsUnread.mockResolvedValue();

      await messageController.markMessageAsRead(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(inboundMessageAdapterMock.markMessageAsRead).toHaveBeenCalledWith(1, 'message1', 'test-trace-id');
    });
  });

  describe('markMessageAsUnread', () => {
    it('should mark message as unread with status 200', async () => {
      req.params.messageId = 'message1';
      req.user = { id: '1' };

      inboundMessageAdapterMock.markMessageAsUnread.mockResolvedValue();

      await messageController.markMessageAsUnread(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(inboundMessageAdapterMock.markMessageAsUnread).toHaveBeenCalledWith(1, 'message1', 'test-trace-id');
    });
  });
});
