# Personal Trainer Client Manager - Frontend

This project is a frontend application for managing personal trainer clients. It allows trainers to view, add, edit, and delete client information through a user-friendly interface.

## Project Structure

- **src/**: Contains the source code for the frontend application.
  - **index.tsx**: Entry point for the application.
  - **App.tsx**: Main application component that manages routing and state.
  - **components/**: Contains reusable components for the application.
    - **ClientList.tsx**: Displays a list of clients.
    - **ClientForm.tsx**: Form for adding or editing client information.
    - **ClientDetails.tsx**: Displays detailed information about a selected client.
  - **services/**: Contains API service functions for backend communication.
    - **api.ts**: Functions for making API calls to the backend.
  - **types/**: TypeScript interfaces and types.
    - **client.ts**: Defines the structure of a client object.

## Getting Started

1. **Installation**: 
   - Navigate to the `frontend` directory.
   - Run `npm install` to install the necessary dependencies.

2. **Running the Application**: 
   - Use `npm start` to start the development server.
   - Open your browser and go to `http://localhost:3000` to view the application.

## Features

- View a list of clients.
- Add new clients or edit existing client information.
- View detailed information about each client.

## Technologies Used

- React
- TypeScript
- Axios (for API calls)

## Contributing

If you would like to contribute to this project, please fork the repository and submit a pull request with your changes.