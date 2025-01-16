import { Router, Response, Request, NextFunction } from "express";
import FileUploadMiddleware from "./middleware/FileUploadMiddleware";
import ProtectedRouteMiddleware from "./middleware/ProtectedRouteMiddleware";

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
    return this.router;
  }
}
