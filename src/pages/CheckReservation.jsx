import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';

function formatTanggalIndo(dateStr) {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  const hari = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const bulan = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  
  const d = date.getDate().toString().padStart(2, '0');
  const m = bulan[date.getMonth()];
  const y = date.getFullYear().toString().slice(-2);
  const h = hari[date.getDay()];
  
  return `${h}, ${d}-${m}-${y}`;
}

function formatRupiah(angka) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
}

export default function CheckReservation() {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('id') || '');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showCopyToast, setShowCopyToast] = useState(false);

  const numericTotal = result ? parseInt(result.total?.replace(/[^0-9]/g, '') || '0', 10) : 0;
  const dpAmount = numericTotal / 2;
  const fullAmount = numericTotal;

  useEffect(() => {
    if (searchParams.get('id')) {
      performSearch(searchParams.get('id'));
    }
  }, [searchParams]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    performSearch(query.trim().toUpperCase());
  };

  const performSearch = async (q) => {
    setLoading(true);
    setResult(null);
    setError(false);
    try {
      const response = await fetch(`/api/reservations/${q}`);
      if (!response.ok) throw new Error('Not found');
      const data = await response.json();
      if (data.success) {
        setResult(data.data);
      } else {
        setError(true);
      }
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const renderTextAsElements = (text) => {
    if (!text || text.trim() === '-' || text.includes('Tidak ada')) {
      return <div>{text || '-'}</div>;
    }
    
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      if (line.startsWith('- ')) {
         const match = line.match(/^- (.+?)\s+(\d+x)$/);
         if (match) {
           return (
             <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
               <span>- {match[1].trim()}</span>
               <span>{match[2]}</span>
             </div>
           );
         } else {
           return <div key={idx}>{line}</div>;
         }
      } else if (line.trim().length > 0) {
         return <div key={idx} style={{ color: '#666', marginBottom: '8px', marginLeft: '12px' }}>{line.trim()}</div>;
      }
      return null;
    });
  };

  return (
    <main className="page-transition">
      <div className="page-header">
        <div className="container">
          <h1>Cek Status Reservasi</h1>
          <p>Masukkan Nomor Invoice atau Kode Booking Anda untuk melihat rincian pemesanan.</p>
        </div>
      </div>

      <section className="section-padding" style={{ backgroundColor: 'var(--color-broken-white)', minHeight: '50vh' }}>
        <div className="container">
          
          <form onSubmit={handleSubmit} className="search-container">
            <input 
              type="text" 
              value={query} 
              onChange={e => setQuery(e.target.value)} 
              className="search-input" 
              placeholder="Contoh: RHCG-260610-00145 atau RCBO-12345" 
              required 
            />
            <button type="submit" className="btn btn-primary search-btn" disabled={loading}>
              <i className='bx bx-search'></i> {loading ? 'Mencari...' : 'Cari'}
            </button>
          </form>

          {loading && (
            <div className="result-container" style={{ display: 'block', padding: '24px', background: '#fff', borderRadius: '12px', border: '1px solid #eaeaea', marginTop: '20px' }}>
              <div className="skeleton skeleton-title"></div>
              <div className="skeleton skeleton-card" style={{ height: '160px' }}></div>
              <div className="skeleton skeleton-text" style={{ width: '85%' }}></div>
              <div className="skeleton skeleton-text" style={{ width: '60%' }}></div>
              <div className="skeleton skeleton-text" style={{ width: '75%' }}></div>
            </div>
          )}

          {error && (!loading) && (
            <div className="not-found" style={{ display: 'block' }}>
              <i className='bx bx-error-circle' style={{ fontSize: '3rem', marginBottom: '10px' }}></i>
              <h3>Reservasi Tidak Ditemukan</h3>
              <p>Pastikan Anda memasukkan nomor invoice atau kode booking yang benar.</p>
            </div>
          )}

          {result && (
            <div className="result-container" style={{ display: 'block' }}>
              <div className="invoice-card">
                {result.status === 'Expired' ? (
                  <div className="unpaid-banner" style={{ background: 'rgba(100, 100, 100, 0.05)', borderLeft: '4px solid #666' }}>
                    <i className="bx bx-time-five" style={{ fontSize: '1.4rem', color: '#666' }}></i>
                    <div>
                      <strong style={{ color: '#666' }}>Pemesanan Kadaluarsa (Expired)</strong>
                      <p>Batas waktu pembayaran 1 jam telah habis. Kode booking ini sudah tidak dapat digunakan untuk pembayaran. Silakan lakukan reservasi ulang.</p>
                    </div>
                  </div>
                ) : result.status !== 'Confirmed' && (
                  <div className="unpaid-banner">
                    <i className="bx bx-error-circle" style={{ fontSize: '1.4rem' }}></i>
                    <div>
                      <strong>Belum Dibayar / Menunggu Konfirmasi</strong>
                      <p>Silakan lakukan pembayaran lalu hubungi Admin via WhatsApp dengan menyertakan Kode Booking Anda untuk konfirmasi.</p>
                    </div>
                  </div>
                )}

                <div className="invoice-header">
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                    {result.id && (
                      <div>
                        <span style={{ color: '#777', fontSize: '0.85rem' }}>Nomor Invoice</span>
                        <div className="invoice-id" style={{ fontSize: '1.3rem' }}>{result.id}</div>
                      </div>
                    )}
                    {result.booking_code && (
                      <div>
                        <span style={{ color: '#777', fontSize: '0.85rem' }}>Kode Booking</span>
                        <div className="invoice-id" style={{ fontSize: '1.3rem', color: 'var(--color-primary-brown)' }}>{result.booking_code}</div>
                      </div>
                    )}
                  </div>
                  <div className={`invoice-status ${result.status === 'Confirmed' ? 'status-confirmed' : result.status === 'Expired' || result.status === 'Declined' ? 'status-expired' : 'status-unpaid'}`}>
                    {result.status === 'Confirmed' ? 'Confirmed' : result.status === 'Expired' ? 'Expired' : result.status === 'Declined' ? 'Declined' : 'Belum Dibayar'}
                  </div>
                </div>

                <div className="invoice-grid">
                  <div className="info-group">
                    <h4>Data Pemesan</h4>
                    <p>{result.nama}</p>
                    <p style={{ fontSize: '0.95rem', color: '#666', marginTop: '5px' }}>
                      WA: {result.wa} {result.email && `| Email: ${result.email}`}
                    </p>
                  </div>
                  <div className="info-group">
                    <h4>Jadwal</h4>
                    <p>
                      {formatTanggalIndo(result.checkin)} s.d<br />{formatTanggalIndo(result.checkout)}
                    </p>
                    <p style={{ fontSize: '0.95rem', color: '#666', marginTop: '5px' }}>{result.nights} Malam</p>
                  </div>
                  <div className="info-group">
                    <h4>Peserta & Kedatangan</h4>
                    <p>{result.dewasa} Dewasa{result.anak > 0 ? `, ${result.anak} Anak` : ''}</p>
                    <p style={{ fontSize: '0.95rem', color: '#666', marginTop: '5px' }}>{result.jamKedatangan || '-'}</p>
                  </div>
                  <div className="info-group">
                    <h4>Area & Tgl Dibuat</h4>
                    <p style={{ fontWeight: 'bold', color: 'var(--color-primary-brown)' }}>{result.area || '-'}</p>
                    <p style={{ fontSize: '0.95rem', color: '#666', marginTop: '5px' }}>
                      {new Date(result.dateCreated || new Date()).toLocaleString('id-ID', {
                        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>

                <div className="invoice-details">
                  <div className="detail-section">
                    <h4>Paket Tenda</h4>
                    <div style={{ fontSize: '1rem', color: '#444', margin: 0 }}>
                      {renderTextAsElements(result.paketText)}
                    </div>
                  </div>
                  <div className="detail-section">
                    <h4>Alat Tambahan</h4>
                    <div style={{ fontSize: '1rem', color: '#444', margin: 0 }}>
                      {renderTextAsElements(result.addonsText)}
                    </div>
                  </div>
                </div>

                <div className="invoice-total">
                  <span>Estimasi Total</span>
                  <h3>{result.total}</h3>
                </div>

                {result.status !== 'Confirmed' && result.status !== 'Expired' && result.status !== 'Declined' && (
                  <div className="payment-transfer-info">
                    <h4>
                      <i className='bx bx-credit-card-front' style={{ color: 'var(--color-primary-brown)', fontSize: '1.2rem' }}></i> Rekening Pembayaran
                    </h4>
                    <div className="rekening-box">
                      <div>
                        <div className="bank-label">Bank BCA</div>
                        <div className="norek">7361558573</div>
                        <div className="an">A.n. Mochamad Azi Ashary</div>
                      </div>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText('7361558573');
                          setShowCopyToast(true);
                          setTimeout(() => setShowCopyToast(false), 2000);
                        }}
                        className="copy-btn"
                        type="button"
                      >
                        <i className='bx bx-copy'></i> Salin
                      </button>
                    </div>

                    <div className="payment-split-grid">
                      <div className="payment-split-card dp">
                        <span className="split-label">Minimal DP 50%</span>
                        <strong className="split-val">{formatRupiah(dpAmount)}</strong>
                      </div>
                      <div className="payment-split-card full">
                        <span className="split-label">Pelunasan (Full Payment)</span>
                        <strong className="split-val">{formatRupiah(fullAmount)}</strong>
                      </div>
                    </div>
                  </div>
                )}
                
                {result.status !== 'Expired' && result.status !== 'Declined' ? (
                  <div style={{ marginTop: '20px', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.85rem', color: '#888' }}>*Tunjukan Kode Booking/ No Invoice ke admin Whatsapp untuk pertanyaan dan konfirmasi seputar reservasi</p>
                    <a 
                      href={`https://wa.me/6281234567890?text=${encodeURIComponent(`Halo Admin, saya ingin konfirmasi pembayaran untuk reservasi dengan Kode Booking: *${result.booking_code || '-'}*` + (result.id ? ` / Invoice: *${result.id}*` : ''))}`} 
                      target="_blank" 
                      className="btn btn-outline" 
                      rel="noreferrer"
                      style={{ marginTop: '15px', borderColor: '#25D366', color: '#25D366' }}
                    >
                       <i className='bx bxl-whatsapp'></i> Hubungi Admin
                    </a>
                  </div>
                ) : (
                  <div style={{ marginTop: '20px', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.9rem', color: '#888', marginBottom: '15px' }}>Reservasi ini telah kadaluarsa. Silakan lakukan pemesanan ulang.</p>
                    <Link to="/reservation" className="btn btn-primary" style={{ display: 'inline-block' }}>
                      Buat Reservasi Baru
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </section>

      {showCopyToast && (
        <div className="toast-notification">
          <i className='bx bx-check-circle' style={{ color: '#4caf50', fontSize: '1.2rem' }}></i> Salin di Clipboard
        </div>
      )}
    </main>
  );
}
