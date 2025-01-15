import { Response, NextFunction } from "express";
import Joi from "joi";
import CustomRequest from "./CustomRequest";
import Loggable from "@shared/Loggable";

export enum ESource {
  BODY = "body",
  QUERY = "query",
  PARAMS = "params"
}

export default class ValidateSchemaMiddleware extends Loggable {
  private schema: Joi.ObjectSchema;
  private source: ESource;

  constructor(schema: Joi.ObjectSchema, source: ESource = ESource.BODY) {
    super('ValidateSchemaMiddleware');
    this.schema = schema;
    this.source = source;
    this.handle = this.handle.bind(this);
  }

  handle(req: CustomRequest, res: Response, next: NextFunction) {
    let src;
    switch (this.source) {
      case ESource.BODY:
        src = req.body;
        break;
      case ESource.QUERY:
        src = req.query;
        break;
      case ESource.PARAMS:
        src = req.params;
        break;
      default:
        src = req.body;
    }
    this.log.info(`Validating ${this.source}...`, req.traceId);
    const { error } = this.schema.validate(src);
    if (error) {
      this.log.error(`Validation error: ${error.details[0].message}`, req.traceId);
      return res.status(400).json({ error: error.details[0].message });
    }
    next();
  }
}