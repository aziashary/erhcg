import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    // Initial check
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleHashLink = (e, hash) => {
    if (location.pathname === '/') {
      e.preventDefault();
      const target = document.querySelector(hash);
      if (target) {
        window.scrollTo({
          top: target.getBoundingClientRect().top + window.scrollY - 80,
          behavior: 'smooth'
        });
        window.history.pushState(null, '', hash);
      }
    }
  };

  return (
    <header id="header" className={`${scrolled ? 'scrolled' : ''} ${menuOpen ? 'menu-open' : ''}`}>
      <div className="container header-inner">
        <div className="header-top-row">
          <Link to="/" className="logo" onClick={() => setMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <img src="/logo.png" alt="Rockshill Logo" style={{ height: '35px', width: 'auto' }} /> 
            <span>Rockshill.</span>
          </Link>
          <div className="header-action-mobile">
            <Link to="/reservation" className="btn btn-primary btn-reservasi-header" onClick={() => setMenuOpen(false)}>
              Reservasi <br className="mobile-break" /> Sekarang
            </Link>
          </div>
          <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle Menu">
            <i className={menuOpen ? 'bx bx-x' : 'bx bx-menu'}></i>
          </button>
        </div>
        <nav className={`nav-links ${menuOpen ? 'active' : ''}`}>
          <Link to="/#intro" onClick={(e) => { handleHashLink(e, '#intro'); setMenuOpen(false); }}>Tentang</Link>
          <Link to="/#offerings" onClick={(e) => { handleHashLink(e, '#offerings'); setMenuOpen(false); }}>Fasilitas</Link>
          <Link to="/#packages" onClick={(e) => { handleHashLink(e, '#packages'); setMenuOpen(false); }}>Paket</Link>
          <Link to="/gallery" onClick={() => setMenuOpen(false)}>Gallery</Link>
          <Link to="/#faq" onClick={(e) => { handleHashLink(e, '#faq'); setMenuOpen(false); }}>FAQ</Link>
          <Link to="/check-reservation" onClick={() => setMenuOpen(false)}>Cek Reservasi</Link>
        </nav>
        <div className="header-action-desktop">
          <Link to="/reservation" className="btn btn-primary" style={{ padding: '8px 20px' }}>Reservasi Sekarang</Link>
        </div>
      </div>
    </header>
  );
}
