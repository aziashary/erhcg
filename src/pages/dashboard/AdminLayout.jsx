import React, { useState } from 'react';
import { Navigate, Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import './dashboard.css';

const NAV = [
  { label: 'Overview', path: '/hq-rockshill/dashboard', ico: 'bx-grid-alt', icoOn: 'bxs-grid-alt' },
  { label: 'Perlu Konfirmasi', path: '/hq-rockshill/pending', ico: 'bx-time', icoOn: 'bxs-time' },
  { label: 'Reservasi', path: '/hq-rockshill/confirmed', ico: 'bx-check-shield', icoOn: 'bxs-check-shield' },
  { label: 'Kalender', path: '/hq-rockshill/calendar', ico: 'bx-calendar', icoOn: 'bxs-calendar' },
  { label: 'Kelola Katalog', path: '/hq-rockshill/catalog', ico: 'bx-package', icoOn: 'bxs-package' },
];

export default function AdminLayout() {
  const [showLogout, setShowLogout] = useState(false);
  const token = localStorage.getItem('adminToken');
  const adminRole = localStorage.getItem('adminRole') || 'admin';
  const navigate = useNavigate();
  const { pathname } = useLocation();

  if (!token) return <Navigate to="/hq-rockshill/login" replace />;

  const navItems = NAV.filter(n => {
    if (adminRole === 'kasir') {
      if (n.path === '/hq-rockshill/catalog') return false;
      if (n.path === '/hq-rockshill/dashboard') return false;
      if (n.path === '/hq-rockshill/pending') return false;
    }
    return true;
  });

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
          {adminRole !== 'kasir' && (
            <Link to="/hq-rockshill/manual-reservation" className="sb-cta-btn" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>
              <i className="bx bx-plus"></i> Buat Reservasi
            </Link>
          )}
          <Link to="/hq-rockshill/pos" className="sb-cta-btn" style={{ display: 'block', textAlign: 'center', textDecoration: 'none', background: '#2d8a4e', color: '#fff', marginTop: '10px' }}>
            <i className="bx bx-store"></i> Point of Sale
          </Link>
        </div>

        <nav className="sb-nav">
          {navItems.map(n => (
            <Link key={n.path} to={n.path} className={`sb-link ${active(n.path) ? 'active' : ''}`}>
              <i className={`bx ${active(n.path) ? n.icoOn : n.ico}`}></i>{n.label}
            </Link>
          ))}
        </nav>

        <div className="sb-foot">
          {adminRole === 'superadmin' && (
            <>
              <Link to="/hq-rockshill/settings" className="sb-foot-btn" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: 8 }}><i className="bx bx-cog"></i> Pengaturan</Link>
              <Link to="/hq-rockshill/users" className="sb-foot-btn" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: 8 }}><i className="bx bx-user"></i> Manajemen User</Link>
            </>
          )}
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
          <div className="mob-hdr-right" style={{ display: 'flex', gap: 15, alignItems: 'center' }}>
            {adminRole === 'superadmin' && (
              <>
                <i className="bx bx-user" style={{ fontSize: 26, color: 'var(--pri)', cursor: 'pointer' }} onClick={() => navigate('/hq-rockshill/users')}></i>
                <i className="bx bx-cog" style={{ fontSize: 26, color: 'var(--pri)', cursor: 'pointer' }} onClick={() => navigate('/hq-rockshill/settings')}></i>
              </>
            )}
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
        {navItems.map(n => (
          <Link key={n.path} to={n.path} className={`bot-link ${active(n.path) ? 'active' : ''}`}>
            <i className={`bx ${active(n.path) ? n.icoOn : n.ico}`}></i>
          </Link>
        ))}
      </nav>

      {/* ─── MOBILE FAB ─── */}
      <div className="mob" style={{ position: 'fixed', bottom: 80, right: 20, display: 'flex', flexDirection: 'column', gap: 10, zIndex: 100 }}>
        <Link to="/hq-rockshill/pos" className="fab" style={{ textDecoration: 'none', background: '#2d8a4e', color: '#fff', position: 'relative', right: 'auto', bottom: 'auto' }}>
          <i className="bx bx-store"></i>
        </Link>
        {adminRole !== 'kasir' && (
          <Link to="/hq-rockshill/manual-reservation" className="fab" style={{ textDecoration: 'none', position: 'relative', right: 'auto', bottom: 'auto' }}>
            <i className="bx bx-plus"></i>
          </Link>
        )}
      </div>
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
