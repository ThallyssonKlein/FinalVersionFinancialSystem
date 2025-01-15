import { BadRequestError, ForbiddenError, NotFoundError } from "@ports/inbound/http/api/v1/error";
import OutboundUserRepositoryPort from "@ports/outbound/postgresql/user/OutboundUserRepositoryPort";
import InboundUserAdapter from "@adapters/inbound/http/api/v1/InboundUserAdapter";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { IBalances } from "@ports/outbound/postgresql/user/IUserDAO";
import WithdrawService from "@domain/user/service/WithdrawService";

import InsufficientBalanceError from "@domain/user/error/InsufficientBalanceError";
import PaginatedResultsDTO from "@ports/inbound/http/api/v1/dto/PaginatedResultsDTO";
import OutboundLocalStoragePort from "@ports/outbound/storage/OutboundLocalStoragePort";

jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('@ports/outbound/postgresql/user/OutboundUserRepositoryPort');

describe('InboundUserAdapter', () => {
    let inboundUserAdapter: InboundUserAdapter;
    let outboundUserRepositoryPort: jest.Mocked<OutboundUserRepositoryPort>;
    let withdrawService: jest.Mocked<WithdrawService>;
    let outboundLocalStoragePort: jest.Mocked<OutboundLocalStoragePort>;

    beforeEach(() => {
        jest.clearAllMocks()
        jest.resetAllMocks()

        outboundUserRepositoryPort = {
            findUserById: jest.fn(),
            findUserByUsername: jest.fn(),
            delete: jest.fn(),
            getBalances: jest.fn(),
            logicalDelete: jest.fn(),
            registerUser: jest.fn(),
            updateUser: jest.fn(),
            removePhoto: jest.fn(),
            getBRLBalance: jest.fn(),
            discountBRLBalance: jest.fn(),
            setUserBRLBalance: jest.fn(),
            getBTCBalance: jest.fn(),
            discountBTCBalance: jest.fn(),
            getAllPaginated: jest.fn(),
            findUserByUsernameWithAllFields: jest.fn(),
            countAllUsers: jest.fn(),
            getUserPhoto: jest.fn(),
            findUserByUsernameOrEmail : jest.fn(),
            findUserByEmail: jest.fn()
        } as unknown as jest.Mocked<OutboundUserRepositoryPort>;
        withdrawService = {
            pixWithdraw: jest.fn(),
            btcWithdraw: jest.fn(),
            virtualWithdraw: jest.fn()
        } as unknown as jest.Mocked<WithdrawService>;
        outboundLocalStoragePort = {
            uploadProfilePicture: jest.fn(),
            deleteProfilePicture: jest.fn()
        } as unknown as jest.Mocked<OutboundLocalStoragePort>;

        inboundUserAdapter = new InboundUserAdapter(outboundUserRepositoryPort, withdrawService, outboundLocalStoragePort);
    });

    describe('register', () => {
        it('should register user with username and password', async () => {
            const mocks = { username: 'testUser', password: 'testPassword', traceId: 'testTraceId', hashedPassword: 'hashedPassword' };

            (bcrypt.hash as jest.Mock).mockResolvedValue(mocks.hashedPassword)
            outboundUserRepositoryPort.findUserByUsernameOrEmail.mockResolvedValue([]);
            outboundUserRepositoryPort.findUserByUsernameWithAllFields.mockResolvedValue([mocks]);

            await inboundUserAdapter.register({
                username: mocks.username,
                password: mocks.password
            }, mocks.traceId);

            expect(bcrypt.hash).toHaveBeenCalledWith(mocks.password, 10);
            expect(outboundUserRepositoryPort.registerUser).toHaveBeenCalledWith(
                {
                    username: mocks.username,
                    password: mocks.hashedPassword
                }
            )
        })
    });

    describe('update', () => {
        describe('when user exists', () => {
            it('should update username only', async () => {
                const mockCurrentUser = { id: 1, username: 'currentTestName', password: 'currentHashedPassword', is_deleted: false, email: 'test@test.com', btc_balance: 0.0000, brl_balance: 0, photo_url: 'photo_url'  }; 
                const fieldsToUpdate: { username?: string, password?: string } = { username: "newTestName", password: undefined }
                outboundUserRepositoryPort.findUserById.mockResolvedValue([mockCurrentUser]);
                outboundUserRepositoryPort.findUserByUsername.mockResolvedValue([]);
                outboundUserRepositoryPort.findUserByEmail.mockResolvedValue([]);
    
                await inboundUserAdapter.updateUserById(mockCurrentUser.id, "testTraceId", {
                    username: fieldsToUpdate.username,
                    password: fieldsToUpdate.password
                })
    
                expect(bcrypt.hash).not.toHaveBeenCalled()
                expect(outboundUserRepositoryPort.updateUser).toHaveBeenCalledWith(mockCurrentUser.id, fieldsToUpdate, undefined)
            })
        })
    })

    describe('login', () => {
        it('should return a JWT token for valid username and password', async () => {
            const mockUser = { id: 1, username: 'testuser', password: 'hashedpassword', is_deleted: false, email: 'test@test.com', btc_balance: 0.0000, brl_balance: 0, photo_url: 'photo_url' };
            outboundUserRepositoryPort.findUserByUsernameWithAllFields.mockResolvedValue([mockUser]);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);
            (jwt.sign as jest.Mock).mockReturnValue('mockToken');

            const result = await inboundUserAdapter.login('testuser', 'password', "traceId");

            expect(outboundUserRepositoryPort.findUserByUsernameWithAllFields).toHaveBeenCalledWith('testuser');
            expect(bcrypt.compare).toHaveBeenCalledWith('password', 'hashedpassword');
            expect(jwt.sign).toHaveBeenCalledWith({ id: 1 }, process.env.JWT_SECRET);
            expect(result.token).toBe('mockToken');
            expect(result.user).toEqual({
                id: 1,
                username: 'testuser',
                email: 'test@test.com',
                isDeleted: false,
                btcBalance: 0.0000,
                brlBalance: 0,
                photoUrl: 'photo_url'
            });
        });

        it('should throw NotFoundError if username does not exist', async () => {
            outboundUserRepositoryPort.findUserByUsernameWithAllFields.mockResolvedValue([]);

            await expect(inboundUserAdapter.login('nonexistentuser', 'password', "traceId"))
                .rejects
                .toThrow(NotFoundError);

            expect(outboundUserRepositoryPort.findUserByUsernameWithAllFields).toHaveBeenCalledWith('nonexistentuser');
        });

        it('should throw ForbiddenError if password is invalid', async () => {
            const mockUser = { id: 1, username: 'testuser', password: 'hashedpassword', is_deleted: false, email: 'test@test.com', btc_balance: 0.0000, brl_balance: 0, photo_url: 'photo_url' };
            outboundUserRepositoryPort.findUserByUsernameWithAllFields.mockResolvedValue([mockUser]);
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            await expect(inboundUserAdapter.login('testuser', 'wrongpassword', "traceId"))
                .rejects
                .toThrow(ForbiddenError);

            expect(outboundUserRepositoryPort.findUserByUsernameWithAllFields).toHaveBeenCalledWith('testuser');
            expect(bcrypt.compare).toHaveBeenCalledWith('wrongpassword', 'hashedpassword');
        });
    });

    it('should return balances for a given userId', async () => {
        const mockBalance = { brl_balance: 0, btc_balance: 0.0000 } as IBalances;
        (outboundUserRepositoryPort.getBalances as jest.Mock).mockResolvedValue([mockBalance]);

        const result = await inboundUserAdapter.getBalances(1, "traceId");

        expect(outboundUserRepositoryPort.getBalances).toHaveBeenCalledWith(1);
        expect(result).toStrictEqual(
            {
                brlBalance: 0,
                btcBalance: 0.0000
            }
        );    
    });

    it('should logically delete a user for a given userId', async () => {
        await inboundUserAdapter.logicalDelete(1, "traceId");

        expect(outboundUserRepositoryPort.logicalDelete).toHaveBeenCalledWith(1);
    });

    describe('removePhoto', () => {
        it('should call removePhoto on outboundUserRepositoryPort with correct parameters', async () => {
            const userId = 123;
            const traceId = 'trace-123';

            (outboundUserRepositoryPort.getUserPhoto as jest.Mock).mockResolvedValue([{photo_url: 'photo-url/photo.jpg'}]);

            await inboundUserAdapter.removePhoto(userId, traceId);

            expect(outboundUserRepositoryPort.removePhoto).toHaveBeenCalledWith(userId);
        });
    });

    describe('btcWithdraw', () => {
        it('should call btcWithdraw on withdrawService with correct parameters', async () => {
            const userId = 1;
            const invoice = 'testInvoice';
            const traceId = 'testTraceId';

            await inboundUserAdapter.btcWithdraw(userId, invoice, traceId);

            expect(withdrawService.btcWithdraw).toHaveBeenCalledWith(userId, invoice, traceId);
        });

        it('should throw BadRequestError if InsufficientBalanceError is thrown', async () => {
            const userId = 1;
            const invoice = 'testInvoice';
            const traceId = 'testTraceId';

            (withdrawService.btcWithdraw as jest.Mock).mockRejectedValue(new InsufficientBalanceError());

            await expect(inboundUserAdapter.btcWithdraw(userId, invoice, traceId))
                .rejects
                .toThrow(BadRequestError);
        });
    });

    describe('pixWithdraw', () => {
        it('should call pixWithdraw on withdrawService with correct parameters', async () => {
            const userId = 1;
            const amount = '100';
            const pixKey = 'testPixKey';
            const traceId = 'testTraceId';

            await inboundUserAdapter.pixWithdraw(userId, amount, pixKey, traceId);

            expect(withdrawService.pixWithdraw).toHaveBeenCalledWith(userId, amount, pixKey, traceId);
        });

        it('should throw BadRequestError if InsufficientBalanceError is thrown', async () => {
            const userId = 1;
            const amount = '100';
            const pixKey = 'testPixKey';
            const traceId = 'testTraceId';

            (withdrawService.pixWithdraw as jest.Mock).mockRejectedValue(new InsufficientBalanceError());

            await expect(inboundUserAdapter.pixWithdraw(userId, amount, pixKey, traceId))
                .rejects
                .toThrow(BadRequestError);
        });
    });

    describe('virtualWithdraw', () => {
        it('should call virtualWithdraw on withdrawService with correct parameters', async () => {
            const userId = 1;
            const amount = '100';
            const currency = 'BRL';
            const traceId = 'testTraceId';

            await inboundUserAdapter.virtualWithdraw(userId, amount, currency, traceId);

            expect(withdrawService.virtualWithdraw).toHaveBeenCalledWith(userId, Number(amount), currency, traceId);
        });
    });

    describe('getAllPaginated', () => {
        it('should return paginated users', async () => {
            const mockUsers = [
                { id: 1, username: 'user1', photo_url: 'url1' },
                { id: 2, username: 'user2', photo_url: 'url2' }
            ];
            outboundUserRepositoryPort.getAllPaginated.mockResolvedValue(mockUsers);
            outboundUserRepositoryPort.countAllUsers.mockResolvedValue(mockUsers.length);

            const result = await inboundUserAdapter.getAllPaginated(1, 10, 'traceId');

            expect(outboundUserRepositoryPort.getAllPaginated).toHaveBeenCalledWith(1, 10);
            expect(result).toEqual(new PaginatedResultsDTO(mockUsers.map(user => ({ id: user.id, username: user.username, photoURL: user.photo_url })), mockUsers.length, 1));
        });

        it('should return an empty array if no users are found', async () => {
            outboundUserRepositoryPort.getAllPaginated.mockResolvedValue([]);
            outboundUserRepositoryPort.countAllUsers.mockResolvedValue(0);

            const result = await inboundUserAdapter.getAllPaginated(1, 10, 'traceId');

            expect(outboundUserRepositoryPort.getAllPaginated).toHaveBeenCalledWith(1, 10);
            expect(result).toBeInstanceOf(PaginatedResultsDTO);
            expect(result.results).toEqual([]);
            expect(result.totalPages).toBe(0);
        });
    });
});