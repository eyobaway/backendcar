"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = __importDefault(require("./config/database"));
const models_1 = require("./models");
const deleteProperties = async () => {
    try {
        await database_1.default.authenticate();
        // Destroy all records in the Property table
        await models_1.Property.destroy({
            where: {},
            truncate: true, // Optionally truncate instead of delete depending on FKs.
            cascade: true
        });
        console.log('Successfully deleted all seeded and existing properties!');
        process.exit(0);
    }
    catch (error) {
        console.error('Error deleting properties:', error);
        process.exit(1);
    }
};
deleteProperties();
