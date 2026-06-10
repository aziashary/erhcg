import { useState, useEffect } from 'react';
import ReceiptModal from './ReceiptModal';

export default function AdminDeclined() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sel, setSel] = useState(null);

  const load = () => {
    fetch('http://localhost:8000/api/hq-rockshill/reservations', {
      headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
    })
      .then(r => r.json())
      .then(res => { 
        setRows((res.data || []).filter(r => r.status === 'Declined' || r.status === 'Expired')); 
        setLoading(false); 
      })
      .catch(() => setLoading(false));
  };

  useEffect(load, []);

  const reactivate = (id) => {
    if (!window.confirm('Aktifkan kembali reservasi ini ke status Menunggu Konfirmasi?')) return;
    fetch(`http://localhost:8000/api/hq-rockshill/reservations/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
      body: JSON.stringify({ status: 'Menunggu Konfirmasi' }),
    })
      .then(r => r.json())
      .then(d => { if (d.status) { alert('Berhasil diaktifkan kembali!'); load(); } })
      .catch(() => alert('Gagal mengaktifkan reservasi.'));
  };

  if (loading) return <div className="empty">Memuat data...</div>;

  return (
    <>
      <div className="pg-hdr">
        <div>
          <h1>Riwayat / Dibatalkan</h1>
          <p>Daftar reservasi yang kadaluwarsa atau ditolak.</p>
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
              <th>Status</th>
              <th>Total Tagihan</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={7} className="empty">Tidak ada data pembatalan</td></tr>
            ) : rows.map(r => (
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
                <td><span style={{ color: r.status === 'Expired' ? '#f39c12' : '#dc3545', fontWeight: 600, fontSize: 13 }}>{r.status}</span></td>
                <td><span style={{ fontFamily: 'Outfit', fontWeight: 700, color: 'var(--pri)', fontSize: 15 }}>{r.total}</span></td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-ol btn-icon" onClick={() => setSel(r)}><i className="bx bx-receipt"></i></button>
                    <button className="btn btn-sec" style={{ background: '#28a745', borderColor: '#28a745' }} onClick={() => reactivate(r.id)}><i className="bx bx-refresh"></i> Reactivate</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── MOBILE CARDS ── */}
      <div className="mob-block" style={{ display: 'none' }}>
        {rows.length === 0 ? (
          <div className="empty">Tidak ada data pembatalan</div>
        ) : rows.map(r => (
          <div key={r.id} className="rc">
            <div className="rc-hdr">
              <div><div className="rc-id">{r.booking_code}</div><div className="rc-name">{r.nama}</div></div>
              <span className="chip" style={{ background: r.status === 'Expired' ? '#fff3cd' : '#f8d7da', color: r.status === 'Expired' ? '#856404' : '#721c24' }}>{r.status}</span>
            </div>
            <div className="rc-body">
              <div className="rc-meta">
                <div className="rc-meta-item"><span><i className="bx bx-calendar"></i> Tanggal</span><strong>{r.checkin} – {r.checkout}</strong></div>
                <div className="rc-meta-item"><span><i className="bx bx-map"></i> Area</span><strong>{r.area}</strong></div>
              </div>
              <hr className="rc-divider" />
              <div className="rc-total-lbl">Total Tagihan</div>
              <div className="rc-total-val">{r.total}</div>
            </div>
            <div className="rc-actions">
              <button className="btn btn-sec" style={{ flex: 1, background: '#28a745', borderColor: '#28a745' }} onClick={() => reactivate(r.id)}>Reactivate</button>
              <button className="btn btn-ol btn-icon" onClick={() => setSel(r)}><i className="bx bx-dots-vertical-rounded"></i></button>
            </div>
          </div>
        ))}
      </div>

      {sel && <ReceiptModal reservation={sel} onClose={() => setSel(null)} />}
    </>
  );
}
