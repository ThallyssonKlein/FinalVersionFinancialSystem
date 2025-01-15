import { Router, Response, Request, NextFunction } from "express";

import UserController from "./api/v1/controller/UserController";
import InboundUserAdapter from "@adapters/inbound/http/api/v1/InboundUserAdapter";

import MessageController from "./api/v1/controller/MessageController";

import UserJobController from "./job/controller/UserJobController";
import InboundUserJobAdapter from "@adapters/inbound/http/job/InboundUserJobAdapter";

import ValidateSchema, { ESource } from "./api/v1/middleware/ValidateSchemaMiddleware";
import loginSchema from "./api/v1/schema/loginSchema";
import getReceiverMessagesWithPaginationSchema from "./api/v1/schema/getReceiverMessagesWithPaginationSchema";
import getTotalAndCountForAReceiverSchema from "./api/v1/schema/getTotalAndCountForAReceiverSchema";
import messageSchema from "./api/v1/schema/messageSchema";
import ProtectedRouteMiddleware from "./api/v1/middleware/ProtectedRouteMiddleware";
import ResourceOwner from "./api/v1/middleware/ResourceOwnerMiddleware";
import InboundMessageAdapter from "@adapters/inbound/http/api/v1/message/InboundMessageAdapter";
import UuidMiddleware from "./api/v1/middleware/UuidMiddleware";
import PaymentsController from "./api/v1/controller/PaymentController";
import InboundTransactionAdapter from "@adapters/inbound/http/api/v1/InboundPaymentAdapter";
import getPaymentsByReceiverSchema from "./api/v1/schema/getPaymentsByReceiverSchema";
import AdminRouteMiddleware from "./api/v1/middleware/AdminRouteMiddleware";
import EfiBankWebhooksController from "./webhook/controller/EfiBankWebhooksController";
import LNBitsWebhooksController from "./webhook/controller/LNBitsWebhooksController";
import withdrawSchema from "./api/v1/schema/withdrawSchema";
import registerSchema from './api/v1/schema/registerSchema';
import updateSchema from './api/v1/schema/updateSchema';
import FileUploadMiddleware from './api/v1/middleware/FileUploadMiddleware';
import virtualWithdrawSchema from './api/v1/schema/virtualWithdrawSchema';
import ResourceOwnerOrAdminMiddleware from "./api/v1/middleware/ResourceOwnerOrAdminMiddleware";
import getAllUsersPaginatedSchema from "./api/v1/schema/getAllUsersPaginatedSchema";

export default class Routes {
  private router: Router = Router();
  private userController: UserController
  private messageController: MessageController
  private jobController: UserJobController
  private paymentsController: PaymentsController
  private efiBankWebhooksController: EfiBankWebhooksController
  private lnbitsWebhooksController: LNBitsWebhooksController

  constructor(inboundUserAdapter: InboundUserAdapter, inboundUserJobAdapter: InboundUserJobAdapter,
    inboundMessageAdapter: InboundMessageAdapter, inboundPaymentAdapter: InboundTransactionAdapter) {
    this.userController = new UserController(inboundUserAdapter);
    this.jobController = new UserJobController(inboundUserJobAdapter);
    this.messageController = new MessageController(inboundMessageAdapter);
    this.paymentsController = new PaymentsController(inboundPaymentAdapter);
    this.efiBankWebhooksController = new EfiBankWebhooksController(inboundPaymentAdapter);
    this.lnbitsWebhooksController = new LNBitsWebhooksController(inboundPaymentAdapter);
    this.setupRouter();
  }

  getRouter() {
    return this.router;
  }

  private setupRouter() {
    const fileUploadMiddleware = new FileUploadMiddleware();
    const uuidMiddleware = new UuidMiddleware();
    const protectedRoute = new ProtectedRouteMiddleware();
    const resourceOwner = new ResourceOwner();
    const resourceOwnerOrAdmin = new ResourceOwnerOrAdminMiddleware();
    const adminRoute = new AdminRouteMiddleware();

    const loginValidateSchema = new ValidateSchema(loginSchema);
    const getReceiverMessagesWithPaginationSchemValidateSchema = new ValidateSchema(getReceiverMessagesWithPaginationSchema, ESource.QUERY);
    const getTotalAndCountForAReceiverSchemaValidateSchema = new ValidateSchema(getTotalAndCountForAReceiverSchema, ESource.QUERY);
    const messageSchemaValidateSchema = new ValidateSchema(messageSchema);
    const getPaymentsByReceiverSchemaValidateSchema = new ValidateSchema(getPaymentsByReceiverSchema, ESource.QUERY);
    const withdrawSchemaValidateSchema = new ValidateSchema(withdrawSchema);
    const registerSchemaValidateSchema = new ValidateSchema(registerSchema);
    const updateSchemaValidateSchema = new ValidateSchema(updateSchema);
    const virtualWithdrawSchemaValidateSchema = new ValidateSchema(virtualWithdrawSchema);
    const getAllUsersPaginatedSchemaValidateSchema = new ValidateSchema(getAllUsersPaginatedSchema, ESource.QUERY);
    const getAllPaymentsPaginatedSchemaValidateSchema = new ValidateSchema(getAllUsersPaginatedSchema, ESource.QUERY);

    this.router.get("/ping", (_, res: Response) => res.send("pong"));
    this.router.post("/api/v1/user", 
                      uuidMiddleware.handle,
                      registerSchemaValidateSchema.handle,
                      (req: Request, res: Response, next: NextFunction) => this.userController.register(req, res, next));
    this.router.patch("/api/v1/user/:userId",
                      uuidMiddleware.handle,
                      protectedRoute.handle,
                      resourceOwnerOrAdmin.handle,
                      updateSchemaValidateSchema.handle,
                      fileUploadMiddleware.handle,
                      (req: Request, res: Response, next: NextFunction) => this.userController.update(req, res, next))
    this.router.patch("/api/v1/user/:userId/photo/remove",
                      uuidMiddleware.handle,
                      protectedRoute.handle,
                      resourceOwnerOrAdmin.handle,
                      fileUploadMiddleware.handle,
                      (req: Request, res: Response, next: NextFunction) => this.userController.removePhoto(req, res, next)
    )
    this.router.post("/api/v1/user/login", 
                      uuidMiddleware.handle,
                      loginValidateSchema.handle, (req: Request, res: Response, next: NextFunction) => this.userController.login(req, res, next));
    this.router.delete("/api/v1/user/:userId",
                        uuidMiddleware.handle,
                        protectedRoute.handle,
                        resourceOwner.handle, (req: Request, res: Response, next: NextFunction) => this.userController.delete(req, res, next));
    this.router.get("/api/v1/user/:userId",
                      uuidMiddleware.handle,
                      protectedRoute.handle,
                      resourceOwnerOrAdmin.handle,
                      (req: Request, res: Response, next: NextFunction) => this.userController.get(req, res, next));
    this.router.get("/api/v1/user/username/:username",
                        uuidMiddleware.handle,
                        (req: Request, res: Response, next: NextFunction) => this.userController.getByUsername(req, res, next));
    this.router.get("/api/v1/message/:userId",
                      uuidMiddleware.handle,
                      protectedRoute.handle,
                      resourceOwner.handle,
                      getReceiverMessagesWithPaginationSchemValidateSchema.handle, 
                      (req: Request, res: Response, next: NextFunction) => this.messageController.getReceiverMessagesWithPagination(req, res, next));
    this.router.get("/api/v1/message",
                      uuidMiddleware.handle,
                      protectedRoute.handle,
                      adminRoute.handle,
                      getReceiverMessagesWithPaginationSchemValidateSchema.handle,
                      (req: Request, res: Response, next: NextFunction) => this.messageController.getAllWithPaginationAndUserIdFilter(req, res, next)
    )
    this.router.get("/api/v1/message/:userId/totals",
                      uuidMiddleware.handle,
                      protectedRoute.handle,
                      resourceOwner.handle,
                      getTotalAndCountForAReceiverSchemaValidateSchema.handle, 
                      (req: Request, res: Response, next: NextFunction) => this.messageController.getTotalAndCountForAReceiver(req, res, next));
    this.router.post("/api/v1/message/:userId",
                      uuidMiddleware.handle,
                      messageSchemaValidateSchema.handle,(req: Request, res: Response, next: NextFunction) => this.messageController.saveMessage(req, res, next));
    this.router.delete("/job/user", 
                        uuidMiddleware.handle,
                        adminRoute.handle, (req: Request, res: Response, next: NextFunction) => this.jobController.physicalDelete(req, res, next));
    this.router.get("/api/v1/user/:userId/balance",
                      uuidMiddleware.handle,
                      protectedRoute.handle,
                      resourceOwner.handle, (req: Request, res: Response, next: NextFunction) => this.userController.getBalances(req, res, next));
    this.router.get("/api/v1/user/transaction/:userId",
                      uuidMiddleware.handle,
                      protectedRoute.handle,
                      getPaymentsByReceiverSchemaValidateSchema.handle,
                      resourceOwner.handle, (req: Request, res: Response, next: NextFunction) => this.paymentsController.getTransactionsByReceiverWithPagination(req, res, next));
    this.router.get("/api/v1/transaction",
                      uuidMiddleware.handle,
                      protectedRoute.handle,
                      getAllPaymentsPaginatedSchemaValidateSchema.handle,
                      adminRoute.handle, (req: Request, res: Response, next: NextFunction) => this.paymentsController.getAllWithPaginationAndUserIdFilter(req, res, next));

    this.router.post("/webhook/efibank",
                        uuidMiddleware.handle,
                        (req: Request, res: Response, next: NextFunction) => res.status(200).send("OK"));
    this.router.post("/webhook/efibank/pix",
                        uuidMiddleware.handle,
                        (req: Request, res: Response, next: NextFunction) => this.efiBankWebhooksController.receivePixConfirmations(req, res, next));
    this.router.post("/webhook/lnbits/btc",
                          uuidMiddleware.handle,
                          (req: Request, res: Response, next: NextFunction) => this.lnbitsWebhooksController.receiveBTCConfirmation(req, res, next));
    this.router.patch("/api/v1/message/:messageId/read",
                      uuidMiddleware.handle,
                      protectedRoute.handle,
                      (req: Request, res: Response, next: NextFunction) => this.messageController.markMessageAsRead(req, res, next));
    this.router.patch("/api/v1/message/:messageId/unread",
                      uuidMiddleware.handle,
                      protectedRoute.handle,
                      (req: Request, res: Response, next: NextFunction) => this.messageController.markMessageAsUnread(req, res, next));
    this.router.post("/api/v1/user/:userId/withdraw",
                      uuidMiddleware.handle,
                      protectedRoute.handle,
                      resourceOwner.handle,
                      withdrawSchemaValidateSchema.handle,
                      (req: Request, res: Response, next: NextFunction) => this.userController.withdraw(req, res, next));
    this.router.post("/api/v1/user/:userId/virtual_withdraw",
                      uuidMiddleware.handle,
                      protectedRoute.handle,
                      virtualWithdrawSchemaValidateSchema.handle,
                      adminRoute.handle,
                      (req: Request, res: Response, next: NextFunction) => this.userController.virtualWithdraw(req, res, next));
    this.router.get("/api/v1/user",
                      uuidMiddleware.handle,
                      protectedRoute.handle,
                      adminRoute.handle,
                      getAllUsersPaginatedSchemaValidateSchema.handle,
                      (req: Request, res: Response, next: NextFunction) => this.userController.getAllPaginated(req, res, next));
        
  
    
    return this.router;
  }
}
