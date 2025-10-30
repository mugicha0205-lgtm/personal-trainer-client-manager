import { Router } from 'express';
import CustomersController from '../controllers/customersController';

const router = Router();
const customersController = new CustomersController();

export function setRoutes(app) {
    app.use('/api/customers', router);
    router.get('/', customersController.getAllCustomers.bind(customersController));
    router.get('/:id', customersController.getCustomerById.bind(customersController));
    router.post('/', customersController.createCustomer.bind(customersController));
    router.put('/:id', customersController.updateCustomer.bind(customersController));
    router.delete('/:id', customersController.deleteCustomer.bind(customersController));
}