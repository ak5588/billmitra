import React from 'react';
import type { Invoice, LineItem } from '../types';

interface InvoiceFormProps {
    invoice: Invoice;
    onInvoiceChange: <K extends keyof Invoice>(key: K, value: Invoice[K]) => void;
    onItemChange: (index: number, updatedItem: LineItem) => void;
    onAddItem: () => void;
    onRemoveItem: (index: number) => void;
    subtotal: number;
    taxAmount: number;
    total: number;
}

const InputField: React.FC<{label: string, value: string | number, onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void, type?: string, placeholder?: string, isTextArea?: boolean}> = ({ label, value, onChange, type = 'text', placeholder, isTextArea=false }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
        {isTextArea ? (
             <textarea value={value} onChange={onChange} placeholder={placeholder} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" rows={3}/>
        ) : (
             <input type={type} value={value} onChange={onChange} placeholder={placeholder} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
        )}
    </div>
);

export const InvoiceForm: React.FC<InvoiceFormProps> = ({ invoice, onInvoiceChange, onItemChange, onAddItem, onRemoveItem, subtotal, taxAmount, total }) => {
    
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'companyLogo' | 'signature') => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                onInvoiceChange(field, reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };
    
    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg space-y-6">
            <h2 className="text-xl font-semibold border-b dark:border-gray-700 pb-4">Invoice Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField label="Invoice No." value={invoice.invoiceNumber} onChange={e => onInvoiceChange('invoiceNumber', e.target.value)} />
                <InputField label="Date" type="date" value={invoice.date} onChange={e => onInvoiceChange('date', e.target.value)} />
            </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Your Company Logo</label>
                    <div className="mt-1 flex items-center space-x-4">
                        {invoice.companyLogo ? (
                            <div className="flex items-center space-x-2">
                                 <img src={invoice.companyLogo} alt="Company Logo" className="h-16 w-16 object-contain rounded-md bg-gray-100 p-1" />
                                 <button onClick={() => onInvoiceChange('companyLogo', undefined)} className="text-sm text-red-500 hover:text-red-700">Remove</button>
                            </div>
                        ) : (
                            <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'companyLogo')} className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary-dark hover:file:bg-primary/20" />
                        )}
                    </div>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Your E-Signature</label>
                    <div className="mt-1 flex items-center space-x-4">
                        {invoice.signature ? (
                            <div className="flex items-center space-x-2">
                                 <img src={invoice.signature} alt="E-Signature" className="h-16 w-16 object-contain rounded-md bg-gray-100 p-1" />
                                 <button onClick={() => onInvoiceChange('signature', undefined)} className="text-sm text-red-500 hover:text-red-700">Remove</button>
                            </div>
                        ) : (
                            <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'signature')} className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary-dark hover:file:bg-primary/20" />
                        )}
                    </div>
                </div>
            </div>

            <InputField label="Your Company Name" value={invoice.companyName} onChange={e => onInvoiceChange('companyName', e.target.value)} />
            <InputField label="Customer Name" value={invoice.customerName} onChange={e => onInvoiceChange('customerName', e.target.value)} />
            <InputField label="Customer Address" value={invoice.customerAddress} onChange={e => onInvoiceChange('customerAddress', e.target.value)} isTextArea={true} />

            <div className="border-t dark:border-gray-700 pt-6">
                <h3 className="text-lg font-semibold mb-4">Items</h3>
                <div className="space-y-4">
                    {invoice.items.map((item, index) => (
                        <div key={item.id} className="grid grid-cols-12 gap-x-2 gap-y-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md border dark:border-gray-600">
                            <input type="text" placeholder="Item Name" value={item.name} onChange={e => onItemChange(index, {...item, name: e.target.value})} className="col-span-12 sm:col-span-4 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                            <input type="number" placeholder="Qty" value={item.quantity} onChange={e => onItemChange(index, {...item, quantity: parseFloat(e.target.value) || 0})} className="col-span-4 sm:col-span-2 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                            <input type="number" placeholder="Price" value={item.price} onChange={e => onItemChange(index, {...item, price: parseFloat(e.target.value) || 0})} className="col-span-4 sm:col-span-3 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                            <div className="col-span-2 sm:col-span-2 flex items-center justify-end font-medium">₹{(item.quantity * item.price).toFixed(2)}</div>
                            <div className="col-span-2 sm:col-span-1 flex items-center justify-center">
                                <button onClick={() => onRemoveItem(index)} className="text-gray-400 hover:text-red-500 p-1 rounded-full transition-colors hover:bg-red-100 dark:hover:bg-red-900/50">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.033-2.134H8.71c-1.123 0-2.033.954-2.033 2.134v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                <button onClick={onAddItem} className="mt-4 w-full bg-primary-light/50 hover:bg-primary-light text-primary-dark font-bold py-2 px-4 rounded-lg transition duration-200">
                    + Add Item
                </button>
            </div>

            <div className="border-t dark:border-gray-700 pt-6 space-y-4">
                 <h3 className="text-lg font-semibold">Totals</h3>
                 <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-300">Tax Rate (%)</span>
                    <input type="number" value={invoice.taxRate} onChange={e => onInvoiceChange('taxRate', parseFloat(e.target.value) || 0)} className="w-24 px-3 py-2 text-right bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                 </div>
                 <div className="flex justify-between items-center text-gray-700 dark:text-gray-300">
                     <span>Subtotal</span>
                     <span>₹{subtotal.toFixed(2)}</span>
                 </div>
                 <div className="flex justify-between items-center text-gray-700 dark:text-gray-300">
                     <span>Tax</span>
                     <span>₹{taxAmount.toFixed(2)}</span>
                 </div>
                 <div className="flex justify-between items-center font-bold text-xl text-gray-900 dark:text-white border-t dark:border-gray-600 pt-2 mt-2">
                     <span>Total</span>
                     <span>₹{total.toFixed(2)}</span>
                 </div>
            </div>
        </div>
    );
};