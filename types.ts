export interface LineItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  companyName: string;
  companyLogo?: string;
  signature?: string;
  customerName: string;
  customerAddress: string;
  date: string;
  items: LineItem[];
  taxRate: number;
  taxAmount?: number;
  amount?: number;
  fileLink?: string;
}