import React, { useState, useRef, useCallback, useEffect } from 'react';
import type { Invoice, LineItem } from './types';
import { InvoiceForm } from './components/InvoiceForm';
import { InvoicePreview } from './components/InvoicePreview';
import { SavedInvoices } from './components/SavedInvoices';
import { Login } from './components/Login';
import { EmailModal } from './components/EmailModal';
import { useLocalStorage } from './hooks/useLocalStorage';
import { API_URL } from "./api/config";
import { LOCAL_STORAGE_KEY_TOKEN } from './constants';
import { 
    LOCAL_STORAGE_KEY_INVOICES, 
    LOCAL_STORAGE_KEY_LOGO,
    LOCAL_STORAGE_KEY_SIGNATURE,
    LOCAL_STORAGE_KEY_THEME,
    LOCAL_STORAGE_KEY_COMPANY_NAME,
    SESSION_STORAGE_KEY_USER
} from './constants';
import html2canvas from 'html2canvas';


type Template = 'modern' | 'clean' | 'professional' | 'creative' | 'minimalist';
type View = 'creator' | 'saved';
type MobileView = 'form' | 'preview';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<string | null>(() => sessionStorage.getItem(SESSION_STORAGE_KEY_USER));

  // Namespaced keys for multi-user support
  const INVOICES_KEY = `${currentUser}_${LOCAL_STORAGE_KEY_INVOICES}`;
  const LOGO_KEY = `${currentUser}_${LOCAL_STORAGE_KEY_LOGO}`;
  const SIGNATURE_KEY = `${currentUser}_${LOCAL_STORAGE_KEY_SIGNATURE}`;
  const COMPANY_NAME_KEY = `${currentUser}_${LOCAL_STORAGE_KEY_COMPANY_NAME}`;
  const THEME_KEY = `${currentUser}_${LOCAL_STORAGE_KEY_THEME}`;
  
  const [companyLogo, setCompanyLogo] = useLocalStorage<string | undefined>(LOGO_KEY, undefined);
  const [companySignature, setCompanySignature] = useLocalStorage<string | undefined>(SIGNATURE_KEY, undefined);
  const [companyName, setCompanyName] = useLocalStorage<string>(COMPANY_NAME_KEY, 'Your Company LLC');

  const getInitialInvoiceState = useCallback((): Invoice => ({
      id: Date.now().toString(),
      invoiceNumber: 'INV-001',
      companyName: companyName,
      companyLogo: companyLogo,
      signature: companySignature,
      customerName: 'Customer Name',
      customerAddress: '123 Customer Street, City, State, 12345',
      date: new Date().toISOString().split('T')[0],
      items: [{ id: Date.now().toString(), name: 'Sample Item', quantity: 1, price: 100 }],
      taxRate: 5,
  }), [companyName, companyLogo, companySignature]);

  const [invoice, setInvoice] = useState<Invoice>(getInitialInvoiceState);
  const [savedInvoices, setSavedInvoices] = React.useState<Invoice[]>([]);
  const [activeTemplate, setActiveTemplate] = useState<Template>('modern');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [theme, setTheme] = useLocalStorage<'light' | 'dark'>(THEME_KEY, 'light');
  const [view, setView] = useState<View>('creator');
  const [mobileView, setMobileView] = useState<MobileView>('form');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const invoicePreviewRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (currentUser) {
        sessionStorage.setItem(SESSION_STORAGE_KEY_USER, currentUser);
        // When user changes, we need to reset the state to reflect their data
        const newInitialState = getInitialInvoiceState();
        setInvoice(newInitialState);
    } else {
        sessionStorage.removeItem(SESSION_STORAGE_KEY_USER);
    }
    // when currentUser changes, fetch invoices from backend
    const fetchInvoices = async () => {
      if (!currentUser) return;
      try {
        const token = localStorage.getItem(LOCAL_STORAGE_KEY_TOKEN);
        const res = await fetch(`${API_URL}/invoice/all`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) return;
        const data = await res.json();
        // normalize id fields
        const mapped = data.map((inv: any) => ({ ...inv, id: inv._id }));
        setSavedInvoices(mapped);
      } catch (err) {
        console.error('Failed to fetch invoices', err);
      }
    };
    void fetchInvoices();
  }, [currentUser, getInitialInvoiceState]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const handleLogin = (userId: string) => {
    setCurrentUser(userId);
  };
  
  const handleLogout = () => {
    if(window.confirm('Are you sure you want to logout?')) {
        sessionStorage.removeItem(SESSION_STORAGE_KEY_USER);
        localStorage.removeItem(LOCAL_STORAGE_KEY_TOKEN);
        setCurrentUser(null);
    }
  };

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const handleInvoiceChange = useCallback(<K extends keyof Invoice>(key: K, value: Invoice[K]) => {
    if (key === 'companyLogo') {
        setCompanyLogo(value as string | undefined);
    }
    if (key === 'signature') {
        setCompanySignature(value as string | undefined);
    }
    if (key === 'companyName') {
        setCompanyName(value as string);
    }
    setInvoice(prev => ({ ...prev, [key]: value }));
  }, [setCompanyLogo, setCompanySignature, setCompanyName]);

  const handleItemChange = useCallback((index: number, updatedItem: LineItem) => {
    const newItems = [...invoice.items];
    newItems[index] = updatedItem;
    setInvoice(prev => ({ ...prev, items: newItems }));
  }, [invoice.items]);

  const handleAddItem = useCallback(() => {
    setInvoice(prev => ({
      ...prev,
      items: [...prev.items, { id: Date.now().toString(), name: '', quantity: 1, price: 0 }],
    }));
  }, []);

  const handleRemoveItem = useCallback((index: number) => {
    setInvoice(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
  }, []);

  const handleSaveInvoice = useCallback(() => {
    const saveToServer = async () => {
      try {
        const token = localStorage.getItem(LOCAL_STORAGE_KEY_TOKEN);

        // If this invoice corresponds to an existing saved invoice (by id), ask to overwrite
        const existingById = savedInvoices.find(inv => inv.id === invoice.id);
        if (existingById) {
          const ok = window.confirm('This will overwrite the existing invoice. Do you want to save changes to the existing invoice?');
          if (ok) {
            const res = await fetch(`${API_URL}/invoice/${invoice.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify(invoice),
            });
            const updated = await res.json();
            if (!res.ok) {
              console.error('Update failed', updated);
              alert(updated.message || 'Failed to update invoice');
              return;
            }
            // refresh list
            const listRes = await fetch(`${API_URL}/invoice/all`, { headers: { Authorization: `Bearer ${token}` } });
            const list = await listRes.json();
            setSavedInvoices(list.map((inv: any) => ({ ...inv, id: inv._id })));
            alert('Invoice updated successfully!');
            return;
          } else {
            // user chose not to overwrite the existing invoice
            alert('Save cancelled. To create a new invoice, change the invoice number and try again.');
            return;
          }
        }

        // If invoiceNumber already exists for another invoice, prevent duplicate unless user confirms overwrite
        const existingByNumber = savedInvoices.find(inv => inv.invoiceNumber === invoice.invoiceNumber);
        if (existingByNumber) {
          const ok = window.confirm('An invoice with this number already exists. Do you want to overwrite that invoice?');
          if (ok) {
            // update that invoice
            const res = await fetch(`${API_URL}/invoice/${existingByNumber.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify(invoice),
            });
            const updated = await res.json();
            if (!res.ok) {
              console.error('Update failed', updated);
              alert(updated.message || 'Failed to update invoice');
              return;
            }
            const listRes = await fetch(`${API_URL}/invoice/all`, { headers: { Authorization: `Bearer ${token}` } });
            const list = await listRes.json();
            setSavedInvoices(list.map((inv: any) => ({ ...inv, id: inv._id })));
            alert('Invoice updated successfully!');
            return;
          } else {
            alert('Please choose a different invoice number to avoid duplicates.');
            return;
          }
        }

        // Otherwise create a new invoice
        const res = await fetch(`${API_URL}/invoice/create`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(invoice),
        });
        const saved = await res.json();
        if (!res.ok) {
          console.error('Save failed', saved);
          alert(saved.message || 'Failed to save invoice');
          return;
        }
        // fetch updated list
        const listRes2 = await fetch(`${API_URL}/invoice/all`, { headers: { Authorization: `Bearer ${token}` } });
        const list2 = await listRes2.json();
        setSavedInvoices(list2.map((inv: any) => ({ ...inv, id: inv._id })));
        alert('Invoice saved successfully!');
      } catch (err) {
        console.error(err);
        alert('Failed to save invoice');
      }
    };
    void saveToServer();
  }, [invoice, savedInvoices, setSavedInvoices]);

  const handleLoadInvoice = useCallback((id: string) => {
    const loadedInvoice = savedInvoices.find(inv => inv.id === id);
    if (loadedInvoice) {
      setInvoice(loadedInvoice);
      setView('creator');
      setMobileView('form');
    }
  }, [savedInvoices]);

  const handleDeleteInvoice = useCallback((id: string) => {
    const doDelete = async () => {
      if (!window.confirm('Are you sure you want to delete this invoice?')) return;
      try {
        const token = localStorage.getItem(LOCAL_STORAGE_KEY_TOKEN);
        const res = await fetch(`${API_URL}/invoice/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) {
          const data = await res.json();
          alert(data.message || 'Failed to delete');
          return;
        }
        setSavedInvoices(prev => prev.filter(inv => inv.id !== id));
        if (invoice.id === id) setInvoice(getInitialInvoiceState());
      } catch (err) {
        console.error(err);
        alert('Failed to delete');
      }
    };
    void doDelete();
  }, [savedInvoices, setSavedInvoices, invoice.id, getInitialInvoiceState]);

  const handleNewInvoice = useCallback(() => {
    const nextInvoiceNumber = `INV-${String(savedInvoices.length + 1).padStart(3, '0')}`;
    setInvoice({
        ...getInitialInvoiceState(), 
        id: Date.now().toString(),
        invoiceNumber: nextInvoiceNumber,
    });
    setView('creator');
    setMobileView('form');
  }, [savedInvoices.length, getInitialInvoiceState]);

const handleGeneratePdf = async () => {
  if (!invoicePreviewRef.current) return;

  setIsGeneratingPdf(true);

  // Small delay to let recent image src changes settle (helps mobile)
  await new Promise((resolve) => setTimeout(resolve, 200));

  // Wait for all images inside the invoice to load (important for mobile)
  const imgs = Array.from(invoicePreviewRef.current.querySelectorAll("img")) as HTMLImageElement[];

  // Ensure crossOrigin attribute set for non-data images so html2canvas can use useCORS
  imgs.forEach((img) => {
    try {
      if (img.src && !(img.src.startsWith('data:') || img.src.startsWith('blob:'))) {
        img.crossOrigin = 'anonymous';
      }
    } catch (e) {
      // ignore if not writable
    }
  });

  await Promise.all(
    imgs.map((img) => {
      if (img.complete && img.naturalWidth && img.naturalWidth > 0) return Promise.resolve();
      return new Promise<void>((resolve) => {
        let resolved = false;
        const cleanup = () => {
          img.removeEventListener('load', onLoad);
          img.removeEventListener('error', onError);
          if (!resolved) {
            resolved = true;
            resolve();
          }
        };
        const onLoad = () => cleanup();
        const onError = () => cleanup();
        img.addEventListener('load', onLoad);
        img.addEventListener('error', onError);
        // safety timeout in case neither load nor error fires
        setTimeout(() => cleanup(), 5000);
      });
    })
  );

  try {
    // @ts-ignore
    const { jsPDF } = window.jspdf;

    // Generate canvas with CORS enabled
    const canvas = await html2canvas(invoicePreviewRef.current, {
      scale: 2,
      useCORS: true, // important for mobile / external images
      allowTaint: false,
      backgroundColor: null,
    });

    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF({
      orientation: "p",
      unit: "mm",
      format: "a4",
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`invoice-${Date.now()}.pdf`);
  } catch (error) {
    console.error("PDF generation error:", error);
  } finally {
    setIsGeneratingPdf(false);
  }
};


  const handleSendEmail = async (to: string, subject: string, body: string) => {
    // A small delay to make the UX feel less jarring and allow UI to update
    await new Promise(resolve => setTimeout(resolve, 200));

    // 1. Generate and download PDF
    await handleGeneratePdf();

    // 2. Construct mailto link (encodes newlines correctly)
    const encodedBody = encodeURIComponent(body);
    const mailtoLink = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodedBody}`;

    // 3. Open email client
    window.location.href = mailtoLink;

    // 4. Close modal and show a hint
    setIsEmailModalOpen(false);
    
    // Use a timeout to ensure the alert doesn't block the mailto: redirect
    setTimeout(() => {
        alert("Your PDF has been downloaded. Please remember to attach it to the email draft that has just opened.");
    }, 500);
  };
  
  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }
  
  const subtotal = invoice.items.reduce((acc, item) => acc + item.quantity * item.price, 0);
  const taxAmount = (subtotal * invoice.taxRate) / 100;
  const total = subtotal + taxAmount;
  
  const templatesData = {
      modern: { name: 'Modern', headerBg: 'bg-blue-600' },
      clean: { name: 'Clean', headerBg: 'bg-gray-200' },
      professional: { name: 'Professional', headerBg: 'bg-gray-800' },
      creative: { name: 'Creative', headerBg: 'bg-teal-500' },
      minimalist: { name: 'Minimalist', headerBg: 'bg-gray-400' }
  };

  return (
    <div className="min-h-screen font-sans text-gray-800 dark:text-gray-200">
      <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-primary">BillMitra</h1>
          
          {/* Desktop Menu */}
          <nav className="hidden lg:flex items-center space-x-4">
            <div className="flex items-center gap-2 text-sm">
                <span className="font-medium text-gray-600 dark:text-gray-300">User:</span>
                <span className="text-primary font-semibold">{currentUser}</span>
            </div>
            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
               {theme === 'light' ? 
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-700">
                   <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
                 </svg>
                : 
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-yellow-400">
                   <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
                 </svg>
               }
           </button>
            {view === 'creator' && (
                <button onClick={() => setView('saved')} className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 font-bold py-2 px-4 rounded-lg transition duration-200">My Invoices</button>
            )}
             {view === 'saved' && (
                <button onClick={() => setView('creator')} className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 font-bold py-2 px-4 rounded-lg transition duration-200">Creator</button>
            )}
            <button onClick={handleNewInvoice} className="bg-secondary hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg transition duration-200">New Invoice</button>
            <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-red-500 transition-colors">Logout</button>
          </nav>
          
          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center gap-2">
            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                {theme === 'light' ? 
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-700"><path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" /></svg>
                 : 
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-yellow-400"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" /></svg>
                }
            </button>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
          </div>

          {/* Mobile Dropdown Menu */}
          {isMenuOpen && (
            <div className="absolute top-full right-4 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-xl border dark:border-gray-700 z-30 lg:hidden">
              <div className="p-2">
                <div className="px-3 py-2 text-sm">
                  <p className="font-medium text-gray-600 dark:text-gray-300">Signed in as</p>
                  <p className="font-semibold text-primary truncate">{currentUser}</p>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                <a href="#" onClick={(e) => { e.preventDefault(); setView(view === 'creator' ? 'saved' : 'creator'); setIsMenuOpen(false); }} className="block w-full text-left px-3 py-2 rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-700">{view === 'creator' ? 'My Invoices' : 'Creator'}</a>
                <a href="#" onClick={(e) => { e.preventDefault(); handleNewInvoice(); setIsMenuOpen(false); }} className="block w-full text-left px-3 py-2 rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-700">New Invoice</a>
                <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                <a href="#" onClick={(e) => { e.preventDefault(); handleLogout(); setIsMenuOpen(false); }} className="block w-full text-left px-3 py-2 rounded-md text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/50">Logout</a>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        {view === 'creator' ? (
          <>
            {/* Mobile View Toggle */}
            <div className="lg:hidden mb-4 bg-gray-200 dark:bg-gray-700 p-1 rounded-lg flex">
                <button onClick={() => setMobileView('form')} className={`w-1/2 py-2 text-sm font-bold rounded-md transition-colors ${mobileView === 'form' ? 'bg-white dark:bg-gray-800 shadow' : 'text-gray-600 dark:text-gray-300'}`}>
                    Editor
                </button>
                <button onClick={() => setMobileView('preview')} className={`w-1/2 py-2 text-sm font-bold rounded-md transition-colors ${mobileView === 'preview' ? 'bg-white dark:bg-gray-800 shadow' : 'text-gray-600 dark:text-gray-300'}`}>
                    Preview
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className={`lg:col-span-2 ${mobileView === 'preview' ? 'hidden lg:block' : ''}`}>
                    <InvoiceForm invoice={invoice} onInvoiceChange={handleInvoiceChange} onItemChange={handleItemChange} onAddItem={handleAddItem} onRemoveItem={handleRemoveItem} subtotal={subtotal} taxAmount={taxAmount} total={total}/>
                </div>
                <div className={`lg:col-span-3 ${mobileView === 'form' ? 'hidden lg:block' : ''}`}>
                    <div className="sticky top-24">
                        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-lg">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
                                <h2 className="text-xl font-semibold">Invoice Preview</h2>
                                <div className="flex flex-wrap items-center gap-2">
                                    {(Object.keys(templatesData) as Template[]).map(templateId => (
                                        <button key={templateId} onClick={() => setActiveTemplate(templateId)} className={`px-3 py-2 text-sm rounded-lg transition-all flex items-center gap-2 border-2 ${activeTemplate === templateId ? 'border-primary bg-primary/10' : 'border-transparent bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}>
                                            <span className={`w-4 h-4 rounded-full ${templatesData[templateId].headerBg}`}></span>
                                            <span>{templatesData[templateId].name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div ref={invoicePreviewRef} className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white overflow-hidden">
                                <InvoicePreview invoice={invoice} template={activeTemplate} subtotal={subtotal} taxAmount={taxAmount} total={total}/>
                            </div>
                        </div>
                        <div className="mt-6 hidden lg:flex space-x-3">
                            <button onClick={handleGeneratePdf} disabled={isGeneratingPdf} className="flex-1 bg-primary hover:bg-primary-dark text-white font-bold py-3 px-6 rounded-lg transition duration-200 disabled:bg-primary-light disabled:cursor-not-allowed">
                                {isGeneratingPdf ? 'Generating...' : 'Download PDF'}
                            </button>
                             <button onClick={() => setIsEmailModalOpen(true)} className="flex-1 bg-white dark:bg-gray-700 text-primary dark:text-primary-light border-2 border-primary font-bold py-3 px-6 rounded-lg hover:bg-primary/10 transition duration-200">
                                Email Invoice
                            </button>
                            <button onClick={handleSaveInvoice} className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition duration-200">
                                Save Invoice
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Mobile Sticky Footer Actions */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-3 border-t dark:border-gray-700 shadow-lg z-10 flex space-x-2">
                <button onClick={handleGeneratePdf} disabled={isGeneratingPdf} className="flex-1 bg-primary hover:bg-primary-dark text-white font-bold py-3 px-4 rounded-lg transition duration-200 disabled:bg-primary-light disabled:cursor-not-allowed text-sm">
                    {isGeneratingPdf ? '...' : 'PDF'}
                </button>
                 <button onClick={() => setIsEmailModalOpen(true)} className="flex-1 bg-white dark:bg-gray-700 text-primary dark:text-primary-light border-2 border-primary font-bold py-3 px-4 rounded-lg hover:bg-primary/10 transition duration-200 text-sm">
                    Email
                </button>
                <button onClick={handleSaveInvoice} className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition duration-200 text-sm">
                    Save
                </button>
            </div>
            {/* Spacer to prevent content from being hidden by the sticky footer */}
            <div className="lg:hidden h-20"></div>
          </>
        ) : (
           <SavedInvoices invoices={savedInvoices} onLoad={handleLoadInvoice} onDelete={handleDeleteInvoice}/>
        )}
      </main>
      {isEmailModalOpen && (
        <EmailModal
            invoice={invoice}
            onClose={() => setIsEmailModalOpen(false)}
            onSend={handleSendEmail}
        />
      )}
    </div>
  );
};

export default App;