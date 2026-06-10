import React, { useState } from 'react';
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
  const [showLogout, setShowLogout] = useState(false);
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
          <img src="/logo.png" alt="Rockshill Logo" style={{ height: 34, width: 'auto', objectFit: 'contain' }} />
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="/logo.png" alt="Rockshill Logo" style={{ height: 26, width: 'auto', objectFit: 'contain' }} />
          <h2>Rockshill Admin</h2>
        </div>
          <div className="mob-hdr-right">
            <i className="bx bx-log-out" style={{ fontSize: 26, color: 'var(--err)', cursor: 'pointer' }} onClick={() => setShowLogout(true)}></i>
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
      {/* ─── LOGOUT MODAL ─── */}
      {showLogout && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#fff', padding: 24, borderRadius: 16, width: '100%', maxWidth: 320, boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <h3 style={{ marginTop: 0, fontSize: 18, fontFamily: 'Outfit', color: '#1e1b16', display: 'flex', alignItems: 'center', gap: 8 }}>
              <i className="bx bx-log-out" style={{ color: 'var(--err)', fontSize: 22 }}></i> Konfirmasi
            </h3>
            <p style={{ fontSize: 14, color: '#504538', marginBottom: 20, lineHeight: 1.5 }}>Apakah Anda yakin ingin keluar dari halaman dasbor?</p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="btn btn-ol" onClick={() => setShowLogout(false)} style={{ flex: 1 }}>Batal</button>
              <button className="btn btn-pri" style={{ background: 'var(--err)', flex: 1 }} onClick={logout}>Ya, Keluar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
