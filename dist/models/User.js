"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRole = void 0;
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
var UserRole;
(function (UserRole) {
    UserRole["USER"] = "USER";
    UserRole["AGENT"] = "AGENT";
    UserRole["ADMIN"] = "ADMIN";
})(UserRole || (exports.UserRole = UserRole = {}));
class User extends sequelize_1.Model {
}
User.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    name: {
        type: new sequelize_1.DataTypes.STRING(128),
        allowNull: false,
    },
    email: {
        type: new sequelize_1.DataTypes.STRING(128),
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
        },
    },
    password: {
        type: new sequelize_1.DataTypes.STRING(128),
        allowNull: false,
    },
    role: {
        type: sequelize_1.DataTypes.ENUM(...Object.values(UserRole)),
        defaultValue: UserRole.USER,
    },
    profileImage: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    preferences: {
        type: sequelize_1.DataTypes.JSON,
        allowNull: true,
    },
    favorites: {
        type: sequelize_1.DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
    },
}, {
    tableName: 'users',
    sequelize: database_1.default,
});
exports.default = User;
