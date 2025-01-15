import { Response, NextFunction } from 'express';
import CustomRequest from './CustomRequest';
import Loggable from '@shared/Loggable';

export default class ResourceOwnerOrAdminMiddleware extends Loggable {
  constructor() {
    super('ResourceOwnerOrAdminMiddleware');
    this.handle = this.handle.bind(this);
  }

  handle(req: CustomRequest, res: Response, next: NextFunction) {
    if ((Number(req.params.userId) !== req.user.id) && req.user.id !== 3) {
        this.log.error(`User ${req.user.id} tried to access user ${req.params.userId} data`, req.traceId);
        return res.status(403).json({ error: 'Forbidden' });
    }
    this.log.info(`User ${req.user.id} accessed his own data`, req.traceId);

    next();
  }
}