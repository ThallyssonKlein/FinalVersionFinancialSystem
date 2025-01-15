import jwt from 'jsonwebtoken';
import { Response, NextFunction } from 'express';
import Loggable from '@shared/Loggable';
import CustomRequest from './CustomRequest';

export default class ProtectedRouteMiddleware extends Loggable {
  constructor() {
    super('ProtectedRouteMiddleware');
    this.handle = this.handle.bind(this);
  }

  handle(req: CustomRequest, res: Response, next: NextFunction) {
    const token = req.header('Authorization');
    if (!token) {
      this.log.error('No token provided', req.traceId);
      return res.status(401).json({ error: 'No token provided' });
    }

    try {
      const tokenOnly = token.split(' ')[1]; // pegamos apenas o token, sem a string 'Bearer'
      const verified = jwt.verify(tokenOnly, process.env.JWT_SECRET);
      req.user = verified;
      this.log.info('Token verified', req.traceId);
      next();
    } catch (err) {
      this.log.error('Invalid token', req.traceId);
      res.status(401).json({ error: 'Invalid token' });
    }
  }
}