import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const TODAY = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

export default function AdminDashboard() {
  const [stats, setStats] = useState({ total: 0, pending: 0, confirmedWeek: 0, confirmedMonth: 0 });
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/hq-rockshill/reservations', {
      headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
    })
      .then(r => r.json())
      .then(res => {
        const d = res.data || [];
        const now = new Date();
        
        // Start of week (Sunday)
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        
        // Start of month
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        let cWeek = 0;
        let cMonth = 0;

        d.filter(r => r.status === 'Confirmed').forEach(r => {
          const dateStr = r.created_at || r.created || r.checkin;
          if (dateStr) {
            const dt = new Date(dateStr);
            if (dt >= startOfWeek) cWeek++;
            if (dt >= startOfMonth) cMonth++;
          } else {
             cMonth++; // Fallback
          }
        });

        setStats({
          total: d.filter(r => r.status === 'Confirmed').length,
          pending: d.filter(r => r.status === 'Menunggu Konfirmasi').length,
          confirmedWeek: cWeek,
          confirmedMonth: cMonth,
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

  if (loading) return (
    <div style={{ padding: '20px 0' }}>
      <div className="skeleton skeleton-title"></div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
        <div className="skeleton skeleton-card" style={{ height: '80px' }}></div>
        <div className="skeleton skeleton-card" style={{ height: '80px' }}></div>
      </div>
      <div className="skeleton skeleton-card"></div>
    </div>
  );

  return (
    <>
      {/* ─── PAGE HEADER ─── */}
      <div className="pg-hdr desk">
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
      <div className="stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px', marginBottom: '24px' }}>
        <div className="stat" style={{ margin: 0 }}>
          <div className="stat-top">
            <div className="stat-ico"><i className="bx bxs-book-content"></i></div>
            <span className="stat-badge g">Semua</span>
          </div>
          <div className="stat-lbl">Total Reservasi</div>
          <div className="stat-val">{stats.total.toLocaleString('id-ID')}</div>
        </div>

        <div className="stat" style={{ margin: 0 }}>
          <div className="stat-top">
            <div className="stat-ico" style={{ background: 'var(--err-ctr)', color: 'var(--err)' }}>
              <i className="bx bx-error-circle"></i>
            </div>
          </div>
          <div className="stat-lbl">Belum Payment</div>
          <div className="stat-val" style={stats.pending ? { color: 'var(--err)' } : undefined}>{stats.pending}</div>
        </div>

        <div className="stat" style={{ margin: 0 }}>
          <div className="stat-top">
            <div className="stat-ico" style={{ background: 'var(--sec-ctr)', color: 'var(--sec)' }}>
              <i className="bx bx-check-shield"></i>
            </div>
            <span className="stat-badge m">Minggu Ini</span>
          </div>
          <div className="stat-lbl">Terkonfirmasi</div>
          <div className="stat-val" style={{ color: 'var(--sec)' }}>{stats.confirmedWeek}</div>
        </div>

        <div className="stat" style={{ margin: 0 }}>
          <div className="stat-top">
            <div className="stat-ico" style={{ background: '#e0f2fe', color: '#0284c7' }}>
              <i className="bx bx-calendar-check"></i>
            </div>
            <span className="stat-badge" style={{ background: '#e0f2fe', color: '#0284c7', fontSize: 10, padding: '3px 8px', borderRadius: 20, fontWeight: 600 }}>Bulan Ini</span>
          </div>
          <div className="stat-lbl">Terkonfirmasi</div>
          <div className="stat-val" style={{ color: '#0284c7' }}>{stats.confirmedMonth}</div>
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
    </>
  );
}
