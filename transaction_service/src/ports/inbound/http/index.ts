import express from "express";
import http from "http";

const App = express();

import Config from "@config/index";
const config = new Config().getConfig();

App.use(express.json());

const server = http.createServer(App);

import DependencyInjection from "./dependencyInjection";
import GlobalErrorHandlerMiddleware from "./api/v1/middleware/GlobalErrorHandlerMiddleware";
const dependencyInjection = new DependencyInjection(server);
App.use("/", dependencyInjection.getRoutes());

const globalErrorHandler = new GlobalErrorHandlerMiddleware();
App.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  globalErrorHandler.handle(err, req, res, next);
})
);

server.listen(config.port, function () {
  console.log(`Server is running on port ${config.port}`);
});
