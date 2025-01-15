import express from "express";
import cors from "cors";
import http from "http";
import path from 'path';

const App = express();

import Config from "@config/index";
const config = new Config().getConfig();

App.use(express.json());

const allowedOrigins = [
  "http://localhost:5173",
  "https://storage.googleapis.com",
  "https://livechat-henna.vercel.app",
  "https://livetip.gg",
  "https://dev.livetip.gg",
  "https://app.livetip.gg"
];

App.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: "GET, POST, PUT, DELETE, PATCH",
    allowedHeaders: "Content-Type, Authorization",
    credentials: true,
  })
);

App.use('/uploads', express.static(path.resolve('/app/uploads')));

const server = http.createServer(App);

import DependencyInjection from "./dependencyInjection";
const dependencyInjection = new DependencyInjection(server);
App.use("/", dependencyInjection.getRoutes());

import GlobalErrorHandlerMiddleware from "./api/v1/middleware/GlobalErrorHandlerMiddleware";
const globalErrorHandler = new GlobalErrorHandlerMiddleware();
App.use((err, req, res, next) =>
  globalErrorHandler.handle(err, req, res, next)
);

server.listen(config.port, function () {
  console.log(`Server is running on port ${config.port}`);
});
