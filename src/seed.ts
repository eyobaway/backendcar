import sequelize from './config/database';
import { User, Agent, Property, Article, Message } from './models';
import { UserRole } from './models/User';
import { PropertyType } from './models/Property';
import bcrypt from 'bcryptjs';

const seed = async () => {
    try {
        await sequelize.authenticate();
        await sequelize.sync(); // Sync without force: true
        console.log('Database connected and schema synced!');

        const hashedPassword = await bcrypt.hash('password123', 10);

        // helper to get or create user
        const getOrCreateUser = async (data: any) => {
            let user = await User.findOne({ where: { email: data.email } });
            if (!user) {
                user = await User.create(data);
            }
            return user;
        };

        // Create Admin User
        const adminPassword = await bcrypt.hash('admin', 10);
        await getOrCreateUser({ 
            name: 'System Admin', 
            email: 'admin@ptgr.com', 
            password: adminPassword, 
            role: UserRole.ADMIN,
            profileImage: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=1780&auto=format&fit=crop'
        });

        // Create Users and Agents
        const user1 = await getOrCreateUser({ name: 'Abebe Kebede', email: 'abebe@realtor.com', password: hashedPassword, role: UserRole.AGENT, profileImage: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=1887&auto=format&fit=crop' });
        const user2 = await getOrCreateUser({ name: 'Solomon Tekle', email: 'solomon@realtor.com', password: hashedPassword, role: UserRole.AGENT, profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1887&auto=format&fit=crop' });
        const user3 = await getOrCreateUser({ name: 'Hirut Tadesse', email: 'hirut@realtor.com', password: hashedPassword, role: UserRole.AGENT, profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1887&auto=format&fit=crop' });
        const user4 = await getOrCreateUser({ name: 'Dawit Getachew', email: 'dawit@realtor.com', password: hashedPassword, role: UserRole.AGENT, profileImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1888&auto=format&fit=crop' });

        const getOrCreateAgent = async (data: any) => {
            let agent = await Agent.findOne({ where: { userId: data.userId } });
            if (!agent) {
                agent = await Agent.create({ ...data, isActive: true });
            }
            return agent;
        };

        const agent1 = await getOrCreateAgent({
            userId: user1.id,
            role: 'Luxury Car Specialist',
            image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1974&auto=format&fit=crop',
            phone: '+251 91 123 4567',
            listingsCount: 15,
            bio: 'Abebe is an expert in luxury sedans and high-performance sports cars with over 10 years in the automotive industry.',
            location: 'Bole, Addis Ababa',
            languages: 'Amharic, English'
        });

        const agent2 = await getOrCreateAgent({
            userId: user2.id,
            role: 'SUV & Off-Road Expert',
            image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=2070&auto=format&fit=crop',
            phone: '+251 92 123 4567',
            listingsCount: 8,
            bio: 'Specializing in rugged 4x4s and family SUVs. Solomon knows every spec of the Toyota Land Cruiser and Range Rover.',
            location: 'Old Airport, Addis Ababa',
            languages: 'Amharic, English, Italian'
        });

        const agent3 = await getOrCreateAgent({
            userId: user3.id,
            role: 'Electric Vehicle Consultant',
            image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1888&auto=format&fit=crop',
            phone: '+251 93 123 4567',
            listingsCount: 12,
            bio: 'Hirut specializes in the latest EV technology and sustainable transport solutions.',
            location: 'Kazanchis, Addis Ababa',
            languages: 'Amharic, English'
        });

        const agent4 = await getOrCreateAgent({
            userId: user4.id,
            role: 'Used Car Curator',
            image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=1887&auto=format&fit=crop',
            phone: '+251 94 123 4567',
            listingsCount: 20,
            bio: 'Dawit focuses on finding the highest quality pre-owned vehicles with verified service histories.',
            location: 'Sarbet, Addis Ababa',
            languages: 'Amharic, English'
        });

        const propertyData = [
            {
                agentId: agent1.id,
                title: '2024 Tesla Model S Plaid',
                image: 'https://images.unsplash.com/photo-1617788138017-80ad42243c2d?q=80&w=2070&auto=format&fit=crop',
                price: 89900,
                address: 'Bole High Street',
                city: 'Addis Ababa',
                make: 'Tesla',
                model: 'Model S',
                year: 2024,
                mileage: 50,
                transmission: 'AUTOMATIC',
                fuelType: 'ELECTRIC',
                color: 'Midnight Silver',
                condition: 'NEW',
                bodyType: 'Sedan',
                type: PropertyType.SALE,
                description: 'The quickest acceleration of any vehicle in production. 0-60 mph in 1.99s. Full Self-Driving capability included.',
                features: 'Autopilot, Premium Audio, Panoramic Roof, Heated Seats',
                lat: 9.002,
                lng: 38.788,
                images: ['https://images.unsplash.com/photo-1617788138017-80ad42243c2d?q=80&w=2070&auto=format&fit=crop']
            },
            {
                agentId: agent2.id,
                title: '2023 Toyota Land Cruiser 300 VXR',
                image: 'https://images.unsplash.com/photo-1594568284297-7c64468d67b1?q=80&w=2070&auto=format&fit=crop',
                price: 125000,
                address: 'Old Airport Road',
                city: 'Addis Ababa',
                make: 'Toyota',
                model: 'Land Cruiser',
                year: 2023,
                mileage: 12000,
                transmission: 'AUTOMATIC',
                fuelType: 'DIESEL',
                color: 'Pearl White',
                condition: 'USED',
                bodyType: 'SUV',
                type: PropertyType.SALE,
                description: 'The ultimate 4x4. Excellent condition, fully serviced at Toyota. Features the new V6 twin-turbo engine.',
                features: '4WD, Leather Interior, Sunroof, Cool Box',
                lat: 9.006,
                lng: 38.732,
                images: ['https://images.unsplash.com/photo-1594568284297-7c64468d67b1?q=80&w=2070&auto=format&fit=crop']
            },
            {
                agentId: agent1.id,
                title: '2024 BMW M4 Competition',
                image: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?q=80&w=2070&auto=format&fit=crop',
                price: 150,
                address: 'Kazanchis Business Center',
                city: 'Addis Ababa',
                make: 'BMW',
                model: 'M4',
                year: 2024,
                mileage: 100,
                transmission: 'AUTOMATIC',
                fuelType: 'PETROL',
                color: 'Isle of Man Green',
                condition: 'NEW',
                bodyType: 'Coupe',
                type: PropertyType.RENT,
                rentCycle: 'DAILY',
                description: 'Experience pure driving pleasure. Available for daily rentals for special occasions or business trips.',
                features: 'Carbon Fiber Package, M-Sport Seats, Head-up Display',
                lat: 9.021,
                lng: 38.766,
                images: ['https://images.unsplash.com/photo-1617814076367-b759c7d7e738?q=80&w=2070&auto=format&fit=crop']
            },
            {
                agentId: agent4.id,
                title: '2022 Honda Civic Type R',
                image: 'https://images.unsplash.com/photo-1606148600133-c7520e588f0c?q=80&w=1974&auto=format&fit=crop',
                price: 45000,
                address: 'Sarbet Residential Zone',
                city: 'Addis Ababa',
                make: 'Honda',
                model: 'Civic',
                year: 2022,
                mileage: 25000,
                transmission: 'MANUAL',
                fuelType: 'PETROL',
                color: 'Championship White',
                condition: 'USED',
                bodyType: 'Sedan',
                type: PropertyType.SALE,
                description: 'A true enthusiast car. Meticulously maintained, one owner, no modifications.',
                features: 'Brembo Brakes, Sport Mode, Rear Wing, Buckets Seats',
                lat: 9.015,
                lng: 38.825,
                images: ['https://images.unsplash.com/photo-1606148600133-c7520e588f0c?q=80&w=1974&auto=format&fit=crop']
            },
            {
                agentId: agent2.id,
                title: '2023 Mercedes-Benz G63 AMG',
                image: 'https://images.unsplash.com/photo-1520031441872-265e4ff70366?q=80&w=1926&auto=format&fit=crop',
                price: 245000,
                address: 'Diplomatic Street',
                city: 'Addis Ababa',
                make: 'Mercedes-Benz',
                model: 'G-Class',
                year: 2023,
                mileage: 500,
                transmission: 'AUTOMATIC',
                fuelType: 'PETROL',
                color: 'Matte Black',
                condition: 'NEW',
                bodyType: 'SUV',
                type: PropertyType.SALE,
                description: 'The iconic G-Wagon in its most powerful AMG trim. Unmatched road presence and luxury.',
                features: 'Burmester Sound, Night Package, Carbon Interior',
                lat: 9.030,
                lng: 38.860,
                images: ['https://images.unsplash.com/photo-1520031441872-265e4ff70366?q=80&w=1926&auto=format&fit=crop']
            },
            {
                agentId: agent4.id,
                title: '2024 Ford F-150 Lightning',
                image: 'https://images.unsplash.com/photo-1669062369522-8051676f4e13?q=80&w=2070&auto=format&fit=crop',
                price: 120,
                address: 'South Africa Street',
                city: 'Addis Ababa',
                make: 'Ford',
                model: 'F-150',
                year: 2024,
                mileage: 1500,
                transmission: 'AUTOMATIC',
                fuelType: 'ELECTRIC',
                color: 'Iconic Silver',
                condition: 'NEW',
                bodyType: 'Truck',
                type: PropertyType.RENT,
                rentCycle: 'DAILY',
                description: 'The all-electric Ford truck. Perfect for moving gear or testing the future of pickups.',
                features: 'Large Screen, Pro Power Onboard, 4x4',
                lat: 9.002,
                lng: 38.745,
                images: ['https://images.unsplash.com/photo-1669062369522-8051676f4e13?q=80&w=2070&auto=format&fit=crop']
            }
        ];

        for (const prop of propertyData) {
            const existing = await Property.findOne({ where: { title: prop.title } });
            if (!existing) {
                await Property.create(prop as any);
            }
        }

        // Add Articles
        const existingArticle = await Article.findOne({ where: { title: 'Top 5 Tips for Buying a Used Car in 2024' } });
        if (!existingArticle) {
            await Article.create({
                title: 'Top 5 Tips for Buying a Used Car in 2024',
                excerpt: 'Essential advice for navigating the pre-owned vehicle market this year.',
                category: 'Car Buying Guide',
                date: new Date().toISOString().split('T')[0],
                content: 'Buying a used car can be a great way to save money, but it requires careful inspection. Always check the service history, look for signs of previous accidents, and test drive the vehicle in different conditions...',
                author: 'Auto Insider',
                image: 'https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&q=80&w=2000'
            });
        }

        console.log('Seed completed successfully!');
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seed();
