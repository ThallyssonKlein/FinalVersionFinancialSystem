import HttpError from "@ports/inbound/http/api/v1/error/HttpError";
import Loggable from "@shared/Loggable";
import { Response, NextFunction } from "express";
import CustomRequest from "./CustomRequest";

export default class GlobalErrorHandlerMiddleware extends Loggable {
  constructor() {
    super("GlobalErrorHandlerMiddleware");
  }

  handle(err: any, _req: CustomRequest, res: Response, _next: NextFunction) {
    if (err) {
      if ((err instanceof HttpError)) {
        this.log.error("HTTP_ERROR: " + err.message, _req.traceId);
        return res.status(err.getStatus()).send({
          message: err.message,
          name: err.name,
          status: err.getStatus(),
        });
      } else {
        this.log.error("GENERIC_ERROR: " + err.message, _req.traceId);
        return res.status(500).send({
          message: "Internal Server Error",
          name: "Error",
          status: 500,
        });
      }
    }
  }
}