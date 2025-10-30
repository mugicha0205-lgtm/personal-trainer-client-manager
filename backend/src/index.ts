import express from 'express';
import { json } from 'body-parser';
import { setClientsRoutes } from './routes/clientsRoutes';
import { connectToDatabase } from './db';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(json());

connectToDatabase()
  .then(() => {
    console.log('Database connected successfully');
    setClientsRoutes(app);
    
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('Database connection failed:', err);
  });