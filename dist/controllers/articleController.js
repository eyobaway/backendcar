"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteArticle = exports.updateArticle = exports.createArticle = exports.getArticleById = exports.getAllArticles = void 0;
const models_1 = require("../models");
const getAllArticles = async (req, res) => {
    try {
        const articles = await models_1.Article.findAll();
        res.json(articles);
    }
    catch (error) {
        console.error('Backend Error in articleController.ts:', error);
        res.status(500).json({ message: 'Error fetching articles', error });
    }
};
exports.getAllArticles = getAllArticles;
const getArticleById = async (req, res) => {
    try {
        const article = await models_1.Article.findByPk(req.params.id);
        if (!article)
            return res.status(404).json({ message: 'Article not found' });
        res.json(article);
    }
    catch (error) {
        console.error('Backend Error in articleController.ts:', error);
        res.status(500).json({ message: 'Error fetching article', error });
    }
};
exports.getArticleById = getArticleById;
const createArticle = async (req, res) => {
    try {
        const article = await models_1.Article.create({
            ...req.body,
            date: req.body.date || new Date().toISOString()
        });
        res.status(201).json(article);
    }
    catch (error) {
        console.error('Error creating article:', error);
        res.status(500).json({ message: 'Error creating article', error });
    }
};
exports.createArticle = createArticle;
const updateArticle = async (req, res) => {
    try {
        const article = await models_1.Article.findByPk(req.params.id);
        if (!article)
            return res.status(404).json({ message: 'Article not found' });
        await article.update(req.body);
        res.json(article);
    }
    catch (error) {
        console.error('Error updating article:', error);
        res.status(500).json({ message: 'Error updating article', error });
    }
};
exports.updateArticle = updateArticle;
const deleteArticle = async (req, res) => {
    try {
        const article = await models_1.Article.findByPk(req.params.id);
        if (!article)
            return res.status(404).json({ message: 'Article not found' });
        await article.destroy();
        res.json({ message: 'Article deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting article:', error);
        res.status(500).json({ message: 'Error deleting article', error });
    }
};
exports.deleteArticle = deleteArticle;
