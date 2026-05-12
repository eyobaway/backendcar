import sequelize from '../src/config/database';
import { Agent } from '../src/models';

async function activateAgents() {
    try {
        await sequelize.authenticate();
        const count = await Agent.update({ isActive: true }, { where: {} });
        console.log(`Successfully activated ${count[0]} agents.`);
        process.exit(0);
    } catch (error) {
        console.error('Error activating agents:', error);
        process.exit(1);
    }
}

activateAgents();
