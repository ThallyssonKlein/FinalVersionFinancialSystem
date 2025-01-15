import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import ValidateSchema from "@ports/inbound/http/api/v1/middleware/ValidateSchemaMiddleware";

describe("validateSchema Middleware", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;
  let schema: Joi.ObjectSchema;

  beforeEach(() => {
    req = {
      body: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    schema = Joi.object({
      name: Joi.string().required(),
      age: Joi.number().required()
    });
  });

  it("should call next if schema is valid", () => {
    req.body = { name: "John", age: 30 };

    const middleware = new ValidateSchema(schema);
    middleware.handle(req as Request, res as Response, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it("should return 400 if schema is invalid", () => {
    req.body = { name: "John" }; // Missing age

    const middleware = new ValidateSchema(schema);
    middleware.handle(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: expect.any(String) });
    expect(next).not.toHaveBeenCalled();
  });
});