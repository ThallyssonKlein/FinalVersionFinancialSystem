import InboundTransactionAdapter from '@adapters/inbound/http/api/v1/InboundPaymentAdapter';
import { Pool } from 'pg';
import PaginatedResultsDTO from '@ports/inbound/http/api/v1/dto/PaginatedResultsDTO';
import ITransactionDTO from '@ports/inbound/http/api/v1/dto/ITransactionDTO';
import OutboundMessageRepositoryPort from '@ports/outbound/mongodb/message/OutboundMessageRepositoryPort';
import OutboundTransactionalPaymentConfirmationRepository from '@ports/outbound/OutboundTransactionalPaymentConfirmationRepository';
import OutboundUserAdapter from '@adapters/outbound/OutboundUserAdapter';
import IUserDAO from '@ports/outbound/postgresql/user/IUserDAO';
import { EPaymentType } from '@ports/inbound/http/api/v1/dto/EPaymentType';
import OutboundTransactionRepositoryPort from '@ports/outbound/postgresql/transaction/OutboundTransactionRepositoryPort';
import ITransactionDAO from '@ports/outbound/postgresql/transaction/ITransactionDAO';

// jest.mock('@ports/outbound/mongodb/message/OutboundMessageRepositoryPort');
jest.mock('@ports/outbound/OutboundTransactionalPaymentConfirmationRepository');

jest.mock('pg', () => {
    const mPool = {
        query: jest.fn()
    };
    return { Pool: jest.fn(() => mPool) };
});
jest.mock('@config/index', () => {
    return jest.fn().mockImplementation(() => {
        return {
            getConfig: jest.fn().mockReturnValue({
                websocket: {
                    senderPrefix: 'sender',
                    receiverPrefix: 'receiver',
                }
            })
        }
    });
})

function mapIPaymentDAOToIPaymentDTO(payment: ITransactionDAO): ITransactionDTO {
    return {
        id: payment.id,
        senderId: payment.sender_id,
        amount: payment.amount,
        currency: payment.currency,
        createdAt: payment.created_at,
        receiverName: payment.receiver_name,
        transactionType: payment.transaction_type,
        receiverId: payment.receiver_id
    }
}

describe('InboundPaymentAdapter', () => {
    let outboundTransactionRepositoryPort: jest.Mocked<OutboundTransactionRepositoryPort>;
    let outboundMessageRepositoryPort: jest.Mocked<OutboundMessageRepositoryPort>;
    let transactionalPaymentConfirmationRepository: jest.Mocked<OutboundTransactionalPaymentConfirmationRepository>;
    let outboundUserAdapterMock: jest.Mocked<OutboundUserAdapter>;
    let adapter: InboundTransactionAdapter;
    let pool: jest.Mocked<Pool>;
    let wss: any

    beforeEach(() => {
        pool = new Pool() as jest.Mocked<Pool>;
        wss = {
            sendMessageToRoom: jest.fn(),
        }
        outboundTransactionRepositoryPort = {
            findAllTransactionsWithPagination: jest.fn(),
            countAllTransactions: jest.fn(),
            findAllTransactionsWithDateRangeWithPagination: jest.fn(),
            countAllTransactionsWithDateRange: jest.fn()
        } as unknown as jest.Mocked<OutboundTransactionRepositoryPort>;
        outboundMessageRepositoryPort = {
            getModel: jest.fn().mockReturnValue({
                findOne: jest.fn()
            })
        } as unknown as jest.Mocked<OutboundMessageRepositoryPort>;
        outboundUserAdapterMock = {
            findUserById: jest.fn()
        } as unknown as jest.Mocked<OutboundUserAdapter>;

        transactionalPaymentConfirmationRepository = new OutboundTransactionalPaymentConfirmationRepository(pool, outboundMessageRepositoryPort) as jest.Mocked<OutboundTransactionalPaymentConfirmationRepository>;
        adapter = new InboundTransactionAdapter(wss, outboundMessageRepositoryPort, outboundTransactionRepositoryPort, transactionalPaymentConfirmationRepository, outboundUserAdapterMock);
    });

    describe('getPaymentsByReceiverWithPagination', () => {
        it('should get payments by receiver without date range', async () => {
            const userId = 1;
            const page = 1;
            const pageSize = 10;
            const traceId = 'trace-id';
            const payments: ITransactionDAO[] = [
                { id: 1, sender_id: 'sender', receiver_id: userId, amount: 100, currency: 'BRL', created_at: new Date(), receiver_name: "receiver", transaction_type: 'payment'},
            ];
    
            outboundTransactionRepositoryPort.findAllTransactionsWithPagination.mockResolvedValue(payments);
            outboundTransactionRepositoryPort.countAllTransactions.mockResolvedValue(1);
    
            const result = await adapter.getTransactionsByReceiverWithPagination(page, pageSize, null, null, traceId, userId);
    
            expect(outboundTransactionRepositoryPort.findAllTransactionsWithPagination).toHaveBeenCalledWith(page, pageSize, userId);
            expect(outboundTransactionRepositoryPort.countAllTransactions).toHaveBeenCalledWith(userId);
            expect(outboundTransactionRepositoryPort.findAllTransactionsWithDateRangeWithPagination).not.toHaveBeenCalled();
            expect(outboundTransactionRepositoryPort.countAllTransactionsWithDateRange).not.toHaveBeenCalled();
            expect(result).toStrictEqual(
                new PaginatedResultsDTO([mapIPaymentDAOToIPaymentDTO(payments[0])], 1, 1)
            )
        });
    
        it('should get payments by receiver with date range', async () => {
            const userId = 1;
            const page = 1;
            const pageSize = 10;
            const startDate = new Date('2023-01-01');
            const endDate = new Date('2023-12-31');
            const traceId = 'trace-id';
            const correctRecord = { id: 2, sender_id: "sender", receiver_id: userId, amount: 100, created_at: new Date('2023-06-01'), receiver_name: "receiver", currency: 'BRL' as 'BRL', transaction_type: 'payment' as 'payment'};
            const payments: ITransactionDAO[] = [
                { ...correctRecord },
            ];
    
            outboundTransactionRepositoryPort.findAllTransactionsWithDateRangeWithPagination.mockResolvedValue(payments);
            outboundTransactionRepositoryPort.countAllTransactionsWithDateRange.mockResolvedValue(1);
    
            const result = await adapter.getTransactionsByReceiverWithPagination(page, pageSize, startDate, endDate, traceId, userId);
    
            expect(outboundTransactionRepositoryPort.findAllTransactionsWithDateRangeWithPagination).toHaveBeenCalledWith(page, pageSize, startDate, endDate, userId);
            expect(outboundTransactionRepositoryPort.countAllTransactionsWithDateRange).toHaveBeenCalledWith(startDate, endDate, userId);
            expect(outboundTransactionRepositoryPort.findAllTransactionsWithPagination).not.toHaveBeenCalled();
            expect(outboundTransactionRepositoryPort.countAllTransactions).not.toHaveBeenCalled();
            expect(result).toStrictEqual(
                new PaginatedResultsDTO([mapIPaymentDAOToIPaymentDTO(correctRecord)], 1, 1)
            )
        });
    })

    describe('receivePaymentConfirmation', () => {
        it('should confirm payment successfully', async () => {
            const paymentId = 'payment-id';
            const traceId = 'trace-id';
            const paymentType = EPaymentType.BRL;
            const message = {
                sender: 'sender-id',
                receiver: 1,
                amount: 100,
                currency: 'BRL',
                paid: false
            };
            const user: IUserDAO = { id: 1, tax_value: 10 } as IUserDAO;

            (outboundMessageRepositoryPort.getModel().findOne as jest.Mock).mockReturnValue(message);
            outboundUserAdapterMock.findUserById.mockResolvedValue(user);
            transactionalPaymentConfirmationRepository.setMessageToPaidThenSavePaymentThenIncreaseBalance.mockResolvedValue();
            const newAmount = message.amount - (message.amount * (user.tax_value / 100));

            await adapter.receivePaymentConfirmation(paymentId, traceId, paymentType);

            expect(outboundMessageRepositoryPort.getModel().findOne).toHaveBeenCalledWith({ paymentId });
            expect(outboundUserAdapterMock.findUserById).toHaveBeenCalledWith(message.receiver, traceId);
            expect(transactionalPaymentConfirmationRepository.setMessageToPaidThenSavePaymentThenIncreaseBalance).toHaveBeenCalledWith(
                {
                    sender_id: message.sender,
                    receiver_id: message.receiver,
                    amount: newAmount,
                    currency: message.currency,
                    created_at: expect.any(Date),
                    transaction_type: 'payment'
                },
                newAmount,
                paymentId,
                paymentType
            );
            expect(wss.sendMessageToRoom).toHaveBeenCalledWith('sender' + message.sender, paymentId);
            expect(wss.sendMessageToRoom).toHaveBeenCalledWith('receiver' + message.receiver, JSON.stringify({ ...message, paid: true }));
        });

        it('should handle error when fetching message', async () => {
            const paymentId = 'payment-id';
            const traceId = 'trace-id';
            const paymentType = EPaymentType.BRL;

            (outboundMessageRepositoryPort.getModel().findOne as jest.Mock).mockRejectedValue(new Error('Message not found'));

            await expect(adapter.receivePaymentConfirmation(paymentId, traceId, paymentType)).rejects.toThrow('Message not found');
        });

        it('should handle error when fetching user', async () => {
            const paymentId = 'payment-id';
            const traceId = 'trace-id';
            const paymentType = EPaymentType.BRL;
            const message = {
                sender: 'sender-id',
                receiver: 1,
                amount: 100,
                currency: 'BRL',
                paid: false
            };

            (outboundMessageRepositoryPort.getModel().findOne as jest.Mock).mockResolvedValue(message);
            outboundUserAdapterMock.findUserById.mockRejectedValue(new Error('User not found'));

            await expect(adapter.receivePaymentConfirmation(paymentId, traceId, paymentType)).rejects.toThrow('User not found');
        });

        it('should handle error during payment processing', async () => {
            const paymentId = 'payment-id';
            const traceId = 'trace-id';
            const paymentType = EPaymentType.BRL;
            const message = {
                sender: 'sender-id',
                receiver: 1,
                amount: 100,
                currency: 'BRL',
                paid: false
            };
            const user: IUserDAO = { id: 1, tax_value: 10 } as IUserDAO;

            (outboundMessageRepositoryPort.getModel().findOne as jest.Mock).mockResolvedValue(message);
            outboundUserAdapterMock.findUserById.mockResolvedValue(user);
            transactionalPaymentConfirmationRepository.setMessageToPaidThenSavePaymentThenIncreaseBalance.mockRejectedValue(new Error('Payment processing error'));

            await expect(adapter.receivePaymentConfirmation(paymentId, traceId, paymentType)).rejects.toThrow('Payment processing error');
        });
    });
});