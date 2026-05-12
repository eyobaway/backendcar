import User from './User';
import Agent from './Agent';
import Property from './Property';
import Article from './Article';
import Message from './Message';

// User <-> Agent (One-to-One)
User.hasOne(Agent, { foreignKey: 'userId', as: 'agentProfile' });
Agent.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Agent <-> Property (One-to-Many)
Agent.hasMany(Property, { foreignKey: 'agentId', as: 'properties' });
Property.belongsTo(Agent, { foreignKey: 'agentId', as: 'agent' });

// User <-> Messages
User.hasMany(Message, { foreignKey: 'senderId', as: 'sentMessages' });
Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });

User.hasMany(Message, { foreignKey: 'receiverId', as: 'receivedMessages' });
Message.belongsTo(User, { foreignKey: 'receiverId', as: 'receiver' });

export {
    User,
    Agent,
    Property,
    Article,
    Message
};
