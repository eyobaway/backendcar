"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Message = exports.Article = exports.Property = exports.Agent = exports.User = void 0;
const User_1 = __importDefault(require("./User"));
exports.User = User_1.default;
const Agent_1 = __importDefault(require("./Agent"));
exports.Agent = Agent_1.default;
const Property_1 = __importDefault(require("./Property"));
exports.Property = Property_1.default;
const Article_1 = __importDefault(require("./Article"));
exports.Article = Article_1.default;
const Message_1 = __importDefault(require("./Message"));
exports.Message = Message_1.default;
// User <-> Agent (One-to-One)
User_1.default.hasOne(Agent_1.default, { foreignKey: 'userId', as: 'agentProfile' });
Agent_1.default.belongsTo(User_1.default, { foreignKey: 'userId', as: 'user' });
// Agent <-> Property (One-to-Many)
Agent_1.default.hasMany(Property_1.default, { foreignKey: 'agentId', as: 'properties' });
Property_1.default.belongsTo(Agent_1.default, { foreignKey: 'agentId', as: 'agent' });
// User <-> Messages
User_1.default.hasMany(Message_1.default, { foreignKey: 'senderId', as: 'sentMessages' });
Message_1.default.belongsTo(User_1.default, { foreignKey: 'senderId', as: 'sender' });
User_1.default.hasMany(Message_1.default, { foreignKey: 'receiverId', as: 'receivedMessages' });
Message_1.default.belongsTo(User_1.default, { foreignKey: 'receiverId', as: 'receiver' });
