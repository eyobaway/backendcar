import { Request, Response } from 'express';
import { Article } from '../models';

export const getAllArticles = async (req: Request, res: Response) => {
    try {
        const articles = await Article.findAll();
        res.json(articles);
    } catch (error) {
        console.error('Backend Error in articleController.ts:', error);
        res.status(500).json({ message: 'Error fetching articles', error });
    }
};

export const getArticleById = async (req: Request, res: Response) => {
    try {
        const article = await Article.findByPk(req.params.id);
        if (!article) return res.status(404).json({ message: 'Article not found' });
        res.json(article);
    } catch (error) {
        console.error('Backend Error in articleController.ts:', error);
        res.status(500).json({ message: 'Error fetching article', error });
    }
};
export const createArticle = async (req: Request, res: Response) => {
    try {
        const article = await Article.create({
            ...req.body,
            date: req.body.date || new Date().toISOString()
        });
        res.status(201).json(article);
    } catch (error) {
        console.error('Error creating article:', error);
        res.status(500).json({ message: 'Error creating article', error });
    }
};

export const updateArticle = async (req: Request, res: Response) => {
    try {
        const article = await Article.findByPk(req.params.id);
        if (!article) return res.status(404).json({ message: 'Article not found' });

        await article.update(req.body);
        res.json(article);
    } catch (error) {
        console.error('Error updating article:', error);
        res.status(500).json({ message: 'Error updating article', error });
    }
};

export const deleteArticle = async (req: Request, res: Response) => {
    try {
        const article = await Article.findByPk(req.params.id);
        if (!article) return res.status(404).json({ message: 'Article not found' });

        await article.destroy();
        res.json({ message: 'Article deleted successfully' });
    } catch (error) {
        console.error('Error deleting article:', error);
        res.status(500).json({ message: 'Error deleting article', error });
    }
};
