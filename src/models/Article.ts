import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class Article extends Model {
    public id!: string;
    public title!: string;
    public excerpt!: string;
    public category!: string;
    public date!: string;
    public image!: string;
    public author!: string;
    public content!: string;
    public readonly created_at!: Date;
    public readonly updated_at!: Date;
}

Article.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        excerpt: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        category: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        date: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        image: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        author: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
    },
    {
        tableName: 'articles',
        sequelize,
    }
);

export default Article;
