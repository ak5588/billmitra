import React from 'react';
import type { Invoice } from '../types';

interface InvoicePreviewProps {
  invoice: Invoice;
  template: 'modern' | 'clean' | 'professional' | 'creative' | 'minimalist';
  subtotal: number;
  taxAmount: number;
  total: number;
}

const templates = {
  modern: {
    bg: 'bg-white',
    headerBg: 'bg-blue-600',
    headerText: 'text-white',
    tableHeaderBg: 'bg-blue-100',
    borderColor: 'border-blue-100',
    accentColor: 'text-blue-600'
  },
  clean: {
    bg: 'bg-white',
    headerBg: 'bg-gray-100',
    headerText: 'text-gray-800',
    tableHeaderBg: 'bg-gray-200',
    borderColor: 'border-gray-200',
    accentColor: 'text-orange-500'
  },
  professional: {
    bg: 'bg-white',
    headerBg: 'bg-gray-800',
    headerText: 'text-white',
    tableHeaderBg: 'bg-gray-200',
    borderColor: 'border-gray-300',
    accentColor: 'text-gray-800'
  },
  creative: {
    bg: 'bg-white',
    headerBg: 'bg-teal-500',
    headerText: 'text-white',
    tableHeaderBg: 'bg-teal-100',
    borderColor: 'border-teal-200',
    accentColor: 'text-teal-600'
  },
  minimalist: {
    bg: 'bg-white',
    headerBg: 'bg-white',
    headerText: 'text-gray-800',
    tableHeaderBg: 'bg-white border-b-2 border-gray-800',
    borderColor: 'border-gray-200',
    accentColor: 'text-gray-800'
  }
};

export const InvoicePreview: React.FC<InvoicePreviewProps> = ({ invoice, template, subtotal, taxAmount, total }) => {
    const styles = templates[template];
  
    return (
        <div className={`p-4 sm:p-8 ${styles.bg} text-gray-900 font-sans`}>
            <header className={`${styles.headerBg} ${styles.headerText} p-4 sm:p-8 rounded-t-lg`}>
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div className="flex items-center gap-4">
                        {invoice.companyLogo && (
                            <img src={invoice.companyLogo} alt="Company Logo" className="h-14 w-14 sm:h-16 sm:w-16 object-contain rounded-md bg-white p-1" />
                        )}
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold">{invoice.companyName}</h1>
                            <p>Invoice</p>
                        </div>
                    </div>
                    <div className="text-left sm:text-right w-full sm:w-auto">
                        <p className="font-semibold text-lg">#{invoice.invoiceNumber}</p>
                        <p>Date: {invoice.date}</p>
                    </div>
                </div>
            </header>

            <section className="p-4 sm:p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h2 className={`font-semibold mb-2 ${styles.accentColor}`}>Bill To:</h2>
                        <p className="font-bold">{invoice.customerName}</p>
                        <p className="text-gray-600 whitespace-pre-line">{invoice.customerAddress}</p>
                    </div>
                </div>
            </section>

            <section className="px-4 sm:px-8">
                <table className="w-full text-left text-sm">
                    <thead className={`${styles.tableHeaderBg}`}>
                        <tr>
                            <th className="p-3 font-semibold text-gray-800">Item</th>
                            <th className="p-3 font-semibold text-gray-800 text-center hidden sm:table-cell">Qty</th>
                            <th className="p-3 font-semibold text-gray-800 text-right hidden sm:table-cell">Price</th>
                            <th className="p-3 font-semibold text-gray-800 text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoice.items.map((item, index) => (
                            <tr key={item.id || index} className={`border-b ${styles.borderColor}`}>
                                <td className="p-3 text-gray-800">
                                    {item.name || 'Untitled Item'}
                                    <div className="sm:hidden text-xs text-gray-500 mt-1">
                                        {item.quantity} x ₹{item.price.toFixed(2)}
                                    </div>
                                </td>
                                <td className="p-3 text-center text-gray-800 hidden sm:table-cell">{item.quantity}</td>
                                <td className="p-3 text-right text-gray-800 hidden sm:table-cell">₹{item.price.toFixed(2)}</td>
                                <td className="p-3 text-right text-gray-800 font-medium">₹{(item.quantity * item.price).toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>

            <section className="p-4 sm:p-8 flex justify-end">
                <div className="w-full md:w-2/3 lg:w-2/5 space-y-2">
                    <div className="flex justify-between">
                        <span className="text-gray-600">Subtotal:</span>
                        <span className="text-gray-800">₹{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Tax ({invoice.taxRate}%):</span>
                        <span className="text-gray-800">₹{taxAmount.toFixed(2)}</span>
                    </div>
                    <div className={`flex justify-between font-bold text-lg border-t ${styles.borderColor} pt-2 mt-2 ${styles.accentColor}`}>
                        <span>Total:</span>
                        <span>₹{total.toFixed(2)}</span>
                    </div>
                </div>
            </section>

             <section className="px-4 sm:px-8 mt-12 flex justify-end">
                <div className="w-full md:w-1/2 lg:w-1/3 text-center">
                    {invoice.signature && (
                        <div className="mb-4">
                            <img src={invoice.signature} alt="E-Signature" className="h-16 mx-auto object-contain" />
                        </div>
                    )}
                    <div className={`border-t-2 ${styles.borderColor} pt-2`}>
                        <p className="font-bold">{invoice.companyName}</p>
                        <p className="text-sm text-gray-600">(Authorized Signature)</p>
                    </div>
                </div>
            </section>
            
            <footer className="px-4 sm:px-8 py-4 mt-8 border-t text-center text-gray-500 text-sm">
                <p>Thank you for your business!</p>
            </footer>
        </div>
    );
};