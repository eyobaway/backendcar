"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
const messageController_1 = require("../controllers/messageController");
const router = express_1.default.Router();
// Require auth for all message routes
router.use(authMiddleware_1.authenticate);
router.get('/conversations', messageController_1.getConversations);
router.get('/:partnerId', messageController_1.getChatHistory);
router.put('/:partnerId/read', messageController_1.markAsRead);
router.post('/', messageController_1.createMessage);
exports.default = router;
