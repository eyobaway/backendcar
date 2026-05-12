"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const database_1 = require("./config/database");
const http_1 = require("http");
const socket_1 = require("./socket");
const PORT = process.env.PORT || 5000;
const httpServer = (0, http_1.createServer)(app_1.default);
(0, socket_1.initSocket)(httpServer);
(0, database_1.connectDB)().then(() => {
    httpServer.listen(PORT, () => {
        console.log(`Server is runningjnhjhjh on port ${PORT}`);
    });
});
