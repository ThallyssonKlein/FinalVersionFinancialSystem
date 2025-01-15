import { create, ApiResponse } from 'apisauce'; // Adicionando ApiResponse
import { AxiosError } from 'axios';
import fs from 'fs';
import OutboundEfiBankApiPort from '@ports/outbound/http/OutboundEfiBankApiPort';
import OutboundChargeDTO from '@ports/outbound/http/dto/OutboundChargeDTO';
import { InternalError } from '@ports/inbound/http/api/v1/error';

jest.mock('fs', () => ({
    readFileSync: jest.fn().mockReturnValue(Buffer.from('mocked-p12-buffer')),
}));
// Mock da implementação do apisauce
jest.mock('apisauce', () => {
    return {
        create: jest.fn().mockImplementation(() => ({
            post: jest.fn().mockImplementation((url) => {
                // Mocka a chamada para obter o token
                if (url === '/oauth/token') {
                    return Promise.resolve({
                        ok: true,
                        data: {
                            access_token: 'mocked-access-token',
                            expires_in: 3600,
                        },
                    });
                }
                // Mocka outras chamadas, se necessário
                return Promise.resolve({ ok: true });
            }),
            put: jest.fn(),
        })),
    };
});
jest.mock('@config/index', () => {
    return jest.fn().mockImplementation(() => ({
        getConfig: jest.fn().mockReturnValue({
            efiBankCertPath: 'mocked-cert-path',
            efiBankBaseURL: 'mocked-base-url',
            efiBankClientId: 'mocked-client-id',
            efiBankClientSecret: 'mocked-client-secret',
        }),
    }));
})

describe('OutboundEfiBankApiPort', () => {
    let instance: OutboundEfiBankApiPort;
    let apiMock: jest.Mocked<ReturnType<typeof create>>;

    beforeEach(() => {
        jest.clearAllMocks();
        OutboundEfiBankApiPort.resetInstance(); // Reseta a instância para garantir que sempre seja uma nova
    
        // Mock para fs.readFileSync
        (fs.readFileSync as jest.Mock).mockReturnValue(Buffer.from('mocked-p12-buffer'));
    
        // Inicializa o mock da API com configuração simulada
        apiMock = create({ baseURL: 'http://mocked-base-url' }) as jest.Mocked<ReturnType<typeof create>>;
    
        // Define a instância para ser testada
        instance = OutboundEfiBankApiPort.getInstance();
        (instance as any).api = apiMock; // Inject the mocked API instance
    });    

    afterEach(() => {
        if (instance && instance['refreshTokenTimeout']) {
            clearTimeout(instance['refreshTokenTimeout']);
        }
    });    

    describe('createCharge', () => {
        it('should create a charge successfully', async () => {
            const mockResponse: ApiResponse<any, any> = {
                ok: true,
                status: 200,
                data: {
                    pixCopiaECola: 'mocked-pix-copia-e-cola',
                    txid: 'mocked-txid',
                },
                headers: {},
                config: {},
                duration: 100,
                problem: null,
                originalError: null,
            };

            apiMock.post.mockResolvedValue(mockResponse);

            const result = await instance.createCharge('100.00', 'mocked-trace-id');

            expect(result).toBeInstanceOf(OutboundChargeDTO);
            expect(result.qrCode).toBe('mocked-pix-copia-e-cola');
            expect(result.paymentId).toBe('mocked-txid');
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
                originalError: {
                    isAxiosError: true,
                    toJSON: () => ({}),
                    message: 'Server error',
                    name: 'AxiosError',
                    config: {},
                    response: undefined,
                } as AxiosError,
            };

            apiMock.post.mockResolvedValue(mockResponse);

            await expect(instance.createCharge('100.00', 'mocked-trace-id')).rejects.toThrow(InternalError);
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

            await expect(instance.createCharge('100.00', 'mocked-trace-id')).rejects.toThrow(InternalError);
        });
    });
});
