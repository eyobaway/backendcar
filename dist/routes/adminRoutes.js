"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adminController_1 = require("../controllers/adminController");
const articleController_1 = require("../controllers/articleController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
// Secure all paths under /api/admin using RBAC
router.use(authMiddleware_1.authenticate, (0, authMiddleware_1.authorize)(['ADMIN']));
router.get('/stats', adminController_1.getDashboardStats);
router.get('/users', adminController_1.getAllUsers);
router.get('/messages', adminController_1.getAllMessagesAdmin);
router.put('/users/:id/role', adminController_1.updateUserRole);
router.delete('/users/:id', adminController_1.deleteUserAdmin);
router.delete('/properties/:id', adminController_1.deletePropertyAdmin);
router.delete('/agents/:id', adminController_1.deleteAgentAdmin);
// News Management
router.post('/news', articleController_1.createArticle);
router.put('/news/:id', articleController_1.updateArticle);
router.delete('/news/:id', articleController_1.deleteArticle);
exports.default = router;
