import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

export enum PropertyType {
    SALE = 'SALE',
    RENT = 'RENT'
}

export enum RentCycle {
    DAILY = 'DAILY',
    WEEKLY = 'WEEKLY',
    MONTHLY = 'MONTHLY'
}

export enum Transmission {
    AUTOMATIC = 'AUTOMATIC',
    MANUAL = 'MANUAL',
    CVT = 'CVT',
    SEMI_AUTO = 'SEMI_AUTO'
}

export enum FuelType {
    PETROL = 'PETROL',
    DIESEL = 'DIESEL',
    ELECTRIC = 'ELECTRIC',
    HYBRID = 'HYBRID',
    PLUG_IN_HYBRID = 'PLUG_IN_HYBRID'
}

export enum Condition {
    NEW = 'NEW',
    USED = 'USED',
    CERTIFIED_PRE_OWNED = 'CERTIFIED_PRE_OWNED'
}

class Property extends Model {
    public id!: string;
    public agentId!: string;
    public title!: string;
    public images!: string[];
    public image!: string;
    public price!: number;
    public address!: string;
    public city!: string;
    // Car-specific fields
    public make!: string;        // Toyota, BMW, Ford, etc.
    public model!: string;       // Camry, X5, F-150, etc.
    public year!: number;        // 2024, 2023, etc.
    public mileage!: number;     // km or miles
    public transmission!: Transmission;
    public fuelType!: FuelType;
    public color!: string;       // Red, Black, White, etc.
    public condition!: Condition;
    public bodyType!: string;    // Sedan, SUV, Truck, Coupe, Van, etc.
    // Listing metadata
    public type!: PropertyType;
    public rentCycle!: RentCycle | null;
    public description!: string;
    public features!: string;
    public lat!: number;
    public lng!: number;
    public readonly created_at!: Date;
    public readonly updated_at!: Date;
}

Property.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        agentId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'agents',
                key: 'id',
            },
        },
        title: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        images: {
            type: DataTypes.TEXT,
            allowNull: true,
            get() {
                const val = this.getDataValue('images' as any);
                if (!val) return [];
                try { return JSON.parse(val); } catch { return []; }
            },
            set(val: string[]) {
                (this as any).setDataValue('images', val ? JSON.stringify(val) : null);
            },
        },
        image: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        price: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
        },
        address: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        city: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        make: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'Unknown',
        },
        model: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'Unknown',
        },
        year: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: new Date().getFullYear(),
        },
        mileage: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        transmission: {
            type: DataTypes.ENUM(...Object.values(Transmission)),
            allowNull: false,
            defaultValue: Transmission.AUTOMATIC,
        },
        fuelType: {
            type: DataTypes.ENUM(...Object.values(FuelType)),
            allowNull: false,
            defaultValue: FuelType.PETROL,
        },
        color: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: 'White',
        },
        condition: {
            type: DataTypes.ENUM(...Object.values(Condition)),
            allowNull: false,
            defaultValue: Condition.USED,
        },
        bodyType: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: 'Sedan',
        },
        type: {
            type: DataTypes.ENUM(...Object.values(PropertyType)),
            allowNull: false,
        },
        rentCycle: {
            type: DataTypes.ENUM(...Object.values(RentCycle)),
            allowNull: true,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        features: {
            type: DataTypes.TEXT,
            allowNull: true,
            get() {
                const val = this.getDataValue('features' as any);
                if (!val) return [];
                try {
                    return JSON.parse(val);
                } catch {
                    return typeof val === 'string'
                        ? val.split(',').map((s: string) => s.trim()).filter(Boolean)
                        : [];
                }
            },
            set(val: string[] | string) {
                const finalVal = Array.isArray(val) ? JSON.stringify(val) : val;
                (this as any).setDataValue('features', finalVal);
            },
        },
        lat: {
            type: DataTypes.DECIMAL(10, 8),
            allowNull: false,
            defaultValue: 0,
        },
        lng: {
            type: DataTypes.DECIMAL(11, 8),
            allowNull: false,
            defaultValue: 0,
        },
    },
    {
        tableName: 'properties',
        sequelize,
    }
);

export default Property;
