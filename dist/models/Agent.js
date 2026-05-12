"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
class Agent extends sequelize_1.Model {
}
Agent.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    userId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id',
        },
    },
    role: {
        type: sequelize_1.DataTypes.STRING(128),
        allowNull: false,
    },
    image: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    phone: {
        type: sequelize_1.DataTypes.STRING(32),
        allowNull: true,
    },
    listingsCount: {
        type: sequelize_1.DataTypes.INTEGER,
        defaultValue: 0,
    },
    bio: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    location: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    languages: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
        comment: 'Comma separated list of languages',
    },
    isActive: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: true,
    },
}, {
    tableName: 'agents',
    sequelize: database_1.default,
});
exports.default = Agent;
