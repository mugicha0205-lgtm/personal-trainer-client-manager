import { Client } from '../backend/src/models/client';
import { connectToDatabase } from '../backend/src/db/index';

const seedClients = async () => {
    const clients: Client[] = [
        { id: 1, name: 'John Doe', email: 'john@example.com', phone: '123-456-7890' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', phone: '987-654-3210' },
        { id: 3, name: 'Alice Johnson', email: 'alice@example.com', phone: '555-555-5555' },
    ];

    const db = await connectToDatabase();

    try {
        await db.collection('clients').deleteMany({}); // Clear existing clients
        await db.collection('clients').insertMany(clients); // Insert new clients
        console.log('Database seeded with initial client data.');
    } catch (error) {
        console.error('Error seeding database:', error);
    } finally {
        await db.close();
    }
};

seedClients();