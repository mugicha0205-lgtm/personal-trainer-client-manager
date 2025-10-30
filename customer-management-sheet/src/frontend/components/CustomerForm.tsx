import React, { useState, useEffect } from 'react';
import { createCustomer, updateCustomer } from '../services/api';
import { Customer } from '../../types/customer';

interface CustomerFormProps {
  customer?: Customer;
  onSubmit: () => void;
}

const CustomerForm: React.FC<CustomerFormProps> = ({ customer, onSubmit }) => {
  const [name, setName] = useState<string>(customer ? customer.name : '');
  const [email, setEmail] = useState<string>(customer ? customer.email : '');
  const [phone, setPhone] = useState<string>(customer ? customer.phone : '');

  useEffect(() => {
    if (customer) {
      setName(customer.name);
      setEmail(customer.email);
      setPhone(customer.phone);
    }
  }, [customer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const customerData = { name, email, phone };

    if (customer) {
      await updateCustomer(customer.id, customerData);
    } else {
      await createCustomer(customerData);
    }

    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Name:</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Email:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Phone:</label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />
      </div>
      <button type="submit">{customer ? 'Update' : 'Add'} Customer</button>
    </form>
  );
};

export default CustomerForm;