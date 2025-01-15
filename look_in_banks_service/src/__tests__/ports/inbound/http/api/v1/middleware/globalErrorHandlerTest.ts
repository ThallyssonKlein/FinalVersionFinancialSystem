import GlobalErrorHandlerMiddleware from '@ports/inbound/http/api/v1/middleware/GlobalErrorHandlerMiddleware';
import { Response, NextFunction } from 'express';
import { NotFoundError } from '@ports/inbound/http/api/v1/error';
import CustomRequest from "@ports/inbound/http/api/v1/middleware/CustomRequest";

describe('GlobalErrorHandler', () => {
  let globalErrorHandler: GlobalErrorHandlerMiddleware;
  let req: Partial<CustomRequest>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    globalErrorHandler = new GlobalErrorHandlerMiddleware();
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    next = jest.fn();
  });

  it('should handle HttpError correctly', () => {
    const error = new NotFoundError('Not Found');

    globalErrorHandler.handle(error, req as CustomRequest, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith({
      message: 'Not Found',
      name: 'NotFoundError',
      status: 404,
    });
  });

  it('should handle generic errors correctly', () => {
    const error = new Error('Something went wrong');

    globalErrorHandler.handle(error, req as CustomRequest, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      message: 'Internal Server Error',
      name: 'Error',
      status: 500,
    });
  });

  it('should handle unknown errors correctly', () => {
    const error = { message: 'Unknown error' };

    globalErrorHandler.handle(error, req as CustomRequest, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      message: 'Internal Server Error',
      name: 'Error',
      status: 500,
    });
  });
});