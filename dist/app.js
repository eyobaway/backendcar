"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.resolve(process.cwd(), '.env') });
const routes_1 = __importDefault(require("./routes"));
const app = (0, express_1.default)();
// Middlewares
app.use((0, cors_1.default)({
    origin: [process.env.FRONTEND_URL, process.env.ADMIN_FRONTEND_URL, "http://localhost:3000", "http://localhost:3001"].filter(Boolean),
    methods: ["GET", "POST", "PUT", "DELETE"]
}));
app.use(express_1.default.json());
app.use((0, morgan_1.default)('dev'));
// Static files (for images)
app.use('/uploads', express_1.default.static(path_1.default.resolve(process.cwd(), 'uploads')));
// Routes
app.use('/api', routes_1.default);
// Basic Route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to Realtor Clone API' });
});
exports.default = app;
