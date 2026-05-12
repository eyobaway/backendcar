import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class Agent extends Model {
    public id!: string;
    public userId!: string;
    public role!: string;
    public image!: string;
    public phone!: string;
    public listingsCount!: number;
    public bio!: string;
    public location!: string;
    public languages!: string; // Stored as comma-separated or JSON
    public isActive!: boolean;
    public readonly created_at!: Date;
    public readonly updated_at!: Date;
}

Agent.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id',
            },
        },
        role: {
            type: DataTypes.STRING(128),
            allowNull: false,
        },
        image: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        phone: {
            type: DataTypes.STRING(32),
            allowNull: true,
        },
        listingsCount: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        bio: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        location: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        languages: {
            type: DataTypes.STRING,
            allowNull: true,
            comment: 'Comma separated list of languages',
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
    },
    {
        tableName: 'agents',
        sequelize,
    }
);

export default Agent;
