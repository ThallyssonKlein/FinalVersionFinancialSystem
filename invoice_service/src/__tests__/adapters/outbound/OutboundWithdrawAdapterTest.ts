import OutboundTransactionAdapter from '@adapters/outbound/OutboundTransactionAdapter';
import IWithdrawBO from '@domain/user/bo/IWithdrawBO';
import ITransactionDAO from '@ports/outbound/postgresql/transaction/ITransactionDAO';
import OutboundTransactionRepositoryPort from '@ports/outbound/postgresql/transaction/OutboundTransactionRepositoryPort';

describe('OutboundTransactionAdapter', () => {
    let outboundTransactionRepositoryPort: jest.Mocked<OutboundTransactionRepositoryPort>;
    let outboundWithdrawAdapter: OutboundTransactionAdapter;

    beforeEach(() => {
        outboundTransactionRepositoryPort = {
            createWithdraw: jest.fn(),
            deleteTransactionById: jest.fn()
        } as unknown as jest.Mocked<OutboundTransactionRepositoryPort>;
        outboundWithdrawAdapter = new OutboundTransactionAdapter(outboundTransactionRepositoryPort);
    });

    describe('createWithdrawAndReturnBO', () => {
        it('should create a withdraw and return IWithdrawBO', async () => {
            const userId = 1;
            const amount = 100;
            const currency = 'BRL';
            const traceId = 'trace-id';
            const withdrawDAO: ITransactionDAO = { amount: 100, currency, receiver_id: userId, transaction_type: 'withdraw' };
            const withdrawBO: IWithdrawBO = { amount: 100, currency, receiver_id: userId };

            outboundTransactionRepositoryPort.createWithdraw.mockResolvedValue(withdrawDAO);

            const result = await outboundWithdrawAdapter.createWithdrawAndReturnBO(userId, amount, currency, traceId);

            expect(outboundTransactionRepositoryPort.createWithdraw).toHaveBeenCalledWith({ amount: 100, currency, receiver_id: userId, transaction_type: 'withdraw' });
            expect(result).toEqual(withdrawBO);
        });
    });

    describe('createWithdraw', () => {
        it('should create a withdraw and return IWithdrawDAO', async () => {
            const userId = 1;
            const amount = 100;
            const currency = 'BTC';
            const traceId = 'trace-id';
            const withdrawDAO: ITransactionDAO = { amount, currency, receiver_id: userId, transaction_type: 'withdraw' };

            outboundTransactionRepositoryPort.createWithdraw.mockResolvedValue(withdrawDAO);

            const result = await outboundWithdrawAdapter.createWithdraw(userId, amount, currency, traceId);

            expect(outboundTransactionRepositoryPort.createWithdraw).toHaveBeenCalledWith({ amount, currency, receiver_id: userId, transaction_type: 'withdraw' });
            expect(result).toEqual(withdrawDAO);
        });
    });

    describe('deleteWithdrawById', () => {
        it('should delete a withdraw by id', async () => {
            const withdrawId = 1;
            const traceId = 'trace-id';

            await outboundWithdrawAdapter.deleteWithdrawById(withdrawId, traceId);

            expect(outboundTransactionRepositoryPort.deleteTransactionById).toHaveBeenCalledWith(withdrawId);
        });
    });
});