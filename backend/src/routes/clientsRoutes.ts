import { Router } from 'express';
import ClientsController from '../controllers/clientsController';

const router = Router();
const clientsController = new ClientsController();

export const setClientsRoutes = () => {
    router.get('/clients', clientsController.getClients.bind(clientsController));
    router.get('/clients/:id', clientsController.getClientById.bind(clientsController));
    router.post('/clients', clientsController.createClient.bind(clientsController));
    router.put('/clients/:id', clientsController.updateClient.bind(clientsController));
    router.delete('/clients/:id', clientsController.deleteClient.bind(clientsController));

    return router;
};