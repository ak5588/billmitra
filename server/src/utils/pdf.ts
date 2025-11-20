import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

export async function generateInvoicePdf(invoice: any, outputFilePath: string) {
  // Ensure directory exists
  const dir = path.dirname(outputFilePath);
  fs.mkdirSync(dir, { recursive: true });

  // Create simple HTML using invoice data. This can be improved to match the app's preview.
  const html = `
  <!doctype html>
  <html>
  <head>
    <meta charset="utf-8" />
    <title>Invoice ${invoice.invoiceNumber}</title>
    <style>
      body { font-family: Arial, sans-serif; padding: 24px; color: #222 }
      h1 { color: #0b5fff }
      .meta { margin-bottom: 12px }
      table { width: 100%; border-collapse: collapse; margin-top: 12px }
      th, td { border: 1px solid #ddd; padding: 8px; }
      th { background: #f4f4f4; text-align: left }
      .right { text-align: right }
      .totals { margin-top: 12px; width: 100%; }
      .totals td { border: none; padding: 4px }
    </style>
  </head>
  <body>
    <h1>Invoice ${invoice.invoiceNumber || ''}</h1>
    <div class="meta">
      <strong>Company:</strong> ${invoice.companyName || ''}<br/>
      <strong>Customer:</strong> ${invoice.customerName || ''}<br/>
      <strong>Date:</strong> ${invoice.date || ''}
    </div>
    <table>
      <thead>
        <tr><th>Item</th><th>Qty</th><th class="right">Price</th><th class="right">Total</th></tr>
      </thead>
      <tbody>
        ${Array.isArray(invoice.items) ? invoice.items.map((it: any) => `
          <tr>
            <td>${(it.name||'')}</td>
            <td>${it.quantity||0}</td>
            <td class="right">${(Number(it.price)||0).toFixed(2)}</td>
            <td class="right">${(((Number(it.quantity)||0)*(Number(it.price)||0))).toFixed(2)}</td>
          </tr>
        `).join('') : ''}
      </tbody>
    </table>
    <table class="totals">
      <tr><td style="width:80%"></td><td>Subtotal:</td><td class="right">${(invoice.amount && invoice.taxAmount) ? ((invoice.amount - invoice.taxAmount).toFixed(2)) : '0.00'}</td></tr>
      <tr><td></td><td>Tax:</td><td class="right">${(invoice.taxAmount||0).toFixed(2)}</td></tr>
      <tr><td></td><td><strong>Total:</strong></td><td class="right"><strong>${(invoice.amount||0).toFixed(2)}</strong></td></tr>
    </table>
  </body>
  </html>
  `;

  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true, margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' } });
    await fs.promises.writeFile(outputFilePath, pdfBuffer);
  } finally {
    await browser.close();
  }
  return outputFilePath;
}
