import { Response, NextFunction } from 'express';
import Loggable from '@shared/Loggable';
import CustomRequest from './CustomRequest';
import InboundTokenAdapter from 'adaptes/inbound/InboundTokenAdapter';
import IToken from '@ports/outbound/database/token/IToken';

export default class ProtectedRouteMiddleware extends Loggable {
  constructor(private inboundTokenAdapter: InboundTokenAdapter) {
    super('ProtectedRouteMiddleware');
    this.handle = this.handle.bind(this);
  }

  async handle(req: CustomRequest, res: Response, next: NextFunction) {
    const token = req.header('Authorization');
    if (!token) {
      this.log.error('No token provided', req.traceId);
      return res.status(401).json({ error: 'No token provided' });
    }

    let tokenData: IToken | null = null;
    try {
      tokenData = await this.inboundTokenAdapter.findToken(token);

      if (!tokenData || !tokenData.id) {
          this.log.error('Invalid token', req.traceId);
          return res.status(403).json({ error: 'Unauthorized' });
      }

      req.token = tokenData
    } catch (err) {
      this.log.error('Error finding token', req.traceId, err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
}