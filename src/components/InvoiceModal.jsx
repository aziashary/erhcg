import React, { useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import './invoice.css';

const formatRupiah = (angka) => {
  if (typeof angka === 'string' && angka.startsWith('Rp')) return angka;
  return 'Rp ' + (angka || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

function formatTanggalIndo(dateStr) {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  const hari = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const bulan = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  
  const d = date.getDate().toString().padStart(2, '0');
  const m = bulan[date.getMonth()];
  const y = date.getFullYear();
  const h = hari[date.getDay()];
  
  return `${h}, ${d} ${m} ${y}`;
}

export default function InvoiceModal({ reservation, onClose }) {
  if (!reservation) return null;
  const r = reservation;

  let allItems = [];
  if (r.items && r.items.length > 0) {
    allItems = r.items.map(it => ({
      description: it.item_name,
      qty: it.quantity,
      total: parseInt(it.subtotal, 10) || 0,
      totalStr: formatRupiah(it.subtotal)
    }));
  } else {
    const parseItems = (text) => {
      if (!text || text.trim() === '-' || text.includes('Tidak ada')) return [];
      const lines = text.split('\n');
      const items = [];
      let currentItem = null;
      
      lines.forEach(line => {
        const match = line.match(/^- (.+?)\s+(\d+)x$/);
        if (match) {
          if (currentItem) items.push(currentItem);
          currentItem = { description: match[1].trim(), qty: parseInt(match[2], 10), total: 0, totalStr: 'Rp 0' };
        } else if (line.trim() !== '' && currentItem) {
          const valStr = line.trim();
          currentItem.totalStr = 'Rp ' + valStr;
          currentItem.total = parseInt(valStr.replace(/[^0-9]/g, ''), 10) || 0;
        }
      });
      if (currentItem) items.push(currentItem);
      return items;
    };
    const paketItems = parseItems(r.paketText);
    const addonItems = parseItems(r.addonsText);
    allItems = [...paketItems, ...addonItems];
  }

  const numericTotal = parseInt((r.total || r.totalAmount || '0').toString().replace(/[^0-9]/g, ''), 10) || 0;
  let numericPayAmt = parseInt((r.paymentAmount || '0').toString().replace(/[^0-9]/g, ''), 10) || 0;
  
  // Is this a DP payment?
  const isDp = numericPayAmt > 0 && numericPayAmt < numericTotal;
  
  // Calculate remaining balance
  const remainingBalance = Math.max(0, numericTotal - numericPayAmt);
  
  // Calculate Subtotal and Discount
  const itemsSubtotal = allItems.reduce((acc, item) => acc + item.total, 0);
  let discountAmt = 0;
  
  if (r.discount) {
    discountAmt = parseInt((r.discount).toString().replace(/[^0-9]/g, ''), 10) || 0;
  } else if (itemsSubtotal > numericTotal) {
    // Infer discount if subtotal > total
    discountAmt = itemsSubtotal - numericTotal;
  }

  const [scale, setScale] = useState(1);
  
  useEffect(() => {
    const updateScale = () => {
      const screenWidth = window.innerWidth;
      const targetWidth = 850; // 210mm + padding
      if (screenWidth < targetWidth) {
        setScale(screenWidth / targetWidth);
      } else {
        setScale(1);
      }
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  const downloadImage = async () => {
    try {
      const element = document.getElementById('invoice-print-area');
      const canvas = await html2canvas(element, {
        scale: 2, // High resolution
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      const data = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = data;
      link.download = `Invoice-${r.invoice_id || r.booking_code || 'RHCG'}.png`;
      link.click();
    } catch (err) {
      console.error('Failed to generate image', err);
      alert('Gagal mendownload gambar invoice');
    }
  };

  return (
    <div className="modal-overlay active" style={{ display: 'flex', alignItems: 'flex-start', overflowY: 'auto' }} onClick={(e) => e.target.classList.contains('modal-overlay') && onClose()}>
      <div className="modal-content invoice-modal-content" style={{ maxWidth: '100%', width: '100%', padding: '0', background: 'transparent', boxShadow: 'none', margin: '0 auto' }}>
        
        {/* Action Buttons (Not Printed) */}
        <div className="invoice-actions no-print" style={{ display: 'flex', justifyContent: 'center', gap: '15px', padding: '15px', background: 'rgba(0,0,0,0.8)', position: 'sticky', top: 0, zIndex: 10 }}>
          <button className="btn btn-outline" style={{ background: '#fff', color: '#333' }} onClick={onClose}>
            <i className='bx bx-x'></i> Tutup
          </button>
          <button className="btn btn-primary" onClick={downloadImage}>
            <i className='bx bx-download'></i> Download Gambar
          </button>
        </div>

        {/* The Invoice A4 Paper */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 0', zoom: scale }}>
          <div id="invoice-print-area" className="invoice-print-area">
            {/* Header */}
          <div className="invoice-header-row">
            <div className="invoice-brand">
              <h2>ROCKSHILL CAMPGROUND</h2>
              <h3>INVOICE</h3>
              <p>Megamendung, Kabupaten Bogor, Jawa Barat, Indonesia</p>
              <p>0852-8292-5612</p>
              <p>rockshillcampground@gmail.com</p>
            </div>
            <div className="invoice-logo">
              <img src="/logo.png" alt="Rockshill Logo" />
            </div>
          </div>

          <hr className="invoice-divider" />

          {/* Info Block */}
          <div className="invoice-info-row">
            <div className="invoice-to">
              <p className="lbl">To</p>
              <h4>{r.nama}</h4>
              <p>{r.area}</p>
              <p>{formatTanggalIndo(r.checkin)}</p>
              <p>{r.wa}</p>
            </div>
            <div className="invoice-meta">
              <div className="meta-line">
                <span className="lbl">Invoice No:</span>
                <span className="val bold">{r.invoice_id || r.booking_code || '-'}</span>
              </div>
              <div className="meta-line">
                <span className="lbl">Invoice Date:</span>
                <span className="val">{r.dateCreated ? formatTanggalIndo(r.dateCreated) : formatTanggalIndo(r.checkin)}</span>
              </div>
              <div className="meta-line">
                <span className="lbl">Due Date:</span>
                <span className="val">{formatTanggalIndo(r.checkin)}</span>
              </div>
              <div className="meta-line highlight">
                <span className="lbl">Total Amount Due:</span>
                <span className="val">{formatRupiah(remainingBalance)}</span>
              </div>
            </div>
          </div>

          {/* Table */}
          <table className="invoice-table">
            <thead>
              <tr>
                <th className="text-left">Description</th>
                <th className="text-right">Price</th>
                <th className="text-center">Qty</th>
                <th className="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {allItems.map((item, idx) => {
                const unitPrice = item.qty > 0 ? Math.round(item.total / item.qty) : 0;
                return (
                  <tr key={idx}>
                    <td className="text-left">{item.description}</td>
                    <td className="text-right">{item.total > 0 ? formatRupiah(unitPrice) : '-'}</td>
                    <td className="text-center">{item.qty}</td>
                    <td className="text-right">{item.total > 0 ? formatRupiah(item.total) : '-'}</td>
                  </tr>
                );
              })}
              {/* Fill empty rows to make it look full if few items */}
              {Array.from({ length: Math.max(0, 8 - allItems.length) }).map((_, idx) => (
                <tr key={'empty-'+idx}>
                  <td>&nbsp;</td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Footer Totals */}
          <div className="invoice-footer-row" style={{ position: 'relative' }}>
            
            {/* Stamp */}
            {isDp ? (
              <div className="invoice-stamp dp">DOWN PAYMENT</div>
            ) : (
              <div className="invoice-stamp paid">LUNAS</div>
            )}

            <div className="invoice-notes">
              <span className="lbl">Note :</span>
              <p style={{ marginTop: '10px' }}>
                Total Durasi: <strong>{r.nights} Malam</strong><br/>
                Peserta: <strong>{r.dewasa} Dewasa{r.anak > 0 ? `, ${r.anak} Anak` : ''}</strong>
              </p>
            </div>
            <div className="invoice-summary">
              <div className="summary-line">
                <span className="lbl">Subtotal :</span>
                <span className="val">{formatRupiah(itemsSubtotal || numericTotal + discountAmt)}</span>
              </div>
              {(discountAmt > 0) && (
                <div className="summary-line">
                  <span className="lbl">Discount :</span>
                  <span className="val">{formatRupiah(discountAmt)}</span>
                </div>
              )}
              {isDp && numericPayAmt > 0 && (
                <div className="summary-line">
                  <span className="lbl">Down Payment :</span>
                  <span className="val">{formatRupiah(numericPayAmt)}</span>
                </div>
              )}
              {(!isDp && numericTotal > 0) && (
                <div className="summary-line">
                  <span className="lbl">Lunas (Paid) :</span>
                  <span className="val">{formatRupiah(numericPayAmt)}</span>
                </div>
              )}
              <div className="summary-line highlight-total">
                <span className="lbl">Total Tagihan :</span>
                <span className="val">{formatRupiah(numericTotal)}</span>
              </div>
              <div className="summary-line highlight-due" style={{ marginTop: '5px', padding: '10px', background: '#e9ecef', fontSize: '15px' }}>
                <span className="lbl" style={{ fontWeight: 800, color: '#000' }}>Sisa Tagihan :</span>
                <span className="val" style={{ fontWeight: 800, color: '#000' }}>{formatRupiah(remainingBalance)}</span>
              </div>
            </div>
          </div>

          {/* Terms & Bank Info */}
          <div className="invoice-terms-row">
            <div className="terms-text">
              <h4>Terms & Instructions :</h4>
              <p>Pelunasan bisa melalui transfer ke :</p>
              <p className="bank-info"><strong>BCA - 7361558573 - Mochamad Azi Ashary</strong></p>
              <p>Bayar di tempat dengan menunjukan e-invoice</p>
              <p className="disclaimer">*Total belum termasuk tambahan orang,<br/>tambahan alat dan logistik di tempat</p>
            </div>
          </div>

          </div>
        </div>
      </div>
    </div>
  );
}
