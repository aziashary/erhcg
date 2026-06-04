import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

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

export default function CheckReservation() {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('id') || '');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

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
      const response = await fetch(`http://localhost:8000/api/reservations/${q}`);
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
          <p>Masukkan Nomor Invoice Anda untuk melihat rincian pemesanan.</p>
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
              placeholder="Contoh: INV-ROCK-1234" 
              required 
            />
            <button type="submit" className="btn btn-primary search-btn" disabled={loading}>
              <i className='bx bx-search'></i> {loading ? 'Mencari...' : 'Cari'}
            </button>
          </form>

          {error && (
            <div className="not-found" style={{ display: 'block' }}>
              <i className='bx bx-error-circle' style={{ fontSize: '3rem', marginBottom: '10px' }}></i>
              <h3>Invoice Tidak Ditemukan</h3>
              <p>Pastikan Anda memasukkan nomor invoice yang benar atau gunakan perangkat yang sama saat melakukan reservasi.</p>
            </div>
          )}

          {result && (
            <div className="result-container" style={{ display: 'block' }}>
              <div className="invoice-card">
                <div className="invoice-header">
                  <div>
                    <span style={{ color: '#777', fontSize: '0.9rem' }}>Nomor Invoice</span>
                    <div className="invoice-id">{result.id}</div>
                  </div>
                  <div className="invoice-status">{result.status || 'Menunggu Konfirmasi'}</div>
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
                
                <div style={{ marginTop: '20px', textAlign: 'center' }}>
                  <p style={{ fontSize: '0.85rem', color: '#888' }}>*Tunjukkan halaman ini atau nomor invoice ke admin via WhatsApp untuk konfirmasi pembayaran.</p>
                  <a 
                    href={`https://wa.me/6281234567890?text=${encodeURIComponent(`Halo Admin, saya ingin konfirmasi pembayaran untuk reservasi dengan Nomor Invoice: *${result.id}*`)}`} 
                    target="_blank" 
                    className="btn btn-outline" 
                    rel="noreferrer"
                    style={{ marginTop: '15px', borderColor: '#25D366', color: '#25D366' }}
                  >
                    <i className='bx bxl-whatsapp'></i> Hubungi Admin
                  </a>
                </div>
              </div>
            </div>
          )}

        </div>
      </section>
    </main>
  );
}
