"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const articleController_1 = require("../controllers/articleController");
const router = (0, express_1.Router)();
router.get('/', articleController_1.getAllArticles);
router.get('/:id', articleController_1.getArticleById);
exports.default = router;
