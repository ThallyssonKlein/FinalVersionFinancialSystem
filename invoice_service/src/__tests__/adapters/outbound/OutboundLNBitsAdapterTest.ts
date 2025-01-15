import OutboundLNBitsAdapter from '@adapters/outbound/OutboundLNBitsAdapter';
import OutboundLNBitsApiPort from '@ports/outbound/http/OutboundLNBitsAPIPort';

jest.mock('@ports/outbound/http/OutboundLNBitsAPIPort');

describe('OutboundLNBitsAdapter', () => {
    let outboundLNBitsApiPort: jest.Mocked<OutboundLNBitsApiPort>;
    let adapter: OutboundLNBitsAdapter;

    beforeEach(() => {
        outboundLNBitsApiPort = {
            doBtcWithdraw: jest.fn(),
            getInvoiceAmount: jest.fn(),
        } as unknown as jest.Mocked<OutboundLNBitsApiPort>;
        adapter = new OutboundLNBitsAdapter(outboundLNBitsApiPort);
    });

    describe('doBtcWithdraw', () => {
        it('should call doBtcWithdraw on outboundLNBitsApiPort with correct parameters', async () => {
            const invoice = 'test-invoice';
            const traceId = 'test-trace-id';

            await adapter.doBtcWithdraw(invoice, traceId);

            expect(outboundLNBitsApiPort.doBtcWithdraw).toHaveBeenCalledWith(invoice, traceId);
        });
    });

    describe('getInvoiceAmount', () => {
        it('should call getInvoiceAmount on outboundLNBitsApiPort with correct parameters', async () => {
            const invoice = 'test-invoice';
            const traceId = 'test-trace-id';
            const amount = 100;
            outboundLNBitsApiPort.getInvoiceAmount.mockResolvedValue(amount);

            const result = await adapter.getInvoiceAmount(invoice, traceId);

            expect(outboundLNBitsApiPort.getInvoiceAmount).toHaveBeenCalledWith(invoice, traceId);
            expect(result).toBe(amount);
        });
    });
});