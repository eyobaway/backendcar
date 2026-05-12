import dotenv from 'dotenv';
dotenv.config();

import sequelize from '../src/config/database';
import User, { UserRole } from '../src/models/User';
import Agent from '../src/models/Agent';
import Property, { PropertyType, RentCycle, Transmission, FuelType, Condition } from '../src/models/Property';
import bcryptjs from 'bcryptjs';

const seedProperties = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        // 1. Get or create a basic user
        const email = 'agent_seed@ptgr.com';
        let user = await User.findOne({ where: { email } });
        if (!user) {
            const hashedPassword = await bcryptjs.hash('password123', 10);
            user = await User.create({
                name: 'Seed Agent User',
                email: email,
                password: hashedPassword,
                role: UserRole.AGENT,
            });
        }

        // 2. Get or create an agent profile for that user
        let agent = await Agent.findOne({ where: { userId: user.id } });
        if (!agent) {
            agent = await Agent.create({
                userId: user.id,
                role: 'Senior Broker',
                phone: '+1 555-0198',
                isActive: true,
                location: 'Los Angeles, CA',
            });
        }

        // 3. Properties Data
        const propertyData = [
            { title: "Toyota Camry 2024", make: "Toyota", model: "Camry", year: 2024, mileage: 0, price: "35000", type: PropertyType.SALE, transmission: Transmission.AUTOMATIC, fuelType: FuelType.PETROL, condition: Condition.NEW, bodyType: "Sedan" },
            { title: "BMW X5 2023", make: "BMW", model: "X5", year: 2023, mileage: 5000, price: "65000", type: PropertyType.SALE, transmission: Transmission.AUTOMATIC, fuelType: FuelType.DIESEL, condition: Condition.USED, bodyType: "SUV" },
            { title: "Ford F-150 2022", make: "Ford", model: "F-150", year: 2022, mileage: 15000, price: "45000", type: PropertyType.SALE, transmission: Transmission.AUTOMATIC, fuelType: FuelType.PETROL, condition: Condition.USED, bodyType: "Truck" },
            { title: "Tesla Model 3 2024", make: "Tesla", model: "Model 3", year: 2024, mileage: 100, price: "40000", type: PropertyType.SALE, transmission: Transmission.AUTOMATIC, fuelType: FuelType.ELECTRIC, condition: Condition.NEW, bodyType: "Sedan" },
            { title: "Honda Civic 2021", make: "Honda", model: "Civic", year: 2021, mileage: 30000, price: "22000", type: PropertyType.SALE, transmission: Transmission.CVT, fuelType: FuelType.PETROL, condition: Condition.USED, bodyType: "Sedan" },
            { title: "Mercedes-Benz G-Wagon", make: "Mercedes-Benz", model: "G-Class", year: 2024, mileage: 0, price: "150000", type: PropertyType.SALE, transmission: Transmission.AUTOMATIC, fuelType: FuelType.PETROL, condition: Condition.NEW, bodyType: "SUV" },
            { title: "Hyundai Tucson 2023", make: "Hyundai", model: "Tucson", year: 2023, mileage: 8000, price: "28000", type: PropertyType.SALE, transmission: Transmission.AUTOMATIC, fuelType: FuelType.HYBRID, condition: Condition.USED, bodyType: "SUV" },
            { title: "Audi A4 Rental", make: "Audi", model: "A4", year: 2023, mileage: 12000, price: "150", type: PropertyType.RENT, rentCycle: RentCycle.DAILY, transmission: Transmission.AUTOMATIC, fuelType: FuelType.PETROL, condition: Condition.USED, bodyType: "Sedan" },
            { title: "Kia Sportage 2024", make: "Kia", model: "Sportage", year: 2024, mileage: 0, price: "32000", type: PropertyType.SALE, transmission: Transmission.AUTOMATIC, fuelType: FuelType.PETROL, condition: Condition.NEW, bodyType: "SUV" },
            { title: "Jeep Wrangler 2022", make: "Jeep", model: "Wrangler", year: 2022, mileage: 20000, price: "38000", type: PropertyType.SALE, transmission: Transmission.MANUAL, fuelType: FuelType.PETROL, condition: Condition.USED, bodyType: "SUV" }
        ];

        console.log('Seeding properties...');
        let createdCount = 0;

        for (const data of propertyData) {
            await Property.create({
                agentId: agent.id,
                title: data.title,
                price: data.price,
                address: `123 Demo St, ${data.city || 'Addis Ababa'}`,
                city: data.city || 'Addis Ababa',
                make: data.make,
                model: data.model,
                year: data.year,
                mileage: data.mileage,
                transmission: data.transmission,
                fuelType: data.fuelType,
                condition: data.condition,
                bodyType: data.bodyType,
                type: data.type,
                rentCycle: data.rentCycle || null,
                description: `High-quality ${data.title} available for ${data.type === PropertyType.SALE ? 'sale' : 'rent'}. Features premium performance and comfort.`,
                features: ["Air Conditioning", "Power Windows", "Bluetooth", "Backup Camera"],
                lat: 9.0192 + (Math.random() * 0.1 - 0.05),
                lng: 38.7525 + (Math.random() * 0.1 - 0.05),
                image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                images: [
                    "https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                ]
            });
            createdCount++;
        }

        console.log(`Successfully seeded ${createdCount} vehicles!`);
        process.exit(0);

    } catch (error) {
        console.error('Failed to seed properties:', error);
        process.exit(1);
    }
};

seedProperties();
