import app from './app';
import { connectDB } from './config/database';
import { createServer } from 'http';
import { initSocket } from './socket';

const PORT = process.env.PORT || 5000;

const httpServer = createServer(app);
initSocket(httpServer);

connectDB().then(() => {
    httpServer.listen(PORT, () => {
        console.log(`Server is runningjnhjhjh on port ${PORT}`);
    });
});
