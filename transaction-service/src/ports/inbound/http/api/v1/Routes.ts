import { Router, Response, Request, NextFunction } from "express";
import InboundTransactionAdapter from "@adapters/inbound/InboundTransactionAdapter";
import InboundConfigAdapter from "@adapters/inbound/InboundConfigAdapter";
import TransactionController from "./controller/TransactionController";
import ConfigController from "./controller/ConfigController";
import UuidMiddleware from "./middleware/UuidMiddleware";
import ValidateSchemaMiddleware, { ESource } from "./middleware/ValidateSchemaMiddleware";
import createTransactionSchema from "./schema/createTransactionSchema";
import createConfigSchema from "./schema/createConfigSchema";
import CustomRequest from "./middleware/CustomRequest";
import findTransactionsXValueXFrequencySchema from "./schema/findTransactionsXValueXFrequencySchema";
import ProtectedRouteMiddleware from "./middleware/ProtectedRouteMiddleware";
import InboundTokenAdapter from "@adapters/inbound/InboundTokenAdapter";

export default class Routes {
  private router: Router = Router();
  private transactionController: TransactionController;
  private configController: ConfigController;

  constructor(
    inboundTransactionAdapter: InboundTransactionAdapter,
    inboundConfigAdapter: InboundConfigAdapter,
    private inboundTokenAdapter: InboundTokenAdapter
  ) {
    this.transactionController = new TransactionController(inboundTransactionAdapter);
    this.configController = new ConfigController(inboundConfigAdapter);
    this.setupRouter();
  }

  getRouter(): Router {
    return this.router;
  }

  private setupRouter(): void {
    const uuidMiddleware = new UuidMiddleware();
    const protectedRouteMiddleware = new ProtectedRouteMiddleware(this.inboundTokenAdapter);
  
    const createTransactionSchemaValidation = new ValidateSchemaMiddleware(createTransactionSchema, ESource.BODY);
    const createConfigSchemaValidation = new ValidateSchemaMiddleware(createConfigSchema, ESource.BODY);
    const findTransactionsXValueXFrequencySchemaValidation = new ValidateSchemaMiddleware(findTransactionsXValueXFrequencySchema, ESource.QUERY);

    this.router.get("/ping", (_req: Request, res: Response, _next: NextFunction): void => {
      res.send("pong");
    }); 
    this.router.post(
      "/api/v1/transaction",
      uuidMiddleware.handle,
      protectedRouteMiddleware.handle,
      createTransactionSchemaValidation.handle,
      (req: CustomRequest, res: Response, next: NextFunction) => this.transactionController.saveTransactionInBatch(req, res, next)
    );
    this.router.get("/api/v1/transactions/find_transactions_x_value_x_unity_ago",
      uuidMiddleware.handle,
      findTransactionsXValueXFrequencySchemaValidation.handle,
      protectedRouteMiddleware.handle,
      (req: CustomRequest, res: Response, next: NextFunction) => this.transactionController.findTransactionsXValueXUnityAgo(req, res, next)
    )
    this.router.post(
      "/api/v1/config",
      uuidMiddleware.handle,
      createConfigSchemaValidation.handle,
      protectedRouteMiddleware.handle,
      (req: CustomRequest, res: Response, next: NextFunction) => this.configController.saveConfig(req, res, next)
    );
  }
}
