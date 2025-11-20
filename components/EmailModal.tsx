import React, { useState, useEffect } from 'react';
import type { Invoice } from '../types';

interface EmailModalProps {
    invoice: Invoice;
    onClose: () => void;
    onSend: (to: string, subject: string, body: string) => Promise<void>;
}

export const EmailModal: React.FC<EmailModalProps> = ({ invoice, onClose, onSend }) => {
    const [to, setTo] = useState('');
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [isSending, setIsSending] = useState(false);

    useEffect(() => {
        setSubject(`Invoice ${invoice.invoiceNumber} from ${invoice.companyName}`);
        setBody(
`Hello ${invoice.customerName},

Please find attached your invoice (${invoice.invoiceNumber}).

Let us know if you have any questions.

Thank you for your business!

Best regards,
${invoice.companyName}`
        );
    }, [invoice]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!to || isSending) return;
        setIsSending(true);
        await onSend(to, subject, body);
        setIsSending(false);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg animate-fade-in-up" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b dark:border-gray-700">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Email Invoice</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            This will download the PDF and open your default email client.
                        </p>
                    </div>
                    <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                        <div>
                            <label htmlFor="to-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Recipient Email</label>
                            <input
                                type="email"
                                id="to-email"
                                value={to}
                                onChange={e => setTo(e.target.value)}
                                required
                                placeholder="customer@example.com"
                                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                            />
                        </div>
                        <div>
                            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Subject</label>
                            <input
                                type="text"
                                id="subject"
                                value={subject}
                                onChange={e => setSubject(e.target.value)}
                                required
                                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                            />
                        </div>
                        <div>
                            <label htmlFor="body" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Body</label>
                            <textarea
                                id="body"
                                value={body}
                                onChange={e => setBody(e.target.value)}
                                required
                                rows={8}
                                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm whitespace-pre-line"
                            />
                        </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 flex justify-end items-center gap-3 rounded-b-lg">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!to || isSending}
                            className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md shadow-sm hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-dark disabled:bg-primary/50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isSending ? 'Preparing...' : 'Prepare & Send'}
                        </button>
                    </div>
                </form>
            </div>
             <style>{`
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
};