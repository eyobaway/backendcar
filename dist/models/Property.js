"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Condition = exports.FuelType = exports.Transmission = exports.RentCycle = exports.PropertyType = void 0;
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
var PropertyType;
(function (PropertyType) {
    PropertyType["SALE"] = "SALE";
    PropertyType["RENT"] = "RENT";
})(PropertyType || (exports.PropertyType = PropertyType = {}));
var RentCycle;
(function (RentCycle) {
    RentCycle["DAILY"] = "DAILY";
    RentCycle["WEEKLY"] = "WEEKLY";
    RentCycle["MONTHLY"] = "MONTHLY";
})(RentCycle || (exports.RentCycle = RentCycle = {}));
var Transmission;
(function (Transmission) {
    Transmission["AUTOMATIC"] = "AUTOMATIC";
    Transmission["MANUAL"] = "MANUAL";
    Transmission["CVT"] = "CVT";
    Transmission["SEMI_AUTO"] = "SEMI_AUTO";
})(Transmission || (exports.Transmission = Transmission = {}));
var FuelType;
(function (FuelType) {
    FuelType["PETROL"] = "PETROL";
    FuelType["DIESEL"] = "DIESEL";
    FuelType["ELECTRIC"] = "ELECTRIC";
    FuelType["HYBRID"] = "HYBRID";
    FuelType["PLUG_IN_HYBRID"] = "PLUG_IN_HYBRID";
})(FuelType || (exports.FuelType = FuelType = {}));
var Condition;
(function (Condition) {
    Condition["NEW"] = "NEW";
    Condition["USED"] = "USED";
    Condition["CERTIFIED_PRE_OWNED"] = "CERTIFIED_PRE_OWNED";
})(Condition || (exports.Condition = Condition = {}));
class Property extends sequelize_1.Model {
}
Property.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    agentId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'agents',
            key: 'id',
        },
    },
    title: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    images: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
        get() {
            const val = this.getDataValue('images');
            if (!val)
                return [];
            try {
                return JSON.parse(val);
            }
            catch {
                return [];
            }
        },
        set(val) {
            this.setDataValue('images', val ? JSON.stringify(val) : null);
        },
    },
    image: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    price: {
        type: sequelize_1.DataTypes.DECIMAL(15, 2),
        allowNull: false,
    },
    address: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    city: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    make: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        defaultValue: 'Unknown',
    },
    model: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        defaultValue: 'Unknown',
    },
    year: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: new Date().getFullYear(),
    },
    mileage: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    transmission: {
        type: sequelize_1.DataTypes.ENUM(...Object.values(Transmission)),
        allowNull: false,
        defaultValue: Transmission.AUTOMATIC,
    },
    fuelType: {
        type: sequelize_1.DataTypes.ENUM(...Object.values(FuelType)),
        allowNull: false,
        defaultValue: FuelType.PETROL,
    },
    color: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
        defaultValue: 'White',
    },
    condition: {
        type: sequelize_1.DataTypes.ENUM(...Object.values(Condition)),
        allowNull: false,
        defaultValue: Condition.USED,
    },
    bodyType: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
        defaultValue: 'Sedan',
    },
    type: {
        type: sequelize_1.DataTypes.ENUM(...Object.values(PropertyType)),
        allowNull: false,
    },
    rentCycle: {
        type: sequelize_1.DataTypes.ENUM(...Object.values(RentCycle)),
        allowNull: true,
    },
    description: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    features: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
        get() {
            const val = this.getDataValue('features');
            if (!val)
                return [];
            try {
                return JSON.parse(val);
            }
            catch {
                return typeof val === 'string'
                    ? val.split(',').map((s) => s.trim()).filter(Boolean)
                    : [];
            }
        },
        set(val) {
            const finalVal = Array.isArray(val) ? JSON.stringify(val) : val;
            this.setDataValue('features', finalVal);
        },
    },
    lat: {
        type: sequelize_1.DataTypes.DECIMAL(10, 8),
        allowNull: false,
        defaultValue: 0,
    },
    lng: {
        type: sequelize_1.DataTypes.DECIMAL(11, 8),
        allowNull: false,
        defaultValue: 0,
    },
}, {
    tableName: 'properties',
    sequelize: database_1.default,
});
exports.default = Property;
