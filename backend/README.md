# Personal Trainer Client Manager - Backend

This is the backend part of the Personal Trainer Client Manager application. It is built using TypeScript and Node.js, providing a RESTful API for managing clients.

## Features

- **Client Management**: Create, read, update, and delete client information.
- **Database Integration**: Connects to a database to store client data.
- **Modular Structure**: Organized into controllers, routes, models, and services for better maintainability.

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- TypeScript
- A database (e.g., MongoDB, PostgreSQL)

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Navigate to the backend directory:
   ```
   cd personal-trainer-client-manager/backend
   ```
3. Install dependencies:
   ```
   npm install
   ```

### Running the Application

To start the backend server, run:
```
npm start
```

### API Endpoints

- `GET /clients`: Retrieve a list of clients.
- `GET /clients/:id`: Retrieve a specific client by ID.
- `POST /clients`: Create a new client.
- `PUT /clients/:id`: Update an existing client.
- `DELETE /clients/:id`: Delete a client.

## Folder Structure

- **src**: Contains the source code for the backend.
  - **controllers**: Logic for handling client-related requests.
  - **routes**: Defines the API routes.
  - **models**: Defines the data structure for clients.
  - **services**: Contains business logic for client operations.
  - **db**: Database connection and configuration.

## License

This project is licensed under the MIT License. See the LICENSE file for details.