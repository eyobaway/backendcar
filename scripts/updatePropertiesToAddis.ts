import dotenv from 'dotenv';
dotenv.config();

import sequelize from '../src/config/database';
import User from '../src/models/User';
import Agent from '../src/models/Agent';
import Property from '../src/models/Property';

const updateProperties = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        const targetUserId = '2975c681-59aa-4a2b-aae9-5e8facbe655c';
        const fallbackEmail = 'admin@ptgr.com';
        
        // 1. Find the agent for the target user
        let agent = await Agent.findOne({ where: { userId: targetUserId } });
        
        if (!agent) {
            console.log(`Agent not found for userId: ${targetUserId}. Trying fallback email: ${fallbackEmail}`);
            const user = await User.findOne({ where: { email: fallbackEmail } });
            if (user) {
                agent = await Agent.findOne({ where: { userId: user.id } });
            }
        }

        if (!agent) {
            console.error('Target Agent not found. Please ensure an agent profile exists for the specified user or admin@ptgr.com');
            process.exit(1);
        }

        console.log(`Found Target Agent: ${agent.id} (associated with userId: ${agent.userId})`);

        const prefix = 'Stunning vehicle located in the heart of Addis Ababa. ';

        // 2. Update all properties
        const [updatedCount] = await Property.update({
            agentId: agent.id,
            city: 'Addis Ababa',
            address: 'Bole Road, Addis Ababa, Ethiopia',
            lat: sequelize.literal('9.0192 + (RAND() * 0.05 - 0.025)'),
            lng: sequelize.literal('38.7525 + (RAND() * 0.05 - 0.025)'),
            // Clean up both old "property" prefix and new "vehicle" prefix if already added
            description: sequelize.fn('REPLACE', 
                sequelize.fn('REPLACE', sequelize.col('description'), 'Stunning property located in the heart of Addis Ababa. ', ''),
                prefix, ''
            )
        }, {
            where: {} 
        });

        // Add the prefix once fresh to avoid duplication, handling NULL descriptions correctly
        await Property.update({
            description: sequelize.fn('CONCAT', prefix, sequelize.fn('IFNULL', sequelize.col('description'), ''))
        }, {
            where: { agentId: agent.id }
        });

        console.log(`Successfully updated ${updatedCount} vehicles to Addis Ababa and reassigned to Agent ${agent.id}`);
        process.exit(0);

    } catch (error) {
        console.error('Failed to update vehicles:', error);
        process.exit(1);
    }
};

updateProperties();
