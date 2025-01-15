import OutboundEfiBankAPIAdapter from '@adapters/outbound/OutboundEfiBankAPIAdapter';
import OutboundEfiBankApiPort from '@ports/outbound/http/OutboundEfiBankApiPort';

describe('OutboundEfiBankAPIAdapter', () => {
    let outboundEfiBankApiPort: jest.Mocked<OutboundEfiBankApiPort>;
    let adapter: OutboundEfiBankAPIAdapter;

    beforeEach(() => {
        outboundEfiBankApiPort = {
            doPixWithdraw: jest.fn()
        } as unknown as jest.Mocked<OutboundEfiBankApiPort>;

        adapter = new OutboundEfiBankAPIAdapter(outboundEfiBankApiPort);
    });

    it('should call doPixWithdraw with correct parameters', async () => {
        const amount = '100.00';
        const pixKey = 'test-pix-key';
        const withdrawId = 123;
        const traceId = 'trace-id-123';

        await adapter.doPixWithdraw(amount, pixKey, withdrawId, traceId);

        expect(outboundEfiBankApiPort.doPixWithdraw).toHaveBeenCalledWith(amount, pixKey, withdrawId, traceId);
    });

    it('should handle errors thrown by doPixWithdraw', async () => {
        const amount = '100.00';
        const pixKey = 'test-pix-key';
        const withdrawId = 123;
        const traceId = 'trace-id-123';
        const error = new Error('Test error');

        outboundEfiBankApiPort.doPixWithdraw.mockRejectedValueOnce(error);

        await expect(adapter.doPixWithdraw(amount, pixKey, withdrawId, traceId)).rejects.toThrow('Test error');
    });
});