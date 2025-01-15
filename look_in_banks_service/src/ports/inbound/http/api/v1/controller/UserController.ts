import { Response, NextFunction } from "express";

import InboundUserAdapter from "@adapters/inbound/http/api/v1/InboundUserAdapter";
import Loggable from "@shared/Loggable";
import CustomRequest from '@ports/inbound/http/api/v1/middleware/CustomRequest';
import { BadRequestError, ForbiddenError } from "../error";
import IInboundUserDTO from "../dto/IInboundUserDTO";

export default class UserController extends Loggable {
  private brlAmountPattern = /^[0-9]{1,10}\.[0-9]{2}$/;

  constructor(private inboundUserAdapter: InboundUserAdapter) {
    super("UserController");
  }

  async update(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      this.log.info("Request received to update user with id: " + req.params.userId, req.traceId);

      let parsedBody: IInboundUserDTO
      if (req.body.body) {
        parsedBody = JSON.parse(req.body.body)
      }
      
      if (parsedBody !== null && parsedBody !== undefined) {
          if (!parsedBody.username 
            && !parsedBody.email
            && (parsedBody.xUsername === undefined || parsedBody.xUsername === null)
            && (parsedBody.instagramUsername === undefined || parsedBody.instagramUsername === null)
            && (parsedBody.facebookUsername === undefined || parsedBody.facebookUsername === null)
            && (parsedBody.nostrUsername === undefined || parsedBody.nostrUsername === null)
            && (parsedBody.telegramUsername === undefined || parsedBody.telegramUsername === null)
            && (parsedBody.whatsappUsername === undefined || parsedBody.whatsappUsername === null)
            && (parsedBody.youtubeUsername === undefined || parsedBody.youtubeUsername === null)
            && (parsedBody.twitchUsername === undefined || parsedBody.twitchUsername === null)) {
          throw new BadRequestError("You must provide at least one field to update");
        }
      } else {
        if (!req.file) {
          throw new BadRequestError("You must provide at least one field to update");
        }
      }

      res.status(204).json(await this.inboundUserAdapter.updateUserById(
        Number(req.params.userId),
        req.traceId,
        parsedBody,
        req.file
      ))
    } catch (error) {
      next(error);
    }
  }

  async register(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      this.log.info("Request received to register user", req.traceId);
      const body: IInboundUserDTO = req.body;

      body.username = body.username.toLowerCase();

      const token = req.header('Authorization');

      if (!token) {
        if (!body.email) {
          throw new BadRequestError("You must provide an email to register");
        }
      }

      res.status(201).json(
        await this.inboundUserAdapter.register(
          body, 
          req.traceId
        )
      );
    } catch (error) {
      next(error);
    }
  }

  async login(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      this.log.info("Request received to login user with username: " + req.body.username, req.traceId);
      res.status(200).json(await this.inboundUserAdapter.login(
        req.body.username.toLowerCase(),
        req.body.password,
        req.traceId,
      ));
    } catch (error) {
      next(error);
    }
  }

  async delete(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      this.log.info("Request received to delete user with id: " + req.params.userId, req.traceId);
      await this.inboundUserAdapter.logicalDelete(
        Number(req.params.userId),
        req.traceId
      );
  
      res.status(200).send();
    } catch (error) {
      next(error);
    }
  }

  async get(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(200).json(await this.inboundUserAdapter.get(Number(req.params.userId)));
    } catch (error) {
      next(error);
    }
  }

  async getBalances(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      this.log.info("Request received to get balances for user with id: " + req.params.userId, req.traceId);
      res.status(200).json(await this.inboundUserAdapter.getBalances(Number(req.params.userId), req.traceId));
    } catch (error) {
      next(error);
    }
  }

  async getByUsername(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      this.log.info("Request received to get user with username: " + req.params.username, req.traceId);
      res.status(200).json(await this.inboundUserAdapter.getUserByUsername(req.params.username, req.traceId));
    } catch (error) {
      next(error);
    }
  }

  async withdraw(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      this.log.info("Request received to withdraw for user with id: " + req.params.userId, req.traceId);

      if (!req.body.pixKey && !req.body.invoice) {
        throw new BadRequestError("You must provide a pixKey or a invoice to withdraw");
      }

      if (req.body.currency === "BRL") {
        if (isNaN(Number(req.body.amount))) {
          throw new BadRequestError("Invalid amount");
        }
        
        if (!this.brlAmountPattern.test(req.body.amount)) {
            return next(new ForbiddenError("Invalid amount"));
        }
      }

      if (req.body.currency === "BRL") {
        res.status(200).json(await this.inboundUserAdapter.pixWithdraw(Number(req.params.userId), req.body.amount, req.body.pixKey, req.traceId));
      } else {
        res.status(200).json(await this.inboundUserAdapter.btcWithdraw(Number(req.params.userId), req.body.invoice, req.traceId));
      }
    } catch (error) {
      next(error);
    }
  }

  async virtualWithdraw(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      this.log.info("Request received to virtual withdraw for user with id: " + req.params.userId, req.traceId);
      res.status(200).json(await this.inboundUserAdapter.virtualWithdraw(Number(req.params.userId), req.body.amount, req.body.currency, req.traceId));
    } catch (error) {
      next(error);
    }
  }

  async removePhoto(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
    try {

      if (Number.isNaN(Number(req.params.userId))) {
        throw new BadRequestError("Invalid user id");
      }

      this.log.info("Request received to remove the user photo for user with id: " + req.params.userId)
      res.status(204).json(await this.inboundUserAdapter.removePhoto(Number(req.params.userId), req.traceId))
    } catch (err) {
      next(err);
    }
  }

  async getAllPaginated(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      this.log.info("Request received to get all users paginated", req.traceId);
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

      res.status(200).json(await this.inboundUserAdapter.getAllPaginated(page, limit, req.traceId));
    } catch (error) {
      next(error);
    }
  }
}
