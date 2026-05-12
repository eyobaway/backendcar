import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { User, Message } from './models';
import { Server as HttpServer } from 'http';

interface SocketUser {
    id: string;
    email: string;
}

export const initSocket = (server: HttpServer) => {
    const io = new Server(server, {
        cors: {
            origin: [process.env.FRONTEND_URL, process.env.ADMIN_FRONTEND_URL, "http://localhost:3000", "http://localhost:3001"].filter(Boolean) as string[],
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
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as SocketUser;
            socket.data.user = decoded;
            next();
        } catch (err) {
            next(new Error("Authentication error"));
        }
    });

    io.on('connection', (socket: Socket) => {
        const user = socket.data.user as SocketUser;
        console.log(`User connected: ${user.id}`);

        // Join a personal room for receiving incoming messages
        socket.join(`user_${user.id}`);

        socket.on('sendMessage', async (data: { receiverId: string; content: string }) => {
            try {
                // Save to database
                const message = await Message.create({
                    senderId: user.id,
                    receiverId: data.receiverId,
                    content: data.content
                });

                // Fetch full sender info to send to receiver
                const sender = await User.findByPk(user.id, {
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

            } catch (error) {
                console.error("Error sending socket message:", error);
                socket.emit('error', { message: 'Failed to send message' });
            }
        });

        socket.on('markAsRead', async (data: { senderId: string }) => {
            try {
                await Message.update(
                    { read: true },
                    {
                        where: {
                            receiverId: user.id,
                            senderId: data.senderId,
                            read: false
                        }
                    }
                );
                // Notify sender that their messages were read
                io.to(`user_${data.senderId}`).emit('messagesRead', {
                    readerId: user.id
                });
            } catch (error) {
                console.error("Error marking messages as read via socket:", error);
            }
        });

        socket.on('disconnect', () => {
            console.log(`User disconnected: ${user.id}`);
        });
    });

    return io;
};
