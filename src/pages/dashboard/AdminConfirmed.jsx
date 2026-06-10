import { useState, useEffect } from 'react';
import ReceiptModal from './ReceiptModal';

const formatRupiah = (angka) => 'Rp ' + angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

export default function AdminConfirmed() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sel, setSel] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetch('http://localhost:8000/api/hq-rockshill/reservations', {
      headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
    })
      .then(r => r.json())
      .then(res => { setRows((res.data || []).filter(r => r.status === 'Confirmed')); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

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
          <h1>Sudah Bayar</h1>
          <p>Mengelola {rows.length} total pemesanan dan pembayaran terkonfirmasi.</p>
        </div>
        <div className="pg-hdr-right">
          <div className="search-wrap">
            <i className='bx bx-search'></i>
            <input 
              type="text" 
              placeholder="Cari nama, invoice..." 
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
              <th>No Invoice</th>
              <th>Nama</th>
              <th>Tanggal</th>
              <th>Area</th>
              <th>Pembayaran</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.length === 0 ? (
              <tr><td colSpan={6} className="empty">Tidak ada reservasi terkonfirmasi</td></tr>
            ) : filteredRows.map(r => {
              const totalNum = parseInt(r.total.replace(/[^0-9]/g, '') || 0, 10);
              const payAmtNum = parseInt((r.paymentAmount || '').replace(/[^0-9]/g, '') || 0, 10);
              return (
              <tr key={r.id}>
                <td>
                  <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 14 }}>{r.invoice_id || '-'}</div>
                  <div style={{ fontSize: 11, color: 'var(--on-dim)' }}>{r.booking_code}</div>
                </td>
                <td>
                  <div style={{ fontWeight: 600 }}>{r.nama}</div>
                  <div style={{ fontSize: 12, color: 'var(--on-dim)' }}>{r.wa}</div>
                </td>
                <td>
                  <div style={{ fontWeight: 600, color: 'var(--pri)', fontSize: 13 }}>{r.checkin} – {r.checkout}</div>
                  <div style={{ fontSize: 11, color: 'var(--on-dim)' }}>{r.nights} Malam</div>
                </td>
                <td><span className="area-chip">{r.area}</span></td>
                <td>
                  {r.paymentType === 'dp' ? (
                     <>
                        <div style={{ fontSize: 12 }}>DP: {formatRupiah(payAmtNum)}</div>
                        <div style={{ fontSize: 12, color: 'var(--on-dim)' }}>Sisa: {formatRupiah(totalNum - payAmtNum)}</div>
                        <div style={{ fontFamily: 'Outfit', fontWeight: 700, color: 'var(--pri)', fontSize: 13, marginTop: 4 }}>Total: {r.total}</div>
                        <div style={{ marginTop: 4 }}><span className="chip chip-o" style={{ fontSize: 10, background: '#fff3cd', color: '#856404', padding: '2px 8px' }}>DP</span></div>
                     </>
                  ) : (
                     <>
                        <div style={{ fontFamily: 'Outfit', fontWeight: 700, color: 'var(--pri)', fontSize: 15 }}>{r.total}</div>
                        <div><span className="chip chip-g" style={{ fontSize: 10 }}><i className="bx bx-check-circle"></i> Lunas</span></div>
                     </>
                  )}
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-ol btn-icon" onClick={() => setSel(r)}><i className="bx bx-receipt"></i></button>
                    <button className="btn btn-gh btn-icon"><i className="bx bx-dots-vertical-rounded"></i></button>
                  </div>
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── MOBILE CARDS ── */}
      <div className="mob-block" style={{ display: 'none' }}>
        <div className="ftabs" style={{ overflowX: 'auto', paddingBottom: 4, flexWrap: 'nowrap' }}>
          <button className="ftab on">Semua Area</button>
          {[2, 3, 4, 5, 6].map(a => <button key={a} className="ftab">Area {a}</button>)}
        </div>

        {filteredRows.length === 0 ? (
          <div className="empty">Tidak ada reservasi confirmed</div>
        ) : filteredRows.map(r => {
          const totalNum = parseInt(r.total.replace(/[^0-9]/g, '') || 0, 10);
          const payAmtNum = parseInt((r.paymentAmount || '').replace(/[^0-9]/g, '') || 0, 10);
          const isDp = r.paymentType === 'dp';
          return (
          <div key={r.id} className="site-card" onClick={() => setSel(r)} style={{ display: 'block', cursor: 'pointer', borderLeft: isDp ? '4px solid #f7bc6a' : '4px solid var(--sec)' }}>
            <div className="site-info" style={{ padding: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                <h4 style={{ fontSize: 15, wordBreak: 'break-word' }}>{r.invoice_id || r.booking_code}</h4>
                <span className="price" style={{ fontSize: 15, flexShrink: 0 }}>{r.total}</span>
              </div>
                <p style={{ fontSize: 12, marginBottom: 6 }}>{r.nama} • {r.area}</p>
                
                {isDp && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 8, padding: '4px 6px', background: 'var(--surface-low)', borderRadius: 4 }}>
                    <span>DP: {formatRupiah(payAmtNum)}</span>
                    <span style={{ color: '#dc3545', fontWeight: 600 }}>Sisa: {formatRupiah(totalNum - payAmtNum)}</span>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="chip" style={{ fontSize: 10, background: isDp ? '#fff3cd' : 'var(--sec-ctr)', color: isDp ? '#856404' : 'var(--on-sec-ctr)' }}>
                    {isDp ? 'DP' : <><i className="bx bx-check-circle"></i> Lunas</>}
                  </span>
                  <p style={{ margin: 0, fontSize: 11, color: 'var(--on-dim)' }}><i className="bx bx-calendar"></i> {r.checkin}</p>
                </div>
            </div>
          </div>
          );
        })}
      </div>

      {sel && <ReceiptModal reservation={sel} onClose={() => setSel(null)} />}
    </>
  );
}
