import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/auth';
import invoiceRoutes from './routes/invoice';
import { connectDB } from './config/db';
import path from 'path';

dotenv.config();

const app = express();

// ✔ Enable JSON & URL encoded body parsing (required for signup)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ✔ CORS FIX — allow your frontend in production
app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://billmitra.onrender.com"   // your live frontend
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

// ✔ Connect to MongoDB Atlas
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/billmitra';
connectDB(MONGO_URI).catch(err => console.error("MongoDB connection error:", err));

// ✔ Routes
app.use('/auth', authRoutes);
app.use('/invoice', invoiceRoutes);

// ✔ Serve uploaded PDFs
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// ✔ Default test route
app.get('/', (req, res) => res.json({ message: 'BillMitra API Running' }));

// ✔ Correct PORT setup for Render
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
