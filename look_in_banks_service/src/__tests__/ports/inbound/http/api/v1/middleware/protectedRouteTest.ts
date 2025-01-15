import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import ProtectedRouteMiddleware from '@ports/inbound/http/api/v1/middleware/ProtectedRouteMiddleware'; // ajuste o caminho conforme necessário

jest.mock('jsonwebtoken');

describe('protectedRoute', () => {
  let req: Partial<Request> & { user?: any };
  let res: Partial<Response>;
  let next: jest.Mock<NextFunction>;

  beforeEach(() => {
    req = {
      header: jest.fn(),
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  it('should return 401 if token is invalid', () => {
    (req.header as jest.Mock).mockReturnValue('invalid-token');
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error('Invalid token');
    });

    const protectedRoute = new ProtectedRouteMiddleware();
    protectedRoute.handle(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token' });
  });

  it('should call next if token is valid', () => {
    const verifiedUser = { id: 'user-id' };
    (req.header as jest.Mock).mockReturnValue('valid-token');
    (jwt.verify as jest.Mock).mockReturnValue(verifiedUser);

    req.user = verifiedUser; // Adiciona a propriedade user ao req

    const protectedRoute = new ProtectedRouteMiddleware();
    protectedRoute.handle(req as Request, res as Response, next);

    expect(req.user).toEqual(verifiedUser);
    expect(next).toHaveBeenCalled();
  });
});