import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
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
    <header id="header" className={scrolled ? 'scrolled' : ''}>
      <div className="container header-inner">
        <Link to="/" className="logo" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <img src="/logo.png" alt="Rockshill Logo" style={{ height: '35px', width: 'auto' }} /> 
          <span>Rockshill.</span>
        </Link>
        <nav className="nav-links">
          <Link to="/#intro" onClick={(e) => handleHashLink(e, '#intro')}>Tentang</Link>
          <Link to="/#offerings" onClick={(e) => handleHashLink(e, '#offerings')}>Fasilitas</Link>
          <Link to="/#packages" onClick={(e) => handleHashLink(e, '#packages')}>Paket</Link>
          <Link to="/gallery">Gallery</Link>
          <Link to="/#faq" onClick={(e) => handleHashLink(e, '#faq')}>FAQ</Link>
          <Link to="/check-reservation">Cek Reservasi</Link>
        </nav>
        <Link to="/reservation" className="btn btn-primary" style={{ padding: '8px 20px' }}>Reservasi Sekarang</Link>
      </div>
    </header>
  );
}
