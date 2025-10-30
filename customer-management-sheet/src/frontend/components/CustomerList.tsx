import React, { useEffect, useState } from 'react';
import { fetchCustomers } from '../services/api';
import { Customer } from '../../types/customer';

const CustomerList: React.FC = () => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadCustomers = async () => {
            try {
                const data = await fetchCustomers();
                setCustomers(data);
            } catch (err) {
                setError('Failed to fetch customers');
            } finally {
                setLoading(false);
            }
        };

        loadCustomers();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div>
            <h2>Customer List</h2>
            <ul>
                {customers.map(customer => (
                    <li key={customer.id}>
                        {customer.name} - {customer.email} - {customer.phone}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default CustomerList;