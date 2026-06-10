import { useState, useEffect } from 'react';
import ReceiptModal from './ReceiptModal';

export default function AdminPending() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sel, setSel] = useState(null);

  const [declineId, setDeclineId] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [paymentType, setPaymentType] = useState('dp');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const load = () => {
    fetch('http://localhost:8000/api/hq-rockshill/reservations', {
      headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
    })
      .then(r => r.json())
      .then(res => { setRows((res.data || []).filter(r => r.status === 'Menunggu Konfirmasi')); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(load, []);

  const processConfirm = () => {
    if (!paymentAmount) {
      alert('Masukkan nominal pembayaran!');
      return;
    }
    
    fetch(`http://localhost:8000/api/hq-rockshill/reservations/${confirmId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
      body: JSON.stringify({ 
        status: 'Confirmed',
        paymentType: paymentType,
        paymentAmount: paymentAmount
      }),
    })
      .then(r => r.json())
      .then(d => { if (d.status) { alert('Berhasil dikonfirmasi!'); setConfirmId(null); setPaymentAmount(''); load(); } })
      .catch(() => alert('Gagal konfirmasi.'));
  };

  const processDecline = () => {
    fetch(`http://localhost:8000/api/hq-rockshill/reservations/${declineId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
      body: JSON.stringify({ status: 'Declined' }),
    })
      .then(r => r.json())
      .then(d => { if (d.status) { alert('Reservasi telah ditolak.'); setDeclineId(null); load(); } })
      .catch(() => alert('Gagal menolak reservasi.'));
  };

  if (loading) return <div className="empty">Memuat data...</div>;

  const filteredRows = rows.filter(r => 
    r.nama.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.booking_code.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (r.invoice_id && r.invoice_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
    r.wa.includes(searchTerm)
  );

  return (
    <>
      <div className="pg-hdr">
        <div>
          <h1>Reservasi Belum Bayar</h1>
          <p>Mengelola antrean pembayaran tamu yang tertunda.</p>
        </div>
        <div className="pg-hdr-right">
          <div className="search-wrap">
            <i className='bx bx-search'></i>
            <input 
              type="text" 
              placeholder="Cari nama, booking..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="hdr-btns">
            <button className="btn btn-ol"><i className="bx bx-filter-alt"></i> Filter</button>
            <button className="btn btn-ol"><i className="bx bx-sort-alt-2"></i> Urutkan</button>
          </div>
        </div>
      </div>

      {/* ── DESKTOP TABLE ── */}
      <div className="tbl-wrap desk">
        <table className="tbl">
          <thead>
            <tr>
              <th>Kode Booking</th>
              <th>Nama</th>
              <th>Tanggal</th>
              <th>Area</th>
              <th>Total Tagihan</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.length === 0 ? (
              <tr><td colSpan={6} className="empty">Tidak ada reservasi pending</td></tr>
            ) : filteredRows.map(r => (
              <tr key={r.id}>
                <td><span style={{ fontFamily: 'Outfit', fontWeight: 700, color: 'var(--pri)', fontSize: 14 }}>{r.booking_code}</span></td>
                <td>
                  <div style={{ fontWeight: 600 }}>{r.nama}</div>
                  <div style={{ fontSize: 12, color: 'var(--on-dim)' }}>{r.wa}</div>
                </td>
                <td>
                  <div style={{ fontWeight: 600, color: 'var(--pri)', fontSize: 13 }}>{r.checkin} – {r.checkout}</div>
                  <div style={{ fontSize: 11, color: 'var(--on-dim)' }}>{r.nights} Malam</div>
                </td>
                <td><span className="area-chip">{r.area}</span></td>
                <td><span style={{ fontFamily: 'Outfit', fontWeight: 700, color: 'var(--pri)', fontSize: 15 }}>{r.total}</span></td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-ol btn-icon" onClick={() => setSel(r)}><i className="bx bx-receipt"></i></button>
                    <button className="btn btn-sec" onClick={() => setConfirmId(r.id)}><i className="bx bx-check"></i> Confirm</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── MOBILE CARDS ── */}
      <div className="mob-block" style={{ display: 'none' }}>
        {filteredRows.length === 0 ? (
          <div className="empty">Tidak ada reservasi pending</div>
        ) : filteredRows.map(r => (
          <div key={r.id} className="site-card" style={{ display: 'block', borderLeft: '4px solid var(--pri)' }}>
            <div style={{ cursor: 'pointer' }} onClick={() => setSel(r)}>
              <div className="site-info" style={{ padding: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                  <h4 style={{ fontSize: 16, wordBreak: 'break-word' }}>{r.booking_code}</h4>
                  <span className="price" style={{ flexShrink: 0 }}>{r.total}</span>
                </div>
                <p style={{ fontSize: 12, marginBottom: 6 }}>{r.nama} • {r.area}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="chip chip-b" style={{ fontSize: 10 }}>Belum Bayar</span>
                  <p style={{ margin: 0, fontSize: 11, color: 'var(--on-dim)' }}><i className="bx bx-calendar"></i> {r.checkin}</p>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6, padding: '10px 14px 14px', borderTop: '1px solid var(--surface-mid)' }}>
              <button className="btn btn-sec" style={{ flex: 1, padding: '8px' }} onClick={() => setConfirmId(r.id)}>Confirm Pembayaran</button>
            </div>
          </div>
        ))}
      </div>

      {sel && <ReceiptModal reservation={sel} onClose={() => setSel(null)} onDecline={() => setDeclineId(sel.id)} />}
      <button className="fab mob" style={{ display: 'none' }}><i className="bx bx-plus"></i></button>

      {/* MODAL KONFIRMASI PEMBAYARAN */}
      {confirmId && (
        <div className="modal-overlay active" style={{ display: 'flex', zIndex: 9999 }}>
          <div className="modal-content" style={{ padding: '30px', background: '#fff', borderRadius: '12px', maxWidth: '400px', width: '90%' }}>
            <h3 style={{ marginTop: 0, color: 'var(--pri)', fontSize: '1.4rem' }}>Konfirmasi Pembayaran</h3>
            <p style={{ color: '#666', marginBottom: '20px' }}>Pilih tipe pembayaran dan masukkan nominal yang ditransfer oleh pelanggan:</p>
            
            <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 500 }}>
                <input type="radio" name="ptype" value="dp" checked={paymentType === 'dp'} onChange={e => setPaymentType(e.target.value)} style={{ accentColor: 'var(--pri)', width: '18px', height: '18px' }} /> 
                DP
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 500 }}>
                <input type="radio" name="ptype" value="full" checked={paymentType === 'full'} onChange={e => setPaymentType(e.target.value)} style={{ accentColor: 'var(--pri)', width: '18px', height: '18px' }} /> 
                Lunas (Full)
              </label>
            </div>
            
            <div style={{ marginBottom: '30px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#444' }}>Nominal (Rp)</label>
              <input type="number" placeholder="Contoh: 250000" value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)} style={{ width: '100%', padding: '12px 15px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '1rem', outline: 'none' }} />
            </div>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn btn-ol" style={{ flex: 1 }} onClick={() => setConfirmId(null)}>Batal</button>
              <button className="btn btn-sec" style={{ flex: 1 }} onClick={processConfirm}>Submit & Aktifkan</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DECLINE */}
      {declineId && (
        <div className="modal-overlay active" style={{ display: 'flex', zIndex: 9999 }}>
          <div className="modal-content" style={{ padding: '30px', background: '#fff', borderRadius: '12px', maxWidth: '350px', width: '90%', textAlign: 'center' }}>
            <i className='bx bx-error-circle' style={{ fontSize: '4rem', color: '#dc3545', marginBottom: '15px' }}></i>
            <h3 style={{ marginTop: 0, fontSize: '1.4rem' }}>Seriusan rek di decline?</h3>
            <p style={{ color: '#666', fontSize: '0.95rem', marginBottom: '25px', lineHeight: 1.5 }}>
              Reservasi ini akan dibatalkan dan statusnya berubah menjadi <strong>Declined</strong>.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn btn-ol" style={{ flex: 1 }} onClick={() => setDeclineId(null)}>Tidak</button>
              <button className="btn btn-pri" style={{ flex: 1, background: '#dc3545', borderColor: '#dc3545', color: '#fff' }} onClick={processDecline}>Ya, Decline</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
