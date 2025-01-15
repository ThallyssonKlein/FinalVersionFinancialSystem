import WithdrawService from '@domain/user/service/WithdrawService';
import OutboundUserAdapter from '@adapters/outbound/OutboundUserAdapter';
import OutboundTransactionAdapter from '@adapters/outbound/OutboundTransactionAdapter';
import OutboundEfiBankAPIAdapter from '@adapters/outbound/OutboundEfiBankAPIAdapter';
import OutboundLNBitsAdapter from '@adapters/outbound/OutboundLNBitsAdapter';
import InsufficientBalanceError from '@domain/user/error/InsufficientBalanceError';

jest.mock('@adapters/outbound/OutboundUserAdapter');
jest.mock('@adapters/outbound/OutboundTransactionAdapter');
jest.mock('@adapters/outbound/OutboundEfiBankAPIAdapter');
jest.mock('@adapters/outbound/OutboundLNBitsAdapter');

describe('WithdrawService', () => {
    let withdrawService: WithdrawService;
    let outboundUserAdapter: jest.Mocked<OutboundUserAdapter>;
    let outboundWithdrawAdapter: jest.Mocked<OutboundTransactionAdapter>;
    let outboundEfiBankAPIAdapter: jest.Mocked<OutboundEfiBankAPIAdapter>;
    let outboundLNBitsAdapter: jest.Mocked<OutboundLNBitsAdapter>;

    beforeEach(() => {
        outboundUserAdapter = {
            getUserBrlBalance: jest.fn(),
            discountUserBrlBalance: jest.fn(),
            getUserBtcBalance: jest.fn(),
            discountUserBtcBalance: jest.fn()
        } as unknown as jest.Mocked<OutboundUserAdapter>;
        outboundWithdrawAdapter = {
            createWithdrawAndReturnBO: jest.fn(),
            deleteWithdrawById: jest.fn()
        } as unknown as jest.Mocked<OutboundTransactionAdapter>;
        outboundEfiBankAPIAdapter = {
            doPixWithdraw: jest.fn()
        } as unknown as jest.Mocked<OutboundEfiBankAPIAdapter>;
        outboundLNBitsAdapter = {
            getInvoiceAmount: jest.fn(),
            doBtcWithdraw: jest.fn()
        } as unknown as jest.Mocked<OutboundLNBitsAdapter>;
        withdrawService = new WithdrawService(
            outboundUserAdapter,
            outboundWithdrawAdapter,
            outboundEfiBankAPIAdapter,
            outboundLNBitsAdapter
        );
    });

    describe('pixWithdraw', () => {
        it('should successfully withdraw BRL', async () => {
            outboundUserAdapter.getUserBrlBalance.mockResolvedValue(1000);
            outboundWithdrawAdapter.createWithdrawAndReturnBO.mockResolvedValue({ id: 1, amount: 500, currency: "BRL", receiver_id: 1 });
            outboundEfiBankAPIAdapter.doPixWithdraw.mockResolvedValue();

            await withdrawService.pixWithdraw(1, '500', 'pixKey', 'traceId');

            expect(outboundUserAdapter.getUserBrlBalance).toHaveBeenCalledWith(1, 'traceId');
            expect(outboundWithdrawAdapter.createWithdrawAndReturnBO).toHaveBeenCalledWith(1, 500, 'BRL', 'traceId');
            expect(outboundUserAdapter.discountUserBrlBalance).toHaveBeenCalledWith(1, 500, 'traceId');
            expect(outboundEfiBankAPIAdapter.doPixWithdraw).toHaveBeenCalledWith('500', 'pixKey', 1, 'traceId');
        });

        it('should throw InsufficientBalanceError for insufficient balance', async () => {
            outboundUserAdapter.getUserBrlBalance.mockResolvedValue(100);

            await expect(withdrawService.pixWithdraw(1, '500', 'pixKey', 'traceId')).rejects.toThrow(InsufficientBalanceError);

            expect(outboundUserAdapter.getUserBrlBalance).toHaveBeenCalledWith(1, 'traceId');
        });

        it('should delete withdraw on failure in doPixWithdraw', async () => {
            outboundUserAdapter.getUserBrlBalance.mockResolvedValue(1000);
            outboundWithdrawAdapter.createWithdrawAndReturnBO.mockResolvedValue({ id: 1, amount: 500, currency: "BRL", receiver_id: 1 });
            outboundEfiBankAPIAdapter.doPixWithdraw.mockRejectedValue(new Error('Pix withdraw failed'));

            await expect(withdrawService.pixWithdraw(1, '500', 'pixKey', 'traceId')).rejects.toThrow('Pix withdraw failed');

            expect(outboundWithdrawAdapter.deleteWithdrawById).toHaveBeenCalledWith(1, 'traceId');
        });
    });

    describe('btcWithdraw', () => {
        it('should successfully withdraw BTC', async () => {
            outboundLNBitsAdapter.getInvoiceAmount.mockResolvedValue(1000);
            outboundUserAdapter.getUserBtcBalance.mockResolvedValue(2000);
            outboundWithdrawAdapter.createWithdrawAndReturnBO.mockResolvedValue({ id: 1, amount: 1000, currency: "BTC", receiver_id: 1 });
            outboundLNBitsAdapter.doBtcWithdraw.mockResolvedValue();

            await withdrawService.btcWithdraw(1, 'invoice', 'traceId');

            expect(outboundLNBitsAdapter.getInvoiceAmount).toHaveBeenCalledWith('invoice', 'traceId');
            expect(outboundUserAdapter.getUserBtcBalance).toHaveBeenCalledWith(1, 'traceId');
            expect(outboundWithdrawAdapter.createWithdrawAndReturnBO).toHaveBeenCalledWith(1, 1, 'BTC', 'traceId');
            expect(outboundUserAdapter.discountUserBtcBalance).toHaveBeenCalledWith(1, 1, 'traceId');
            expect(outboundLNBitsAdapter.doBtcWithdraw).toHaveBeenCalledWith('invoice', 'traceId');
        });

        it('should throw InsufficientBalanceError for insufficient balance', async () => {
            outboundLNBitsAdapter.getInvoiceAmount.mockResolvedValue(1000000);
            outboundUserAdapter.getUserBtcBalance.mockResolvedValue(900);

            await expect(withdrawService.btcWithdraw(1, 'invoice', 'traceId')).rejects.toThrow(InsufficientBalanceError);

            expect(outboundLNBitsAdapter.getInvoiceAmount).toHaveBeenCalledWith('invoice', 'traceId');
            expect(outboundUserAdapter.getUserBtcBalance).toHaveBeenCalledWith(1, 'traceId');
        });

        it('should delete withdraw on failure in doBtcWithdraw', async () => {
            outboundLNBitsAdapter.getInvoiceAmount.mockResolvedValue(1000);
            outboundUserAdapter.getUserBtcBalance.mockResolvedValue(2000);
            outboundWithdrawAdapter.createWithdrawAndReturnBO.mockResolvedValue({ id: 1, amount: 1000, currency: "BTC", receiver_id: 1 });
            outboundLNBitsAdapter.doBtcWithdraw.mockRejectedValue(new Error('BTC withdraw failed'));

            await expect(withdrawService.btcWithdraw(1, 'invoice', 'traceId')).rejects.toThrow('BTC withdraw failed');

            expect(outboundWithdrawAdapter.deleteWithdrawById).toHaveBeenCalledWith(1, 'traceId');
        });
    });

    describe('virtualWithdraw', () => {
        it('should successfully withdraw BRL', async () => {
            outboundUserAdapter.getUserBrlBalance.mockResolvedValue(1000);
            outboundWithdrawAdapter.createWithdrawAndReturnBO.mockResolvedValue({ id: 1, amount: 500, currency: "BRL", receiver_id: 1 });

            await withdrawService.virtualWithdraw(1, 500, 'BRL', 'traceId');

            expect(outboundWithdrawAdapter.createWithdrawAndReturnBO).toHaveBeenCalledWith(1, 500, 'BRL', 'traceId');
            expect(outboundUserAdapter.getUserBrlBalance).toHaveBeenCalledWith(1, 'traceId');
            expect(outboundUserAdapter.discountUserBrlBalance).toHaveBeenCalledWith(1, 500, 'traceId');
        });

        it('should successfully withdraw BTC', async () => {
            outboundUserAdapter.getUserBtcBalance.mockResolvedValue(1000);
            outboundWithdrawAdapter.createWithdrawAndReturnBO.mockResolvedValue({ id: 1, amount: 500, currency: "BTC", receiver_id: 1 });

            await withdrawService.virtualWithdraw(1, 500, 'BTC', 'traceId');

            expect(outboundWithdrawAdapter.createWithdrawAndReturnBO).toHaveBeenCalledWith(1, 500, 'BTC', 'traceId');
            expect(outboundUserAdapter.getUserBtcBalance).toHaveBeenCalledWith(1, 'traceId');
            expect(outboundUserAdapter.discountUserBtcBalance).toHaveBeenCalledWith(1, 500, 'traceId');
        });

        it('should delete withdraw on error for BRL', async () => {
            outboundUserAdapter.getUserBrlBalance.mockResolvedValue(1000);
            outboundWithdrawAdapter.createWithdrawAndReturnBO.mockResolvedValue({ id: 1, amount: 500, currency: "BRL", receiver_id: 1 });
            outboundUserAdapter.discountUserBrlBalance.mockRejectedValue(new Error('Discount failed'));

            await expect(withdrawService.virtualWithdraw(1, 500, 'BRL', 'traceId')).rejects.toThrow('Discount failed');

            expect(outboundWithdrawAdapter.deleteWithdrawById).toHaveBeenCalledWith(1, 'traceId');
        });

        it('should delete withdraw on error for BTC', async () => {
            outboundUserAdapter.getUserBtcBalance.mockResolvedValue(1000);
            outboundWithdrawAdapter.createWithdrawAndReturnBO.mockResolvedValue({ id: 1, amount: 500, currency: "BTC", receiver_id: 1 });
            outboundUserAdapter.discountUserBtcBalance.mockRejectedValue(new Error('Discount failed'));

            await expect(withdrawService.virtualWithdraw(1, 500, 'BTC', 'traceId')).rejects.toThrow('Discount failed');

            expect(outboundWithdrawAdapter.deleteWithdrawById).toHaveBeenCalledWith(1, 'traceId');
        });
    });
});