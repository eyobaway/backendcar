"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initSocket = void 0;
const socket_io_1 = require("socket.io");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const models_1 = require("./models");
const initSocket = (server) => {
    const io = new socket_io_1.Server(server, {
        cors: {
            origin: [process.env.FRONTEND_URL, process.env.ADMIN_FRONTEND_URL, "http://localhost:3000", "http://localhost:3001"].filter(Boolean),
            methods: ["GET", "POST"]
        }
    });
    // Authentication middleware for sockets
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error("Authentication error"));
        }
        try {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'fallback_secret');
            socket.data.user = decoded;
            next();
        }
        catch (err) {
            next(new Error("Authentication error"));
        }
    });
    io.on('connection', (socket) => {
        const user = socket.data.user;
        console.log(`User connected: ${user.id}`);
        // Join a personal room for receiving incoming messages
        socket.join(`user_${user.id}`);
        socket.on('sendMessage', async (data) => {
            try {
                // Save to database
                const message = await models_1.Message.create({
                    senderId: user.id,
                    receiverId: data.receiverId,
                    content: data.content
                });
                // Fetch full sender info to send to receiver
                const sender = await models_1.User.findByPk(user.id, {
                    attributes: ['id', 'name', 'profileImage']
                });
                const messagePayload = {
                    id: message.id,
                    senderId: user.id,
                    receiverId: data.receiverId,
                    content: data.content,
                    read: message.read,
                    createdAt: message.createdAt,
                    sender // Important for UI to show who sent it
                };
                // Emit to receiver's personal room
                io.to(`user_${data.receiverId}`).emit('receiveMessage', messagePayload);
                // Echo back to sender so they can update their UI if they have multiple windows open
                socket.emit('messageSent', messagePayload);
            }
            catch (error) {
                console.error("Error sending socket message:", error);
                socket.emit('error', { message: 'Failed to send message' });
            }
        });
        socket.on('markAsRead', async (data) => {
            try {
                await models_1.Message.update({ read: true }, {
                    where: {
                        receiverId: user.id,
                        senderId: data.senderId,
                        read: false
                    }
                });
                // Notify sender that their messages were read
                io.to(`user_${data.senderId}`).emit('messagesRead', {
                    readerId: user.id
                });
            }
            catch (error) {
                console.error("Error marking messages as read via socket:", error);
            }
        });
        socket.on('disconnect', () => {
            console.log(`User disconnected: ${user.id}`);
        });
    });
    return io;
};
exports.initSocket = initSocket;
