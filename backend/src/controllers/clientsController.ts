class ClientsController {
    constructor(private clientService: ClientService) {}

    async getClients(req, res) {
        try {
            const clients = await this.clientService.fetchClients();
            res.status(200).json(clients);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching clients', error });
        }
    }

    async getClientById(req, res) {
        const { id } = req.params;
        try {
            const client = await this.clientService.fetchClientById(id);
            if (client) {
                res.status(200).json(client);
            } else {
                res.status(404).json({ message: 'Client not found' });
            }
        } catch (error) {
            res.status(500).json({ message: 'Error fetching client', error });
        }
    }

    async createClient(req, res) {
        const clientData = req.body;
        try {
            const newClient = await this.clientService.addClient(clientData);
            res.status(201).json(newClient);
        } catch (error) {
            res.status(500).json({ message: 'Error creating client', error });
        }
    }

    async updateClient(req, res) {
        const { id } = req.params;
        const clientData = req.body;
        try {
            const updatedClient = await this.clientService.updateClient(id, clientData);
            if (updatedClient) {
                res.status(200).json(updatedClient);
            } else {
                res.status(404).json({ message: 'Client not found' });
            }
        } catch (error) {
            res.status(500).json({ message: 'Error updating client', error });
        }
    }

    async deleteClient(req, res) {
        const { id } = req.params;
        try {
            const deleted = await this.clientService.removeClient(id);
            if (deleted) {
                res.status(204).send();
            } else {
                res.status(404).json({ message: 'Client not found' });
            }
        } catch (error) {
            res.status(500).json({ message: 'Error deleting client', error });
        }
    }
}

export default ClientsController;