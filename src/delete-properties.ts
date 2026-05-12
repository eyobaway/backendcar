import sequelize from './config/database';
import { Property } from './models';

const deleteProperties = async () => {
    try {
        await sequelize.authenticate();
        
        // Destroy all records in the Property table
        await Property.destroy({
            where: {},
            truncate: true, // Optionally truncate instead of delete depending on FKs.
            cascade: true
        });

        console.log('Successfully deleted all seeded and existing properties!');
        process.exit(0);
    } catch (error) {
        console.error('Error deleting properties:', error);
        process.exit(1);
    }
};

deleteProperties();
