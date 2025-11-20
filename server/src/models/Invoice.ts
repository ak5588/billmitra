import { Schema, model, Types } from 'mongoose';

const lineItemSchema = new Schema({
  name: { type: String },
  quantity: { type: Number, default: 1 },
  price: { type: Number, default: 0 }
}, { _id: false });

const invoiceSchema = new Schema({
  user: { type: Types.ObjectId, ref: 'User', required: true },
  invoiceNumber: { type: String },
  companyName: { type: String },
  customerName: { type: String },
  customerAddress: { type: String },
  items: { type: [lineItemSchema], default: [] },
  taxRate: { type: Number, default: 0 },
  amount: { type: Number, default: 0 },
  taxAmount: { type: Number, default: 0 },
  date: { type: String },
  fileLink: { type: String },
}, { timestamps: true });

export const Invoice = model('Invoice', invoiceSchema);
