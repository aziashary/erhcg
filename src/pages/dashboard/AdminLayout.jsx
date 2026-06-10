import { Navigate, Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import './dashboard.css';

const NAV = [
  { label: 'Dasbor', path: '/hq-rockshill', ico: 'bx-grid-alt', icoOn: 'bxs-grid-alt' },
  { label: 'Belum Bayar', path: '/hq-rockshill/pending', ico: 'bx-error-circle', icoOn: 'bxs-error-circle' },
  { label: 'Sudah Bayar', path: '/hq-rockshill/confirmed', ico: 'bx-credit-card', icoOn: 'bxs-credit-card' },
  { label: 'Riwayat / Dibatalkan', path: '/hq-rockshill/declined', ico: 'bx-history', icoOn: 'bx-history' },
  { label: 'Kalender', path: '/hq-rockshill/calendar', ico: 'bx-calendar', icoOn: 'bxs-calendar' },
  { label: 'Harga', path: '/hq-rockshill/prices', ico: 'bx-purchase-tag-alt', icoOn: 'bxs-purchase-tag-alt' },
];

export default function AdminLayout() {
  const token = localStorage.getItem('adminToken');
  const navigate = useNavigate();
  const { pathname } = useLocation();

  if (!token) return <Navigate to="/hq-rockshill/login" replace />;

  const active = (p) => p === '/hq-rockshill' ? pathname === p : pathname.startsWith(p);
  const logout = () => { localStorage.removeItem('adminToken'); navigate('/hq-rockshill/login'); };

  return (
    <div className="admin-root">

      {/* ─── SIDEBAR ─── */}
      <aside className="sb desk">
        <div className="sb-brand">
          <div className="sb-logo"><i className="bx bx-mountain"></i></div>
          <div>
            <h3>Rockshill</h3>
            <small>Admin Perkemahan</small>
          </div>
        </div>

        <div className="sb-cta">
          <button className="sb-cta-btn"><i className="bx bx-plus"></i> Reservasi Baru</button>
        </div>

        <nav className="sb-nav">
          {NAV.map(n => (
            <Link key={n.path} to={n.path} className={`sb-link ${active(n.path) ? 'active' : ''}`}>
              <i className={`bx ${active(n.path) ? n.icoOn : n.ico}`}></i>{n.label}
            </Link>
          ))}
        </nav>

        <div className="sb-foot">
          <button className="sb-foot-btn"><i className="bx bx-cog"></i> Pengaturan</button>
          <button className="sb-foot-btn danger" onClick={logout}><i className="bx bx-log-out"></i> Keluar</button>
        </div>
      </aside>

      {/* ─── MAIN ─── */}
      <div className="main-wrap">
        {/* Mobile header */}
        <header className="mob-hdr">
          <h2>Rockshill Admin</h2>
          <div className="mob-hdr-right">
            <i className="bx bx-bell" style={{ fontSize: 22, color: 'var(--on-dim)' }}></i>
            <div className="avatar"></div>
          </div>
        </header>

        {/* Desktop topbar */}
        <header className="top-bar desk">
        </header>

        <main className="content"><Outlet /></main>
      </div>

      {/* ─── BOTTOM NAV ─── */}
      <nav className="bot-nav">
        {NAV.map(n => (
          <Link key={n.path} to={n.path} className={`bot-link ${active(n.path) ? 'active' : ''}`}>
            <i className={`bx ${active(n.path) ? n.icoOn : n.ico}`}></i>
          </Link>
        ))}
      </nav>
    </div>
  );
}
