import React, { useState } from 'react';
import { Client } from '../types/client';
import { createClient, updateClient } from '../services/api';

interface ClientFormProps {
  client?: Client;
  onSubmit: () => void;
}

const ClientForm: React.FC<ClientFormProps> = ({ client, onSubmit }) => {
  const [name, setName] = useState(client ? client.name : '');
  const [email, setEmail] = useState(client ? client.email : '');
  const [phone, setPhone] = useState(client ? client.phone : '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clientData = { name, email, phone };

    if (client) {
      await updateClient(client.id, clientData);
    } else {
      await createClient(clientData);
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
      <button type="submit">{client ? 'Update Client' : 'Add Client'}</button>
    </form>
  );
};

export default ClientForm;