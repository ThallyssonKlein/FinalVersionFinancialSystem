import { create, ApiResponse } from 'apisauce';
import OutboundLNBitsApiPort from '@ports/outbound/http/OutboundLNBitsAPIPort';
import OutboundChargeDTO from '@ports/outbound/http/dto/OutboundChargeDTO';
import { InternalError } from '@ports/inbound/http/api/v1/error';

jest.mock('apisauce', () => {
    return {
        create: jest.fn().mockImplementation(() => ({
            post: jest.fn(),
        })),
    };
});

jest.mock('@config/index', () => {
    return jest.fn().mockImplementation(() => ({
        getConfig: jest.fn().mockReturnValue({
            lnbitsBaseURL: 'mocked-base-url',
            lnbitsApiKey: 'mocked-api-key',
            lnbitsWebhookPath: 'mocked-webhook-path',
        }),
    }));
});

describe('OutboundLNBitsApiPort', () => {
    let instance: OutboundLNBitsApiPort;
    let apiMock: jest.Mocked<ReturnType<typeof create>>;

    beforeEach(() => {
        jest.clearAllMocks();
        OutboundLNBitsApiPort['instance'] = null; // Reset instance

        apiMock = create({ baseURL: 'http://mocked-base-url' }) as jest.Mocked<ReturnType<typeof create>>;
        instance = OutboundLNBitsApiPort.getInstance();
        (instance as any).api = apiMock; // Inject the mocked API instance
    });

    describe('createCharge', () => {
        it('should create a charge successfully', async () => {
            const mockResponse: ApiResponse<any, any> = {
                ok: true,
                status: 200,
                data: {
                    payment_request: 'mocked-payment-request',
                    payment_hash: 'mocked-payment-hash',
                },
                headers: {},
                config: {},
                duration: 100,
                problem: null,
                originalError: null,
            };

            apiMock.post.mockResolvedValue(mockResponse);

            const result = await instance.createCharge(100, 'mocked-trace-id');

            expect(result).toBeInstanceOf(OutboundChargeDTO);
            expect(result.qrCode).toBe('mocked-payment-request');
            expect(result.paymentId).toBe('mocked-payment-hash');
        });

        it('should throw an InternalError if the API response is not ok', async () => {
            const mockResponse: ApiResponse<any, any> = {
                ok: false,
                status: 500,
                data: {},
                headers: {},
                config: {},
                duration: 100,
                problem: 'SERVER_ERROR',
                originalError: null,
            };

            apiMock.post.mockResolvedValue(mockResponse);

            await expect(instance.createCharge(100, 'mocked-trace-id')).rejects.toThrow(InternalError);
        });

        it('should throw an InternalError if the response data is missing', async () => {
            const mockResponse: ApiResponse<any, any> = {
                ok: true,
                status: 200,
                data: {},
                headers: {},
                config: {},
                duration: 100,
                problem: null,
                originalError: null,
            };

            apiMock.post.mockResolvedValue(mockResponse);

            await expect(instance.createCharge(100, 'mocked-trace-id')).rejects.toThrow(InternalError);
        });
    });

    describe('getInvoiceAmount', () => {
        it('should return the invoice amount successfully', async () => {
            const mockResponse: ApiResponse<any, any> = {
                ok: true,
                status: 200,
                data: {
                    amount_msat: 100000,
                },
                headers: {},
                config: {},
                duration: 100,
                problem: null,
                originalError: null,
            };

            apiMock.post.mockResolvedValue(mockResponse);

            const result = await instance.getInvoiceAmount('mocked-invoice', 'mocked-trace-id');

            expect(result).toBe(100000);
        });

        it('should throw an InternalError if the API response is not ok', async () => {
            const mockResponse: ApiResponse<any, any> = {
                ok: false,
                status: 500,
                data: {},
                headers: {},
                config: {},
                duration: 100,
                problem: 'SERVER_ERROR',
                originalError: null,
            };

            apiMock.post.mockResolvedValue(mockResponse);

            await expect(instance.getInvoiceAmount('mocked-invoice', 'mocked-trace-id')).rejects.toThrow(InternalError);
        });

        it('should throw an InternalError if the response data is missing', async () => {
            const mockResponse: ApiResponse<any, any> = {
                ok: true,
                status: 200,
                data: {},
                headers: {},
                config: {},
                duration: 100,
                problem: null,
                originalError: null,
            };

            apiMock.post.mockResolvedValue(mockResponse);

            await expect(instance.getInvoiceAmount('mocked-invoice', 'mocked-trace-id')).rejects.toThrow(InternalError);
        });
    });

    describe('doBtcWithdraw', () => {
        it('should withdraw BTC successfully', async () => {
            const mockResponse: ApiResponse<any, any> = {
                ok: true,
                status: 200,
                data: {},
                headers: {},
                config: {},
                duration: 100,
                problem: null,
                originalError: null,
            };

            apiMock.post.mockResolvedValue(mockResponse);

            await instance.doBtcWithdraw('mocked-invoice', 'mocked-trace-id');

            expect(apiMock.post).toHaveBeenCalledWith('/payments', {
                bolt11: 'mocked-invoice',
                out: true,
            }, {
                headers: {
                    'X-API-KEY': 'mocked-api-key',
                },
            });
        });

        it('should throw an InternalError if the API response is not ok', async () => {
            const mockResponse: ApiResponse<any, any> = {
                ok: false,
                status: 500,
                data: {},
                headers: {},
                config: {},
                duration: 100,
                problem: 'SERVER_ERROR',
                originalError: null,
            };

            apiMock.post.mockResolvedValue(mockResponse);

            await expect(instance.doBtcWithdraw('mocked-invoice', 'mocked-trace-id')).rejects.toThrow(InternalError);
        });
    });
});