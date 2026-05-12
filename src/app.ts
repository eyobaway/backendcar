import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';

import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import routes from './routes';

const app: Application = express();

// Middlewares
app.use(cors({
    origin: [process.env.FRONTEND_URL, process.env.ADMIN_FRONTEND_URL, "http://localhost:3000", "http://localhost:3001"].filter(Boolean) as string[],
    methods: ["GET", "POST", "PUT", "DELETE"]
}));
app.use(express.json());
app.use(morgan('dev'));

// Static files (for images)
app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));

// Routes
app.use('/api', routes);

// Basic Route
app.get('/', (req: Request, res: Response) => {
    res.json({ message: 'Welcome to Realtor Clone API' });
});

export default app;
