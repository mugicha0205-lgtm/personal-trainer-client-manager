import React from 'react';
import { useParams } from 'react-router-dom';
import { Client } from '../types/client';
import { getClient } from '../services/api';

const ClientDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [client, setClient] = React.useState<Client | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        const fetchClient = async () => {
            try {
                const fetchedClient = await getClient(id);
                setClient(fetchedClient);
            } catch (err) {
                setError('Failed to fetch client details');
            } finally {
                setLoading(false);
            }
        };

        fetchClient();
    }, [id]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    if (!client) {
        return <div>No client found</div>;
    }

    return (
        <div>
            <h2>Client Details</h2>
            <p><strong>Name:</strong> {client.name}</p>
            <p><strong>Email:</strong> {client.email}</p>
            <p><strong>Phone:</strong> {client.phone}</p>
        </div>
    );
};

export default ClientDetails;