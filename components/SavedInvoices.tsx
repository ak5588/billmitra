import React from 'react';
import type { Invoice } from '../types';

interface SavedInvoicesProps {
  invoices: Invoice[];
  onLoad: (id: string) => void;
  onDelete: (id: string) => void;
}

export const SavedInvoices: React.FC<SavedInvoicesProps> = ({ invoices, onLoad, onDelete }) => {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6 border-b dark:border-gray-700 pb-4">Saved Invoices</h2>
      <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-lg">
        {invoices.length === 0 ? (
          <div className="text-center py-12">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-gray-400 mx-auto">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">No invoices found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by creating a new invoice.</p>
          </div>
        ) : (
          <ul className="space-y-4">
            {invoices.map(invoice => (
              <li key={invoice.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all shadow-sm hover:shadow-md hover:border-primary/50">
                <div className="flex items-center gap-4">
                    <div className="hidden sm:block p-3 bg-primary/10 rounded-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-primary">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                        </svg>
                    </div>
                    <div className="flex-grow">
                      <p className="font-semibold text-primary">{invoice.invoiceNumber}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        For: <span className="font-medium text-gray-800 dark:text-gray-200">{invoice.customerName}</span>
                      </p>
                       <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        Date: <span className="font-mono">{invoice.date}</span>
                      </p>
                    </div>
                </div>
                <div className="flex space-x-2 mt-4 sm:mt-0 self-end sm:self-center">
                  <button 
                    onClick={() => onLoad(invoice.id)} 
                    className="px-3 py-1 text-sm font-medium text-blue-700 bg-blue-100 rounded-full hover:bg-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:hover:bg-blue-900 transition"
                  >
                    Load
                  </button>
                    <a href={invoice.fileLink || '#'} target="_blank" rel="noreferrer" className={`px-3 py-1 text-sm font-medium ${invoice.fileLink ? 'text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-900/50 dark:text-gray-300' : 'text-gray-300 bg-gray-50 cursor-not-allowed' } rounded-full transition`}>Download</a>
                    <button 
                      onClick={() => onDelete(invoice.id)} 
                      className="px-3 py-1 text-sm font-medium text-red-700 bg-red-100 rounded-full hover:bg-red-200 dark:bg-red-900/50 dark:text-red-300 dark:hover:bg-red-900 transition"
                    >
                      Delete
                    </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};