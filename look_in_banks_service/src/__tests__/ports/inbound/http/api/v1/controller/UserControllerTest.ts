import { Response, NextFunction } from 'express';
import UserController from '@ports/inbound/http/api/v1/controller/UserController'; // Ajuste o caminho conforme necessário
import CustomRequest from '@ports/inbound/http/api/v1/middleware/CustomRequest';
import { BadRequestError } from '@ports/inbound/http/api/v1/error';

jest.mock('@adapters/inbound/http/api/v1/InboundUserAdapter');

describe('UserController', () => {
  let req: Partial<CustomRequest>;
  let res: Partial<Response>;
  let next: NextFunction;
  let inboundUserAdapter: any;
  let userController: any;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      params: {},
      body: {},
      traceId: 'fake-trace-id',
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn()
    };
    next = jest.fn();
    inboundUserAdapter = {
      login: jest.fn(),
      logicalDelete: jest.fn(),
      getBalances: jest.fn(),
      updateUserById: jest.fn(),
      register: jest.fn(),
      removePhoto: jest.fn(),
      pixWithdraw: jest.fn(),
      btcWithdraw: jest.fn(),
      virtualWithdraw: jest.fn(),
      getAllPaginated: jest.fn(),
    };
    userController = new UserController(inboundUserAdapter);
  });

  describe('login', () => {
    it('should login successfully', async () => {
      const mockedResponse = {
        token: 'fake-jwt-token',
        user: { id: 1, username: 'test', email: 'test@example.com', is_deleted: false },
      };
      inboundUserAdapter.login.mockResolvedValue(mockedResponse);

      req.body = { username: 'test@example.com', password: 'password123' };

      await userController.login(req as CustomRequest, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockedResponse);
      expect(inboundUserAdapter.login).toHaveBeenCalledWith('test@example.com', 'password123', 'fake-trace-id');
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next with error on login failure', async () => {
      const mockError = new Error('Login failed');
      inboundUserAdapter.login.mockRejectedValue(mockError);

      req.body = { username: 'test@example.com', password: 'password123' };

      await userController.login(req as CustomRequest, res as Response, next);

      expect(next).toHaveBeenCalledWith(mockError);
    });
  });

  describe('register', () => {
    it('should register user successfully', async () => {
      const mockedResponse = {
        id: 1,
        username: 'newUser',
        email: 'new@example.com',
        is_deleted: false,
      };
      inboundUserAdapter.register.mockResolvedValue(mockedResponse);
    
      // Agora adicionamos o campo email, já que não estamos passando token
      req.body = { username: 'newUser', email: 'new@example.com', password: 'password123' };
      req.header = jest.fn().mockReturnValue('token');
    
      await userController.register(req as CustomRequest, res as Response, next);
    
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockedResponse);
      expect(inboundUserAdapter.register).toHaveBeenCalledWith(
        expect.objectContaining({ username: 'newuser', email: 'new@example.com', password: 'password123' }),
        'fake-trace-id'
      );
      expect(next).not.toHaveBeenCalled();
    });    

    it('should call next with error on registration failure', async () => {
      const mockError = new Error('Registration failed');
      inboundUserAdapter.register.mockRejectedValue(mockError);

      req.body = { username: 'newUser', password: 'password123' };
      req.header = jest.fn().mockReturnValue("token");

      await userController.register(req as CustomRequest, res as Response, next);

      expect(next).toHaveBeenCalledWith(mockError);
    });
  });

  describe('update', () => {
    it('should update user successfully', async () => {
      const mockedResponse = {
        id: 1,
        username: 'updatedUser',
        email: 'updated@example.com',
        is_deleted: false,
      };
      inboundUserAdapter.updateUserById.mockResolvedValue(mockedResponse);
  
      req.params = { userId: '1' };
      req.body = { body: JSON.stringify({ username: 'updatedUser', password: 'newPassword123' }) };
      req.file = { ...req.file, path: 'path/to/file' };
  
      await userController.update(req as CustomRequest, res as Response, next);
  
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.json).toHaveBeenCalledWith(mockedResponse);
      expect(inboundUserAdapter.updateUserById).toHaveBeenCalledWith(
        1,
        "fake-trace-id",
        {
          username: 'updatedUser',
          password: 'newPassword123'
        },
        { path: 'path/to/file' }
      );
    });
  
    it('should handle errors', async () => {
      const error = new Error('Update failed');
      inboundUserAdapter.updateUserById.mockRejectedValue(error);
  
      req.params = { userId: '1' };
      req.body = { body: JSON.stringify({ username: 'updatedUser', password: 'newPassword123' }) };
      req.file = { ...req.file, path: 'path/to/file' };
  
      await userController.update(req as CustomRequest, res as Response, next);
  
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('delete', () => {
    it('should delete user successfully', async () => {
      inboundUserAdapter.logicalDelete.mockResolvedValue(Promise.resolve());

      req.params = { userId: '123' };

      await userController.delete(req as CustomRequest, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledTimes(1);
      expect(inboundUserAdapter.logicalDelete).toHaveBeenCalledWith(123, 'fake-trace-id');
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next with error on delete failure', async () => {
      const mockError = new Error('Delete failed');
      inboundUserAdapter.logicalDelete.mockRejectedValue(mockError);

      req.params = { userId: '123' };

      await userController.delete(req as CustomRequest, res as Response, next);

      expect(next).toHaveBeenCalledWith(mockError);
    });
  });

  describe('getBalances', () => {
    it('should return balances with status 200', async () => {
      const mockBalances = { brlBalance: 1000, btcBalance: 0.5 };
      inboundUserAdapter.getBalances.mockResolvedValue(mockBalances);
      req.params = { userId: '123' };

      await userController.getBalances(req as CustomRequest, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockBalances);
      expect(inboundUserAdapter.getBalances).toHaveBeenCalledWith(123, 'fake-trace-id');
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next with error on failure', async () => {
      const mockError = new Error('Failed to get balances');
      inboundUserAdapter.getBalances.mockRejectedValue(mockError);
      req.params = { userId: '123' };

      await userController.getBalances(req as CustomRequest, res as Response, next);

      expect(next).toHaveBeenCalledWith(mockError);
    });
  });

  describe('removePhoto', () => {
    it("should remove the user photo successfully", async () => {
      inboundUserAdapter.removePhoto.mockResolvedValue({});
      req.params = { userId: "1" };
  
      await userController.removePhoto(req, res, next);
  
      expect(inboundUserAdapter.removePhoto).toHaveBeenCalledWith(1, "fake-trace-id");
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.json).toHaveBeenCalledWith({});
    });
  
    it("should handle errors", async () => {
      const error = new Error("Test error");
      inboundUserAdapter.removePhoto.mockRejectedValue(error);

      req.params.userId = "1";
  
      await userController.removePhoto(req, res, next);
  
      expect(next).toHaveBeenCalledWith(error);
    });  
  })

  describe('withdraw', () => {
    it('should withdraw BRL successfully', async () => {
      const mockedResponse = { success: true };
      inboundUserAdapter.pixWithdraw.mockResolvedValue(mockedResponse);
  
      req.params = { userId: '1' };
      req.body = { amount: "100.00", pixKey: 'test-pix-key', currency: 'BRL' };
  
      await userController.withdraw(req as CustomRequest, res as Response, next);
  
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockedResponse);
      expect(inboundUserAdapter.pixWithdraw).toHaveBeenCalledWith(1, "100.00", 'test-pix-key', 'fake-trace-id');
      expect(next).not.toHaveBeenCalled();
    });
  
    it('should withdraw BTC successfully', async () => {
      const mockedResponse = { success: true };
      inboundUserAdapter.btcWithdraw.mockResolvedValue(mockedResponse);
  
      req.params = { userId: '1' };
      req.body = { amount: 0.01, invoice: 'test-invoice', currency: 'BTC' };
  
      await userController.withdraw(req as CustomRequest, res as Response, next);
  
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockedResponse);
      expect(inboundUserAdapter.btcWithdraw).toHaveBeenCalledWith(1, 'test-invoice', 'fake-trace-id');
      expect(next).not.toHaveBeenCalled();
    });
  
    it('should throw BadRequestError if neither pixKey nor invoice is provided', async () => {
      req.params = { userId: '1' };
      req.body = { amount: 100, currency: 'BRL' };
  
      await userController.withdraw(req as CustomRequest, res as Response, next);
  
      expect(next).toHaveBeenCalledWith(new BadRequestError('You must provide a pixKey or a invoice to withdraw'));
    });
  
    it('should call next with error on withdraw failure', async () => {
      const mockError = new Error('Withdraw failed');
      inboundUserAdapter.pixWithdraw.mockRejectedValue(mockError);
  
      req.params = { userId: '1' };
      req.body = { amount: "100.00", pixKey: 'test-pix-key', currency: 'BRL' };
  
      await userController.withdraw(req as CustomRequest, res as Response, next);
  
      expect(next).toHaveBeenCalledWith(mockError);
    });
  });

  describe('virtualWithdraw', () => {
    it('should withdraw virtual currency successfully', async () => {
      const mockedResponse = { success: true };
      inboundUserAdapter.virtualWithdraw.mockResolvedValue(mockedResponse);
  
      req.params = { userId: '1' };
      req.body = { amount: 100, currency: 'USDT' };
  
      await userController.virtualWithdraw(req as CustomRequest, res as Response, next);
  
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockedResponse);
      expect(inboundUserAdapter.virtualWithdraw).toHaveBeenCalledWith(1, 100, 'USDT', 'fake-trace-id');
      expect(next).not.toHaveBeenCalled();
    });
  
    it('should call next with error on withdraw failure', async () => {
      const mockError = new Error('Withdraw failed');
      inboundUserAdapter.virtualWithdraw.mockRejectedValue(mockError);
  
      req.params = { userId: '1' };
      req.body = { amount: 100, currency: 'USDT' };
  
      await userController.virtualWithdraw(req as CustomRequest, res as Response, next);
  
      expect(next).toHaveBeenCalledWith(mockError);
    });
  });

  describe('getAllPaginated', () => {
    it('should return paginated users with status 200', async () => {
      const mockUsers = [{ id: 1, username: 'user1' }, { id: 2, username: 'user2' }];
      inboundUserAdapter.getAllPaginated.mockResolvedValue(mockUsers);
      req.query = { page: '1', limit: '10' };

      await userController.getAllPaginated(req as CustomRequest, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockUsers);
      expect(inboundUserAdapter.getAllPaginated).toHaveBeenCalledWith(1, 10, 'fake-trace-id');
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle errors', async () => {
      const mockError = new Error('Failed to get paginated users');
      inboundUserAdapter.getAllPaginated.mockRejectedValue(mockError);
      req.query = { page: '1', limit: '10' };

      await userController.getAllPaginated(req as CustomRequest, res as Response, next);

      expect(next).toHaveBeenCalledWith(mockError);
    });
  });
});