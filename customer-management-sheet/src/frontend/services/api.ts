import axios from 'axios';
import { Customer } from '../../types/customer';

const API_URL = 'http://localhost:5000/api/customers';

export const fetchCustomers = async (): Promise<Customer[]> => {
    const response = await axios.get(API_URL);
    return response.data;
};

export const createCustomer = async (customer: Customer): Promise<Customer> => {
    const response = await axios.post(API_URL, customer);
    return response.data;
};

export const updateCustomer = async (id: string, customer: Customer): Promise<Customer> => {
    const response = await axios.put(`${API_URL}/${id}`, customer);
    return response.data;
};

export const deleteCustomer = async (id: string): Promise<void> => {
    await axios.delete(`${API_URL}/${id}`);
};