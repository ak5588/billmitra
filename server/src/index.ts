import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/auth';
import invoiceRoutes from './routes/invoice';
import { connectDB } from './config/db';
import path from 'path';

dotenv.config();

const app = express();
app.use(express.json({ limit: '10mb' }));

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';
app.use(cors({ origin: CLIENT_URL }));

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/billmitra';
connectDB(MONGO_URI).catch(err => console.error(err));

app.use('/auth', authRoutes);
app.use('/invoice', invoiceRoutes);

// Serve generated uploads (PDFs)
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.get('/', (req, res) => res.json({ message: 'BillMitra API' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
