import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class Message extends Model {
    public id!: string;
    public senderId!: string;
    public receiverId!: string;
    public content!: string;
    public read!: boolean;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Message.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    senderId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    receiverId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    read: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    }
}, {
    sequelize,
    modelName: 'Message',
    tableName: 'messages'
});

export default Message;
