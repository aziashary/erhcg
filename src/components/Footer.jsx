import { useState, useEffect } from 'react';

export default function Footer() {
  const [showTopBtn, setShowTopBtn] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowTopBtn(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <footer>
        <div className="container">
          <h3 style={{ color: 'var(--color-off-white)', marginBottom: '15px' }}>Rockshill Campground</h3>
          <p>&copy; 2026 Rockshill Campground. All rights reserved.</p>
        </div>
      </footer>

      {/* Scroll to Top */}
      <button 
        onClick={scrollToTop} 
        className={`scroll-to-top ${showTopBtn ? 'show' : ''}`} 
        aria-label="Scroll to top"
      >
        <i className='bx bx-up-arrow-alt'></i>
      </button>

      {/* Sticky WhatsApp */}
      <a href="https://wa.me/6281234567890" className="sticky-wa" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp Admin">
        <i className='bx bxl-whatsapp'></i>
      </a>
    </>
  );
}
