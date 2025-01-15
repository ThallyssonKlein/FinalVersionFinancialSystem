import { Response, NextFunction } from 'express';
import CustomRequest from './CustomRequest';
import Loggable from '@shared/Loggable';

export default class AdminRouteMiddleware extends Loggable {
  constructor() {
    super('AdminRouteMiddleware');
    this.handle = this.handle.bind(this);
  }

  handle(req: CustomRequest, res: Response, next: NextFunction) {
    if (req.user.id !== 3) {
      this.log.error(`User ${req.user.id} tried to access admin route`, req.traceId);
      return res.status(403).json({ error: 'Forbidden' });
    }
    this.log.info(`User ${req.user.id} accessed admin route`, req.traceId);

    next();
  }
}