export default function Footer() {
  return (
    <>
      <footer>
        <div className="container">
          <h3 style={{ color: 'var(--color-off-white)', marginBottom: '15px' }}>Rockshill Campground</h3>
          <p>&copy; 2026 Rockshill Campground. All rights reserved.</p>
        </div>
      </footer>

      {/* Sticky WhatsApp */}
      <a href="https://wa.me/6281234567890" className="sticky-wa" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp Admin">
        <i className='bx bxl-whatsapp'></i>
      </a>
    </>
  );
}
