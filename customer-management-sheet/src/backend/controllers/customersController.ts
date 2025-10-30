class CustomersController {
    constructor(private customerService: CustomerService) {}

    async getAllCustomers(req, res) {
        try {
            const customers = await this.customerService.getAllCustomers();
            res.status(200).json(customers);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async getCustomerById(req, res) {
        const { id } = req.params;
        try {
            const customer = await this.customerService.getCustomerById(id);
            if (customer) {
                res.status(200).json(customer);
            } else {
                res.status(404).json({ message: 'Customer not found' });
            }
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async createCustomer(req, res) {
        const customerData = req.body;
        try {
            const newCustomer = await this.customerService.createCustomer(customerData);
            res.status(201).json(newCustomer);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async updateCustomer(req, res) {
        const { id } = req.params;
        const customerData = req.body;
        try {
            const updatedCustomer = await this.customerService.updateCustomer(id, customerData);
            if (updatedCustomer) {
                res.status(200).json(updatedCustomer);
            } else {
                res.status(404).json({ message: 'Customer not found' });
            }
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async deleteCustomer(req, res) {
        const { id } = req.params;
        try {
            const deleted = await this.customerService.deleteCustomer(id);
            if (deleted) {
                res.status(204).send();
            } else {
                res.status(404).json({ message: 'Customer not found' });
            }
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}

export default CustomersController;