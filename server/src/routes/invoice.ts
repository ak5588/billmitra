import { Router, Response } from 'express';
import { Invoice } from '../models/Invoice';
import { generateInvoicePdf } from '../utils/pdf';
import path from 'path';
import fs from 'fs';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';
import mongoose from 'mongoose';

const router = Router();

router.post('/create', authMiddleware, async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });
  try {
    const payload: any = req.body;
    // Remove any client-side id to avoid Mongoose attempting to cast it to _id
    delete payload.id;
    delete payload._id;
    payload.user = new mongoose.Types.ObjectId(userId);

    // compute amounts server-side to avoid client inconsistencies
    const subtotal = Array.isArray(payload.items) ? payload.items.reduce((acc: number, it: any) => acc + (Number(it.quantity) || 0) * (Number(it.price) || 0), 0) : 0;
    const taxAmount = subtotal * ((Number(payload.taxRate) || 0) / 100);
    const total = subtotal + taxAmount;
    payload.amount = total;
    payload.taxAmount = taxAmount;

    const invoice = new Invoice(payload);
    await invoice.save();

    // generate PDF and set static file link
    try {
      const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
      fs.mkdirSync(uploadsDir, { recursive: true });
      const pdfPath = path.join(uploadsDir, `invoice-${invoice._id}.pdf`);
      await generateInvoicePdf({ ...invoice.toObject() }, pdfPath);
      const host = req.get('host');
      invoice.fileLink = `${req.protocol}://${host}/uploads/invoice-${invoice._id}.pdf`;
      await invoice.save();
    } catch (err) {
      console.error('PDF generation failed', err);
    }

    res.json(invoice);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update an existing invoice (replace fields)
router.put('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  const { id } = req.params;
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });
  try {
    const invoice = await Invoice.findById(id);
    if (!invoice) return res.status(404).json({ message: 'Not found' });
    if (invoice.user.toString() !== userId) return res.status(403).json({ message: 'Forbidden' });

    const payload: any = req.body;
    // compute amounts
    const subtotal = Array.isArray(payload.items) ? payload.items.reduce((acc: number, it: any) => acc + (Number(it.quantity) || 0) * (Number(it.price) || 0), 0) : 0;
    const taxAmount = subtotal * ((Number(payload.taxRate) || 0) / 100);
    const total = subtotal + taxAmount;

    // overwrite fields allowed
    invoice.invoiceNumber = payload.invoiceNumber ?? invoice.invoiceNumber;
    invoice.companyName = payload.companyName ?? invoice.companyName;
    invoice.customerName = payload.customerName ?? invoice.customerName;
    invoice.customerAddress = payload.customerAddress ?? invoice.customerAddress;
    invoice.items = payload.items ?? invoice.items;
    invoice.taxRate = payload.taxRate ?? invoice.taxRate;
    invoice.amount = total;
    invoice.taxAmount = taxAmount;
    invoice.date = payload.date ?? invoice.date;

    // generate updated PDF and set static file link
    try {
      const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
      fs.mkdirSync(uploadsDir, { recursive: true });
      const pdfPath = path.join(uploadsDir, `invoice-${invoice._id}.pdf`);
      await generateInvoicePdf({ ...invoice.toObject() }, pdfPath);
      const host = req.get('host');
      invoice.fileLink = `${req.protocol}://${host}/uploads/invoice-${invoice._id}.pdf`;
    } catch (err) {
      console.error('PDF generation failed', err);
    }

    await invoice.save();
    res.json(invoice);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Download invoice JSON as attachment
router.get('/:id/download', authMiddleware, async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  const { id } = req.params;
  try {
    const invoice = await Invoice.findById(id);
    if (!invoice) return res.status(404).json({ message: 'Not found' });
    if (invoice.user.toString() !== userId) return res.status(403).json({ message: 'Forbidden' });
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="invoice-${invoice.invoiceNumber || id}.json"`);
    res.send(JSON.stringify(invoice.toObject(), null, 2));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/all', authMiddleware, async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });
  try {
    const invoices = await Invoice.find({ user: userId }).sort({ createdAt: -1 });
    res.json(invoices);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  const { id } = req.params;
  try {
    const invoice = await Invoice.findById(id);
    if (!invoice) return res.status(404).json({ message: 'Not found' });
    if (invoice.user.toString() !== userId) return res.status(403).json({ message: 'Forbidden' });
    res.json(invoice);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  const { id } = req.params;
  try {
    const invoice = await Invoice.findById(id);
    if (!invoice) return res.status(404).json({ message: 'Not found' });
    if (invoice.user.toString() !== userId) return res.status(403).json({ message: 'Forbidden' });
    await invoice.deleteOne();
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
