import OutboundUserAdapter from "@adapters/outbound/OutboundUserAdapter";
import OutboundUserRepositoryPort from "@ports/outbound/postgresql/user/OutboundUserRepositoryPort";
import { InternalError } from "@ports/inbound/http/api/v1/error";

describe("OutboundUserAdapter", () => {
    let outboundUserRepositoryPortMock: jest.Mocked<OutboundUserRepositoryPort>;
    let outboundUserAdapter: OutboundUserAdapter;

    beforeEach(() => {
        outboundUserRepositoryPortMock = {
            getBRLBalance: jest.fn(),
            getBTCBalance: jest.fn(),
            discountBRLBalance: jest.fn(),
            discountBTCBalance: jest.fn(),
        } as unknown as jest.Mocked<OutboundUserRepositoryPort>;

        outboundUserAdapter = new OutboundUserAdapter(outboundUserRepositoryPortMock);
    });

    describe("getUserBrlBalance", () => {
        it("should return the BRL balance if it exists", async () => {
            const userId = 1;
            const traceId = "trace-123";
            outboundUserRepositoryPortMock.getBRLBalance.mockResolvedValue({ brl_balance: 100 });

            const result = await outboundUserAdapter.getUserBrlBalance(userId, traceId);

            expect(result).toBe(100);
            expect(outboundUserRepositoryPortMock.getBRLBalance).toHaveBeenCalledWith(userId);
        });
    });

    describe("getUserBtcBalance", () => {
        it("should return the BTC balance if it exists", async () => {
            const userId = 1;
            const traceId = "trace-123";
            outboundUserRepositoryPortMock.getBTCBalance.mockResolvedValue({ btc_balance: 0.5 });

            const result = await outboundUserAdapter.getUserBtcBalance(userId, traceId);

            expect(result).toBe(0.5);
            expect(outboundUserRepositoryPortMock.getBTCBalance).toHaveBeenCalledWith(userId);
        });
    });

    describe("discountUserBrlBalance", () => {
        it("should call discountBRLBalance with the correct parameters", async () => {
            const userId = 1;
            const amount = 50;
            const traceId = "trace-123";

            await outboundUserAdapter.discountUserBrlBalance(userId, amount, traceId);

            expect(outboundUserRepositoryPortMock.discountBRLBalance).toHaveBeenCalledWith(userId, Number(amount));
        });
    });

    describe("discountUserBtcBalance", () => {
        it("should call discountBTCBalance with the correct parameters", async () => {
            const userId = 1;
            const amount = 0.1;
            const traceId = "trace-123";

            await outboundUserAdapter.discountUserBtcBalance(userId, amount, traceId);

            expect(outboundUserRepositoryPortMock.discountBTCBalance).toHaveBeenCalledWith(userId, amount);
        });
    });
});
