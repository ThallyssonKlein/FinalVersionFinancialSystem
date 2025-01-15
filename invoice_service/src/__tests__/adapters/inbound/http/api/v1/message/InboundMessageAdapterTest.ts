import InboundMessageAdapter from '@adapters/inbound/http/api/v1/message/InboundMessageAdapter';
import OutboundMessageRepositoryPort from '@ports/outbound/mongodb/message/OutboundMessageRepositoryPort';
import IMessageDTO from '@ports/inbound/http/api/v1/dto/IMessageDTO';
import OutboundTotalsDTO from '@ports/inbound/http/api/v1/dto/OutboundTotalsDTO';
import MessageDAO from '@ports/outbound/mongodb/message/IMessageDAO';
import MessageQueryBuilder from '@adapters/inbound/http/api/v1/message/MessageQueryBuilder';
import PaginatedResultsDTO from '@ports/inbound/http/api/v1/dto/PaginatedResultsDTO';
import { EPaymentType } from '@ports/inbound/http/api/v1/dto/EPaymentType';
import OutboundEfiBankApiPort from '@ports/outbound/http/OutboundEfiBankApiPort';
import OutboundLNBitsApiPort from '@ports/outbound/http/OutboundLNBitsAPIPort';
import OutboundUserRepositoryPort from '@ports/outbound/postgresql/user/OutboundUserRepositoryPort';

describe('InboundMessageAdapter', () => {
  let inboundMessageAdapter: InboundMessageAdapter;
  let outboundMessageRepositoryPortMock: jest.Mocked<OutboundMessageRepositoryPort>;
  let outboundEfiBankApiPort: jest.Mocked<OutboundEfiBankApiPort>;
  let outboundLNBitsApiPort: jest.Mocked<OutboundLNBitsApiPort>;
  let outboundUserRepositoryPort: jest.Mocked<OutboundUserRepositoryPort>

  const traceId = 'test-trace-id';

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock Mongoose model methods
    outboundMessageRepositoryPortMock = {
      getModel: jest.fn().mockReturnValue({
        countDocuments: jest.fn(() => Promise.resolve(10)),  // Mocking countDocuments returning a resolved Promise
        find: jest.fn().mockReturnValue({                   // Mocking find query
          sort: jest.fn().mockReturnThis(),
          skip: jest.fn().mockReturnThis(),
          limit: jest.fn().mockResolvedValue([{ id: '1', content: 'test', receiver: 'receiver1' }]),
        }),
        create: jest.fn().mockResolvedValue({}),  // Mocking create
        aggregate: jest.fn().mockImplementation(() => ({
          exec: jest.fn().mockResolvedValue([{ total: 500, count: 5 }]),  // Mocking exec method inside aggregate
        })),
      }),
    } as unknown as jest.Mocked<OutboundMessageRepositoryPort>;
    outboundEfiBankApiPort = {
      createCharge: jest.fn(),
    } as unknown as jest.Mocked<OutboundEfiBankApiPort>;
    outboundLNBitsApiPort = {
      createCharge: jest.fn(),
    } as unknown as jest.Mocked<OutboundLNBitsApiPort>;
    outboundUserRepositoryPort = {
      findUserById: jest.fn(),
    } as unknown as jest.Mocked<OutboundUserRepositoryPort>;

    jest.spyOn(MessageQueryBuilder.prototype, 'withPaidFilter').mockImplementation(function () {
      return this;
    });
    jest.spyOn(MessageQueryBuilder.prototype, 'withFilterByReceiver').mockImplementation(function () {
      return this;
    });
    jest.spyOn(MessageQueryBuilder.prototype, 'withOrderByTimestamp').mockImplementation(function () {
      return this;
    });
    jest.spyOn(MessageQueryBuilder.prototype, 'withQueryOnReceiverOrContent').mockImplementation(function () {
      return this;
    });
    jest.spyOn(MessageQueryBuilder.prototype, 'withDateRangeFilter').mockImplementation(function () {
      return this;
    });
    jest.spyOn(MessageQueryBuilder.prototype, 'getQuery').mockImplementation(function () {
      return {};
    });
    jest.spyOn(MessageQueryBuilder.prototype, 'getSort').mockImplementation(function () {
      return {};
    });
    jest.spyOn(MessageQueryBuilder.prototype, 'reset').mockImplementation(function () {
      return this;
    });
    jest.spyOn(MessageQueryBuilder.prototype, 'withBTCCurrencyFilter').mockImplementation(function () {
      return this;
    });
    jest.spyOn(MessageQueryBuilder.prototype, 'withBRLCurrencyFilter').mockImplementation(function () {
      return this;
    });
    jest.spyOn(MessageQueryBuilder.prototype, 'withoutCurrencyFilter').mockImplementation(function () {
      return this;
    });
    
    inboundMessageAdapter = new InboundMessageAdapter(outboundMessageRepositoryPortMock, outboundEfiBankApiPort, outboundLNBitsApiPort, outboundUserRepositoryPort);
  });

  describe('getReceiverMessagesWithPagination', () => {
    it('should return paginated messages with order if ordered is true', async () => {
      outboundMessageRepositoryPortMock.getModel().countDocuments = jest.fn().mockResolvedValue(10);
      MessageQueryBuilder.prototype.getQuery = jest.fn().mockReturnValue({});
      MessageQueryBuilder.prototype.getSort = jest.fn().mockReturnValue({});
      outboundMessageRepositoryPortMock.getModel().find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([{ content: 'test', receiver: 'receiver1' }]),
      });

      const result = await inboundMessageAdapter.getMessagesWithPagination(
         1, 10, true, null, null, null, traceId, 'receiver1'
      );
      
      expect(MessageQueryBuilder.prototype.withPaidFilter).toHaveBeenCalled();
      expect(MessageQueryBuilder.prototype.withFilterByReceiver).toHaveBeenCalledWith('receiver1');
      expect(MessageQueryBuilder.prototype.withOrderByTimestamp).toHaveBeenCalled();
      expect(MessageQueryBuilder.prototype.withQueryOnReceiverOrContent).not.toHaveBeenCalled();
      expect(MessageQueryBuilder.prototype.withDateRangeFilter).not.toHaveBeenCalled();
      expect(MessageQueryBuilder.prototype.reset).toHaveBeenCalled();
      expect(outboundMessageRepositoryPortMock.getModel().countDocuments).toHaveBeenCalled();
      expect(outboundMessageRepositoryPortMock.getModel().find).toHaveBeenCalledWith({});
      expect(outboundMessageRepositoryPortMock.getModel().find().sort).toHaveBeenCalledWith({});
      expect(outboundMessageRepositoryPortMock.getModel().find().skip).toHaveBeenCalledWith(0);
      expect(outboundMessageRepositoryPortMock.getModel().find().limit).toHaveBeenCalledWith(10);

      // validate each property of result
      expect(result).toBeInstanceOf(PaginatedResultsDTO);
      expect(result.results).toHaveLength(1);
      expect(result.count).toBe(10);
      expect(result.totalPages).toBe(1);
      expect(result.results[0].content).toBe('test');
      expect(result.results[0].receiver).toBe('receiver1');
    });

    it('should return paginated messages with query if query is provided', async () => {
      outboundMessageRepositoryPortMock.getModel().countDocuments = jest.fn().mockResolvedValue(10);
      MessageQueryBuilder.prototype.getQuery = jest.fn().mockReturnValue({});
      MessageQueryBuilder.prototype.getSort = jest.fn().mockReturnValue({});
      outboundMessageRepositoryPortMock.getModel().find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([{ content: 'test', receiver: 'receiver1' }]),
      });

      const result = await inboundMessageAdapter.getMessagesWithPagination(
         1, 10, false, null, null, 'query', traceId, 'receiver1'
      );
      
      expect(MessageQueryBuilder.prototype.withPaidFilter).toHaveBeenCalled();
      expect(MessageQueryBuilder.prototype.withFilterByReceiver).toHaveBeenCalledWith('receiver1');
      expect(MessageQueryBuilder.prototype.withOrderByTimestamp).not.toHaveBeenCalled();
      expect(MessageQueryBuilder.prototype.withQueryOnReceiverOrContent).toHaveBeenCalledWith('query');
      expect(MessageQueryBuilder.prototype.withDateRangeFilter).not.toHaveBeenCalled();
      expect(MessageQueryBuilder.prototype.reset).toHaveBeenCalled();
      expect(outboundMessageRepositoryPortMock.getModel().countDocuments).toHaveBeenCalled();
      expect(outboundMessageRepositoryPortMock.getModel().find).toHaveBeenCalledWith({});
      expect(outboundMessageRepositoryPortMock.getModel().find().sort).toHaveBeenCalledWith({});
      expect(outboundMessageRepositoryPortMock.getModel().find().skip).toHaveBeenCalledWith(0);
      expect(outboundMessageRepositoryPortMock.getModel().find().limit).toHaveBeenCalledWith(10);

      // validate each property of result
      expect(result).toBeInstanceOf(PaginatedResultsDTO);
      expect(result.results).toHaveLength(1);
      expect(result.count).toBe(10);
      expect(result.totalPages).toBe(1);
      expect(result.results[0].content).toBe('test');
      expect(result.results[0].receiver).toBe('receiver1');
    });

    it('should return paginated messages with date range if start and end date are provided', async () => {
      outboundMessageRepositoryPortMock.getModel().countDocuments = jest.fn().mockResolvedValue(10);
      MessageQueryBuilder.prototype.getQuery = jest.fn().mockReturnValue({});
      MessageQueryBuilder.prototype.getSort = jest.fn().mockReturnValue({});
      outboundMessageRepositoryPortMock.getModel().find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([{ content: 'test', receiver: 'receiver1' }]),
      });

      const result = await inboundMessageAdapter.getMessagesWithPagination(
        1, 10, false, '2021-01-01', '2021-12-31', null, traceId, 'receiver1'
      );
      
      expect(MessageQueryBuilder.prototype.withPaidFilter).toHaveBeenCalled();
      expect(MessageQueryBuilder.prototype.withFilterByReceiver).toHaveBeenCalledWith('receiver1');
      expect(MessageQueryBuilder.prototype.withOrderByTimestamp).not.toHaveBeenCalled();
      expect(MessageQueryBuilder.prototype.withQueryOnReceiverOrContent).not.toHaveBeenCalled();
      expect(MessageQueryBuilder.prototype.withDateRangeFilter).toHaveBeenCalledWith(new Date('2021-01-01'), new Date('2021-12-31'));
      expect(MessageQueryBuilder.prototype.reset).toHaveBeenCalled();
      expect(outboundMessageRepositoryPortMock.getModel().countDocuments).toHaveBeenCalled();
      expect(outboundMessageRepositoryPortMock.getModel().find).toHaveBeenCalledWith({});
      expect(outboundMessageRepositoryPortMock.getModel().find().sort).toHaveBeenCalledWith({});
      expect(outboundMessageRepositoryPortMock.getModel().find().skip).toHaveBeenCalledWith(0);
      expect(outboundMessageRepositoryPortMock.getModel().find().limit).toHaveBeenCalledWith(10);

      // validate each property of result
      expect(result).toBeInstanceOf(PaginatedResultsDTO);
      expect(result.results).toHaveLength(1);
      expect(result.count).toBe(10);
      expect(result.totalPages).toBe(1);
      expect(result.results[0].content).toBe('test');
      expect(result.results[0].receiver).toBe('receiver1');
    });
  });


  describe('saveMessage', () => {
    it('should save a message and return the result', async () => {
      const messageDTO: IMessageDTO = {
        id: '1', content: 'test content', amount: "100", sender: 'sender', currency: 'BRL'
      } as IMessageDTO;
      const savedMessage: MessageDAO = {
        id: '1', content: 'test content', receiver: 1, amount: 100,
        sender: 'sender', currency: 'BRL', paid: false, timestamp: new Date()
      } as MessageDAO;
      
      outboundMessageRepositoryPortMock.getModel().create = jest.fn().mockResolvedValue(savedMessage);
      outboundUserRepositoryPort.findUserById = jest.fn().mockResolvedValue([{ id: 1 }]);
      outboundEfiBankApiPort.createCharge = jest.fn().mockResolvedValue({ paymentId: '1', qrCode: 'qr-code' });

      const result = await inboundMessageAdapter.saveMessage(messageDTO, 'receiver1', traceId, EPaymentType.BRL);

      expect(outboundMessageRepositoryPortMock.getModel().create).toHaveBeenCalledWith(
        expect.objectContaining({ content: 'test content', receiver: 'receiver1' })
      );
      expect(result).toEqual({
        code: 'qr-code'
      });
    });
  });

  describe('getTotalAndCountForAReceiver', () => {
    it('should return total and count for a receiver', async () => {
      const aggregationResult1 = [{ total: 500, count: 5 }];
      const aggregationResult2 = [{ total: 0.03, count: 5}];
      
      outboundMessageRepositoryPortMock.getModel().aggregate = jest.fn()
      .mockImplementationOnce(() => ({
        exec: jest.fn().mockResolvedValue(aggregationResult2),
      }))
      .mockImplementationOnce(() => ({
        exec: jest.fn().mockResolvedValue(aggregationResult1),
      }));


      const result = await inboundMessageAdapter.getTotalAndCountForAReceiver(
        'receiver1', '2021-01-01', '2021-12-31', traceId
      );

      expect(MessageQueryBuilder.prototype.withPaidFilter).toHaveBeenCalled();
      expect(MessageQueryBuilder.prototype.withFilterByReceiver).toHaveBeenCalledWith('receiver1');
      expect(MessageQueryBuilder.prototype.withBTCCurrencyFilter).toHaveBeenCalled();
      expect(MessageQueryBuilder.prototype.withDateRangeFilter).toHaveBeenCalledWith(new Date('2021-01-01'), new Date('2021-12-31'));
      expect(outboundMessageRepositoryPortMock.getModel().aggregate).toHaveBeenCalledWith([
        { $match: MessageQueryBuilder.prototype.getQuery() },
        { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
      ]);
      expect(MessageQueryBuilder.prototype.withoutCurrencyFilter).toHaveBeenCalled();
      expect(MessageQueryBuilder.prototype.withBRLCurrencyFilter).toHaveBeenCalled();
      expect(outboundMessageRepositoryPortMock.getModel().aggregate).toHaveBeenCalledTimes(2);
      expect(result).toBeInstanceOf(OutboundTotalsDTO);
      expect(result.brlTotal).toBe(500);
      expect(result.count).toBe(10);
      expect(result.btcTotal).toBe(0.03);
    });

    it('should return zero totals if no results found', async () => {
      const aggregationResult = [];
      
      outboundMessageRepositoryPortMock.getModel().aggregate = jest.fn().mockImplementation(() => ({
        exec: jest.fn().mockResolvedValue(aggregationResult),
      }));

      const result = await inboundMessageAdapter.getTotalAndCountForAReceiver(
        'receiver1', '2021-01-01', '2021-12-31', traceId
      );

      expect(outboundMessageRepositoryPortMock.getModel().aggregate).toHaveBeenCalled();
      expect(result).toBeInstanceOf(OutboundTotalsDTO);
      expect(result.brlTotal).toBe(0);
      expect(result.btcTotal).toBe(0);
      expect(result.count).toBe(0);
    });
  });
});
