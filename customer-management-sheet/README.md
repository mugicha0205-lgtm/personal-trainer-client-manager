# Customer Management Sheet

This project is a customer management application designed for personal trainers to manage their clients effectively. It consists of a backend built with TypeScript and Express, and a frontend built with React.

## Project Structure

```
customer-management-sheet
├── src
│   ├── backend
│   │   ├── server.ts                # Entry point for the backend application
│   │   ├── controllers
│   │   │   └── customersController.ts # Handles customer-related requests
│   │   ├── models
│   │   │   └── customer.ts           # Defines the structure of a customer object
│   │   ├── routes
│   │   │   └── customersRoutes.ts    # Defines routes for customer operations
│   │   └── services
│   │       └── customerService.ts    # Interacts with customer data
│   ├── frontend
│   │   ├── index.tsx                 # Entry point for the frontend application
│   │   ├── App.tsx                   # Main component managing routing and state
│   │   ├── components
│   │   │   ├── CustomerList.tsx      # Displays a list of customers
│   │   │   └── CustomerForm.tsx      # Allows adding or editing customer information
│   │   └── services
│   │       └── api.ts                # Functions for making API calls to the backend
│   └── types
│       └── customer.d.ts             # TypeScript interfaces for customer data
├── package.json                       # npm configuration file
├── tsconfig.json                      # TypeScript configuration file
├── .gitignore                         # Specifies files to ignore by Git
└── README.md                          # Project documentation
```

## Features

- **Customer Management**: Add, edit, delete, and view customer information.
- **Responsive Design**: The frontend is designed to be user-friendly and responsive.
- **Type Safety**: TypeScript is used throughout the application to ensure type safety.

## Getting Started

1. Clone the repository:
   ```
   git clone <repository-url>
   ```

2. Navigate to the project directory:
   ```
   cd customer-management-sheet
   ```

3. Install dependencies:
   ```
   npm install
   ```

4. Start the backend server:
   ```
   npm run start:backend
   ```

5. Start the frontend application:
   ```
   npm run start:frontend
   ```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the MIT License.