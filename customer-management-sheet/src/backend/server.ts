import express from 'express';
import mongoose from 'mongoose';
import { setRoutes } from './routes/customersRoutes';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

mongoose.connect('mongodb://localhost:27017/customer_management', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log('Connected to the database');
})
.catch(err => {
    console.error('Database connection error:', err);
});

setRoutes(app);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});