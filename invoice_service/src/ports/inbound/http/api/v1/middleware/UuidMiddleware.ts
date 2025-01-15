import { Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import CustomRequest from './CustomRequest';
import Loggable from '@shared/Loggable';

export default class UuidMiddleware extends Loggable {
  constructor() {
    super('UuidMiddleware');
    this.handle = this.handle.bind(this);
  }

  handle(req: CustomRequest, res: Response, next: NextFunction) {
    req.traceId = uuidv4();
    this.log.info(`Request ${req.traceId} received`, req.traceId);
    next();
  }
}