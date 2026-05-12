import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

export enum UserRole {
    USER = 'USER',
    AGENT = 'AGENT',
    ADMIN = 'ADMIN'
}

class User extends Model {
    public id!: string;
    public name!: string;
    public email!: string;
    public password!: string;
    public role!: UserRole;
    public profileImage?: string;
    public preferences?: {
        location?: string;
        type?: string;
        minPrice?: number;
        maxPrice?: number;
        make?: string;
        model?: string;
    };
    public favorites?: string[];
    public readonly created_at!: Date;
    public readonly updated_at!: Date;
}

User.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        name: {
            type: new DataTypes.STRING(128),
            allowNull: false,
        },
        email: {
            type: new DataTypes.STRING(128),
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true,
            },
        },
        password: {
            type: new DataTypes.STRING(128),
            allowNull: false,
        },
        role: {
            type: DataTypes.ENUM(...Object.values(UserRole)),
            defaultValue: UserRole.USER,
        },
        profileImage: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        preferences: {
            type: DataTypes.JSON,
            allowNull: true,
        },
        favorites: {
            type: DataTypes.JSON,
            allowNull: true,
            defaultValue: [],
        },
    },
    {
        tableName: 'users',
        sequelize,
    }
);

export default User;
