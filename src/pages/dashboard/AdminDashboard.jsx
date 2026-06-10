import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const TODAY = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

export default function AdminDashboard() {
  const [stats, setStats] = useState({ total: 0, pending: 0, confirmed: 0 });
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8000/api/hq-rockshill/reservations', {
      headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
    })
      .then(r => r.json())
      .then(res => {
        const d = res.data || [];
        setStats({
          total: d.length,
          pending: d.filter(r => r.status === 'Menunggu Konfirmasi').length,
          confirmed: d.filter(r => r.status === 'Confirmed').length,
        });
        setRecent(d.slice(0, 5));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const chipFor = (s) =>
    s === 'Confirmed'
      ? <span className="chip chip-g"><i className="bx bx-check-circle"></i> Terkonfirmasi</span>
      : <span className="chip chip-b">Menunggu</span>;

  if (loading) return <div className="empty">Memuat data dashboard...</div>;

  return (
    <>
      {/* ─── PAGE HEADER ─── */}
      <div className="pg-hdr">
        <div>
          <h1>Summary Dashboard</h1>
          <p>Ringkasan Data Reservasi</p>
        </div>
        <div className="pg-hdr-right desk" style={{ alignItems: 'center', color: 'var(--on-dim)', fontSize: 13 }}>
          <i className="bx bx-calendar" style={{ fontSize: 16, marginRight: 4 }}></i>{TODAY}
        </div>
      </div>

      {/* Mobile title */}
      <div className="mob" style={{ flexDirection: 'column', marginBottom: 14 }}>
        <h1 style={{ fontFamily: 'Outfit', fontSize: 24, fontWeight: 700 }}>Ringkasan Dasbor</h1>
        <p style={{ fontSize: 13, color: 'var(--on-dim)' }}>Hari ini, {TODAY}</p>
      </div>

      {/* ─── ALERT ─── */}
      {stats.pending > 0 && (
        <div className={`alert ${stats.pending >= 5 ? 'err' : 'warn'}`}>
          <div className="alert-left">
            <div className={`alert-icon ${stats.pending >= 5 ? 'err' : 'warn'}`}>
              <i className="bx bx-error"></i>
            </div>
            <div className="alert-txt">
              <h4>{stats.pending >= 5 ? 'PERLU TINDAKAN' : 'Butuh Tindakan'}</h4>
              <p>Perhatian: Anda memiliki <strong>{stats.pending}</strong> reservasi menunggu konfirmasi Anda.</p>
            </div>
          </div>
          <Link to="/hq-rockshill/pending" className="btn btn-pri">Tinjau Sekarang</Link>
        </div>
      )}

      {/* ─── STATS ─── */}
      <div className="stats">
        <div className="stat">
          <div className="stat-top">
            <div className="stat-ico"><i className="bx bxs-book-content"></i></div>
            <span className="stat-badge g">+4.2%</span>
          </div>
          <div className="stat-lbl">Total Reservasi</div>
          <div className="stat-val">{stats.total.toLocaleString('id-ID')}</div>
        </div>

        <div className="stat">
          <div className="stat-top">
            <div className="stat-ico" style={{ background: 'var(--err-ctr)', color: 'var(--err)' }}>
              <i className="bx bx-error-circle"></i>
            </div>
            <span className="stat-badge r">Urgen</span>
          </div>
          <div className="stat-lbl">Menunggu Konfirmasi</div>
          <div className="stat-val" style={stats.pending ? { color: 'var(--err)' } : undefined}>{stats.pending}</div>
        </div>

        <div className="stat">
          <div className="stat-top">
            <div className="stat-ico" style={{ background: 'var(--sec-ctr)', color: 'var(--sec)' }}>
              <i className="bx bx-check-shield"></i>
            </div>
            <span className="stat-badge m">Bulan Ini</span>
          </div>
          <div className="stat-lbl">Terkonfirmasi</div>
          <div className="stat-val" style={{ color: 'var(--sec)' }}>{stats.confirmed}</div>
        </div>
      </div>

      {/* ─── RECENT ACTIVITY ─── */}
      <div className="sec-hdr">
        <h3>Aktivitas Terbaru</h3>
        <Link to="/hq-rockshill/pending">Lihat Semua</Link>
      </div>
      <div className="act-list">
        {recent.length === 0 ? (
          <div className="empty">Belum ada data reservasi</div>
        ) : recent.map(r => (
          <div key={r.id} className={`act-row ${r.status === 'Confirmed' ? 'a-grn' : 'a-brn'}`}>
            <div className="act-ava"><i className="bx bx-user"></i></div>
            <div className="act-info">
              <h4>{r.nama}</h4>
              <p>{r.area} • {r.nights} Malam ({r.checkin} – {r.checkout})</p>
            </div>
            <div className="act-rt">
              {chipFor(r.status)}
              <div className="act-price">{r.total}</div>
            </div>
          </div>
        ))}
      </div>

      {/* FAB (mobile) */}
      <button className="fab mob" style={{ display: 'none' }}><i className="bx bx-plus"></i></button>
    </>
  );
}
