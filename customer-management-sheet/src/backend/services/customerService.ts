export class CustomerService {
    private customers: any[] = []; // This will hold the customer data temporarily

    public getAllCustomers(): any[] {
        return this.customers;
    }

    public getCustomerById(id: number): any | undefined {
        return this.customers.find(customer => customer.id === id);
    }

    public createCustomer(customerData: any): void {
        const newCustomer = { id: this.customers.length + 1, ...customerData };
        this.customers.push(newCustomer);
    }

    public updateCustomer(id: number, updatedData: any): boolean {
        const index = this.customers.findIndex(customer => customer.id === id);
        if (index !== -1) {
            this.customers[index] = { ...this.customers[index], ...updatedData };
            return true;
        }
        return false;
    }

    public deleteCustomer(id: number): boolean {
        const index = this.customers.findIndex(customer => customer.id === id);
        if (index !== -1) {
            this.customers.splice(index, 1);
            return true;
        }
        return false;
    }
}