import React, { useEffect, useState } from 'react';
import { fetchClients } from '../services/api';
import { Client } from '../types/client';

const ClientList: React.FC = () => {
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadClients = async () => {
            try {
                const clientsData = await fetchClients();
                setClients(clientsData);
            } catch (err) {
                setError('Failed to load clients');
            } finally {
                setLoading(false);
            }
        };

        loadClients();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div>
            <h2>Client List</h2>
            <ul>
                {clients.map(client => (
                    <li key={client.id}>
                        {client.name} - {client.email}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ClientList;