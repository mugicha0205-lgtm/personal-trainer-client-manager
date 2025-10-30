export class ClientService {
    private clients: any[] = []; // This will hold the client data

    fetchClients(): any[] {
        return this.clients;
    }

    fetchClientById(id: string): any | undefined {
        return this.clients.find(client => client.id === id);
    }

    addClient(client: any): void {
        this.clients.push(client);
    }

    updateClient(id: string, updatedClient: any): boolean {
        const index = this.clients.findIndex(client => client.id === id);
        if (index !== -1) {
            this.clients[index] = { ...this.clients[index], ...updatedClient };
            return true;
        }
        return false;
    }

    removeClient(id: string): boolean {
        const index = this.clients.findIndex(client => client.id === id);
        if (index !== -1) {
            this.clients.splice(index, 1);
            return true;
        }
        return false;
    }
}