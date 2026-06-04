import { useState } from 'react';
import { Link } from 'react-router-dom';
import HeroCanvas from '../components/HeroCanvas';

export default function Home() {
  const [activeFaq, setActiveFaq] = useState(null);

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <main className="page-transition">
      {/* 1. Hero Section */}
      <section className="hero" id="home">
        <HeroCanvas />
        <div className="hero-content">
          <h1>Camping dengan View Citylight dan Sunset di Rockshill Campground</h1>
          <p>Nikmati pengalaman camping yang nyaman dengan latar gemerlap citylight malam hari dan indahnya sunrise dan sunset yang syahdu.</p>
          <div className="hero-btns">
            <a href="#intro" className="btn btn-outline bounce-anim"
              style={{ borderRadius: '30px', borderColor: 'rgba(255,255,255,0.5)', padding: '12px 30px', fontWeight: 500 }}>
              More <i className='bx bx-chevron-down' style={{ verticalAlign: 'middle', fontSize: '1.2rem' }}></i>
            </a>
          </div>
        </div>
      </section>

      {/* 2. Intro Section */}
      <section className="intro section-padding" id="intro">
        <div className="container intro-grid">
          <div className="intro-text">
            <h2>Menyatu dengan Alam, No Worries.</h2>
            <p className="mb-3">Rockshill Campground hadir untuk memberikan pengalaman outdoor adventure yang natural dan nyaman. Terletak di perbukitan megamendung dengan pemandangan langsung ke alam dan citylight, tempat ini dirancang untuk Anda yang ingin kabur sejenak dari hiruk-pikuk kota.</p>
            <p>Dengan fasilitas lengkap, mulai dari penyewaan tenda hingga area campervan, Rockshill menjadi pilihan terbaik untuk liburan akhir pekan Anda.</p>
          </div>
          <div className="intro-img-wrapper">
            <img src="/campervan.png" alt="Campervan di Rockshill" />
          </div>
        </div>
      </section>

      {/* 3. View Section */}
      <section className="view-section" id="view">
        <img src="/sunset.png" alt="Sunset di Rockshill" />
        <div className="view-content container">
          <h2>Nikmati Golden Hour Terbaik di Sini.</h2>
          <p style={{ fontSize: '1.2rem', marginTop: '10px' }}>Suasana syahdu di pagi hari, hingga romantisnya malam penuh bintang.</p>
        </div>
      </section>

      {/* 4. Offering Persuasive Section */}
      <section className="offerings section-padding" id="offerings">
        <div className="container">
          <h2 className="section-title text-center">Kenapa Memilih Rockshill?</h2>
          <p className="section-subtitle text-center">Berbagai alasan mengapa campground kami cocok untuk liburan Anda.</p>

          <div className="features-grid">
            <div className="feature-card">
              <i className='bx bx-home-alt feature-icon'></i>
              <h3>Sewa Paket Tenda Lengkap</h3>
              <p>Datang tinggal bawa badan. Tenda, matras, sleeping bag, hingga alat masak sudah kami siapkan.</p>
            </div>
            <div className="feature-card">
              <i className='bx bx-car feature-icon'></i>
              <h3>Campervan & Bawa Tenda</h3>
              <p>Punya perlengkapan sendiri? Silakan bawa tenda Anda atau parkir campervan di area khusus kami.</p>
            </div>
            <div className="feature-card">
              <i className='bx bx-user-check feature-icon'></i>
              <h3>Reservasi Lebih Mudah</h3>
              <p>Pilih paket, cek ketersediaan area, dan booking secara online tanpa harus antri chat.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Paket Terpopuler */}
      <section className="packages section-padding" id="packages">
        <div className="container">
          <h2 className="section-title text-center">Paket Terpopuler</h2>
          <p className="section-subtitle text-center">Pilih paket camping yang paling sesuai dengan kebutuhan rombongan Anda.</p>

          <div className="package-grid">
            {/* Paket Konten */}
            <div className="package-card">
              <div className="package-header" style={{ backgroundColor: 'var(--color-primary-brown)', position: 'relative' }}>
                <div className="package-badge badge-best-seller">
                  <svg viewBox="0 0 100 100" className="badge-starburst">
                    <polygon points="98.00,50.00 89.75,54.48 96.80,60.68 87.76,63.21 93.25,70.83 83.87,71.28 87.53,79.93 78.28,78.28 79.93,87.53 71.28,83.87 70.83,93.25 63.21,87.76 60.68,96.80 54.48,89.75 50.00,98.00 45.52,89.75 39.32,96.80 36.79,87.76 29.17,93.25 28.72,83.87 20.07,87.53 21.72,78.28 12.47,79.93 16.13,71.28 6.75,70.83 12.24,63.21 3.20,60.68 10.25,54.48 2.00,50.00 10.25,45.52 3.20,39.32 12.24,36.79 6.75,29.17 16.13,28.72 12.47,20.07 21.72,21.72 20.07,12.47 28.72,16.13 29.17,6.75 36.79,12.24 39.32,3.20 45.52,10.25 50.00,2.00 54.48,10.25 60.68,3.20 63.21,12.24 70.83,6.75 71.28,16.13 79.93,12.47 78.28,21.72 87.53,20.07 83.87,28.72 93.25,29.17 87.76,36.79 96.80,39.32 89.75,45.52"></polygon>
                  </svg>
                  <span className="badge-text">Best<br />Seller</span>
                </div>
                <h3 className="package-title">Paket Konten</h3>
                <div className="package-price" style={{ fontSize: '1.5rem' }}>Mulai dari Rp 290.000<span>/malam</span></div>
              </div>
              <div className="package-body">
                <p style={{ marginBottom: '15px', fontSize: '0.9rem', color: 'var(--color-warm-gray)' }}>Paket favorit untuk camping yang lebih nyaman dan konten-ready.</p>
                <ul className="package-list">
                  <li>Tenda, Sleeping Bag, Matras</li>
                  <li>Lampu tenda & Tumblr</li>
                  <li>2 Kursi & 1 Meja</li>
                  <li>Kabel Roll & Tripod</li>
                </ul>
                <div style={{ backgroundColor: 'var(--color-broken-white)', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <strong>Kapasitas 2 Orang:</strong>
                    <span style={{ color: 'var(--color-primary-brown)', fontWeight: 'bold' }}>Rp 290.000</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <strong>Kapasitas 4 Orang:</strong>
                    <span style={{ color: 'var(--color-primary-brown)', fontWeight: 'bold' }}>Rp 340.000</span>
                  </div>
                </div>
                <p style={{ fontSize: '0.8rem', color: '#d9534f', fontWeight: 'bold' }}>*Belum termasuk HTM & flysheet</p>
              </div>
              <div className="package-footer">
                <Link to="/reservation" className="btn btn-primary" style={{ width: '100%', display: 'block', boxSizing: 'border-box' }}>Pilih Paket</Link>
              </div>
            </div>

            {/* Paket Lengkap */}
            <div className="package-card">
              <div className="package-header" style={{ backgroundColor: 'var(--color-forest-green)', position: 'relative' }}>
                <div className="package-badge badge-recommended">
                  <svg viewBox="0 0 100 100" className="badge-starburst">
                    <polygon points="98.00,50.00 89.75,54.48 96.80,60.68 87.76,63.21 93.25,70.83 83.87,71.28 87.53,79.93 78.28,78.28 79.93,87.53 71.28,83.87 70.83,93.25 63.21,87.76 60.68,96.80 54.48,89.75 50.00,98.00 45.52,89.75 39.32,96.80 36.79,87.76 29.17,93.25 28.72,83.87 20.07,87.53 21.72,78.28 12.47,79.93 16.13,71.28 6.75,70.83 12.24,63.21 3.20,60.68 10.25,54.48 2.00,50.00 10.25,45.52 3.20,39.32 12.24,36.79 6.75,29.17 16.13,28.72 12.47,20.07 21.72,21.72 20.07,12.47 28.72,16.13 29.17,6.75 36.79,12.24 39.32,3.20 45.52,10.25 50.00,2.00 54.48,10.25 60.68,3.20 63.21,12.24 70.83,6.75 71.28,16.13 79.93,12.47 78.28,21.72 87.53,20.07 83.87,28.72 93.25,29.17 87.76,36.79 96.80,39.32 89.75,45.52"></polygon>
                  </svg>
                  <span className="badge-text">Recom-<br />mended</span>
                </div>
                <h3 className="package-title">Paket Lengkap</h3>
                <div className="package-price" style={{ fontSize: '1.5rem' }}>Mulai dari Rp 560.000<span>/malam</span></div>
              </div>
              <div className="package-body">
                <p style={{ marginBottom: '15px', fontSize: '0.9rem', color: 'var(--color-warm-gray)' }}>Paket paling praktis, datang dan camping tanpa ribet.</p>
                <ul className="package-list">
                  <li>Tenda, Sleeping Bag, Matras</li>
                  <li>Lampu tenda & Tumblr</li>
                  <li>2 Kursi & 1 Meja, Kabel Roll</li>
                  <li>Paket Grill & Alat Masak</li>
                  <li>Termasuk HTM & Flysheet</li>
                </ul>
                <div style={{ backgroundColor: 'var(--color-broken-white)', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <strong>Kapasitas 2 Orang:</strong>
                    <span style={{ color: 'var(--color-forest-green)', fontWeight: 'bold' }}>Rp 560.000</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <strong>Kapasitas 4 Orang:</strong>
                    <span style={{ color: 'var(--color-forest-green)', fontWeight: 'bold' }}>Rp 680.000</span>
                  </div>
                </div>
              </div>
              <div className="package-footer">
                <Link to="/reservation" className="btn btn-primary" style={{ width: '100%', display: 'block', boxSizing: 'border-box' }}>Pilih Paket</Link>
              </div>
            </div>
          </div>

          <div className="text-center" style={{ marginTop: '40px' }}>
            <Link to="/packages" className="btn btn-outline" style={{ color: 'var(--color-dark-brown)', borderColor: 'var(--color-dark-brown)' }}>Lihat Semua Paket & Sewa Alat</Link>
          </div>
        </div>
      </section>

      {/* 6. Cocok Untuk */}
      <section className="suitable-for">
        <div className="container text-center">
          <h3 className="mb-3" style={{ color: 'var(--color-warm-gray)' }}>Sangat Cocok Untuk</h3>
          <div className="suitable-tags">
            <div className="tag">Family Camping</div>
            <div className="tag">Couple Camping</div>
            <div className="tag">Group Camping</div>
            <div className="tag">Community Trip</div>
            <div className="tag">Campervan</div>
          </div>
        </div>
      </section>

      {/* 7. Fasilitas */}
      <section className="facilities section-padding">
        <div className="container">
          <h2 className="section-title text-center">Fasilitas Area</h2>
          <div className="facilities-card-grid mt-4">
            <div className="facility-card">
              <div className="facility-icon-wrap"><i className='bx bx-buildings'></i></div>
              <div className="facility-info">
                <h3>View Citylight</h3>
                <p>Pemandangan gemerlap lampu kota yang indah di malam hari.</p>
              </div>
            </div>
            <div className="facility-card">
              <div className="facility-icon-wrap"><i className='bx bx-water'></i></div>
              <div className="facility-info">
                <h3>Toilet Bersih</h3>
                <p>Fasilitas MCK yang selalu dijaga kebersihannya.</p>
              </div>
            </div>
            <div className="facility-card">
              <div className="facility-icon-wrap"><i className='bx bx-building-house'></i></div>
              <div className="facility-info">
                <h3>Mushola</h3>
                <p>Area beribadah yang nyaman dan bersih.</p>
              </div>
            </div>
            <div className="facility-card">
              <div className="facility-icon-wrap"><i className='bx bx-car'></i></div>
              <div className="facility-info">
                <h3>Area Parkir</h3>
                <p>Parkiran luas yang aman untuk mobil dan motor.</p>
              </div>
            </div>
            <div className="facility-card">
              <div className="facility-icon-wrap"><i className='bx bx-landscape'></i></div>
              <div className="facility-info">
                <h3>View Alam</h3>
                <p>Pemandangan perbukitan yang indah dipandang mata.</p>
              </div>
            </div>
            <div className="facility-card">
              <div className="facility-icon-wrap"><i className='bx bx-restaurant'></i></div>
              <div className="facility-info">
                <h3>Paket Grill & Warung</h3>
                <p>Tersedia aneka makanan dan penyewaan alat grill.</p>
              </div>
            </div>
            <div className="facility-card">
              <div className="facility-icon-wrap"><i className='bx bxs-hot'></i></div>
              <div className="facility-info">
                <h3>Area Api Unggun</h3>
                <p>Spot khusus untuk menikmati malam dengan api unggun.</p>
              </div>
            </div>
            <div className="facility-card">
              <div className="facility-icon-wrap"><i className='bx bx-plug'></i></div>
              <div className="facility-info">
                <h3>Colokan Listrik</h3>
                <p>Akses listrik mudah untuk ngecharge gadget Anda.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. What to Bring */}
      <section className="what-to-bring section-padding">
        <div className="container text-center">
          <h2 className="section-title">Yang Perlu Dibawa</h2>
          <p className="section-subtitle">Biar camping makin nyaman, jangan lupa siapin beberapa barang pribadi sebelum datang ke Rockshill.</p>
          <div className="bring-list">
            <div className="bring-item">Pakaian Ganti & Hangat</div>
            <div className="bring-item">Powerbank & Charger</div>
            <div className="bring-item">Obat-obatan Pribadi</div>
            <div className="bring-item">Makanan Pribadi</div>
            <div className="bring-item">Snack Pribadi</div>
            <div className="bring-item">Peralatan Mandi</div>
            <div className="bring-item">Jas Hujan</div>
            <div className="bring-item" style={{ background: 'rgba(255,215,0,0.3)', border: '1px solid #FFD700' }}>Good Mood Wajib Dibawa!</div>
          </div>
        </div>
      </section>

      {/* 9. Testimonial */}
      <section className="testimonials section-padding">
        <div className="container">
          <h2 className="section-title text-center">Apa Kata Mereka?</h2>
          <div className="testimonial-grid mt-4">
            <div className="testimonial-card">
              <div className="stars">★★★★★</div>
              <p className="testi-text">"View nya juara banget! Fasilitasnya juga lengkap dan bersih. Bakal balik lagi ke sini buat camping bareng keluarga."</p>
              <div className="testi-author">- Budi Santoso</div>
            </div>
            <div className="testimonial-card">
              <div className="stars">★★★★★</div>
              <p className="testi-text">"Adminnya fast respon, tenda udah siap waktu kita dateng. Api unggun malamnya seru banget. Recommended pokoknya!"</p>
              <div className="testi-author">- Rina Melati</div>
            </div>
            <div className="testimonial-card">
              <div className="stars">★★★★★</div>
              <p className="testi-text">"Tempat campervan terbaik yang pernah saya kunjungin. Akses mudah dan pemandangannya bikin healing."</p>
              <div className="testi-author">- Andi Pratama</div>
            </div>
          </div>
        </div>
      </section>

      {/* 10. FAQ */}
      <section className="faq section-padding" id="faq">
        <div className="container">
          <h2 className="section-title text-center">Frequently Asked Questions</h2>
          <div className="faq-container mt-4">
            {[
              { q: 'Apakah bisa bawa tenda sendiri?', a: 'Bisa. Anda cukup membayar HTM Bawa Tenda Sendiri sebesar Rp45.000/orang.' },
              { q: 'Apakah HTM sudah termasuk dalam paket?', a: 'Ya, untuk Paket Lengkap (2 Orang atau 4 Orang) sudah termasuk HTM.' },
              { q: 'Apakah anak-anak bayar HTM?', a: 'Anak di bawah usia 5 tahun gratis HTM.' },
              { q: 'Apakah bisa reschedule atau refund?', a: 'Reservasi tidak bisa direfund. Reschedule diperbolehkan maksimal H-3 sebelum kedatangan.' }
            ].map((faq, idx) => (
              <div key={idx} className={`faq-item ${activeFaq === idx ? 'active' : ''}`}>
                <div className="faq-question" onClick={() => toggleFaq(idx)}>
                  {faq.q} <i className={`bx bx-chevron-${activeFaq === idx ? 'up' : 'down'}`}></i>
                </div>
                <div className="faq-answer">{faq.a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 11. Lokasi */}
      <section className="location section-padding">
        <div className="container text-center">
          <h2 className="section-title">Lokasi Kami</h2>
          <p className="section-subtitle">Temukan kami dengan mudah menggunakan Google Maps.</p>
          <div className="map-container">
            <iframe src="https://maps.google.com/maps?q=Rockshill+Campground&hl=id&z=15&output=embed" allowFullScreen="" loading="lazy" title="Google Maps"></iframe>
          </div>
          <a href="https://maps.app.goo.gl/DfcJr7Fbd4JmpxBq7" target="_blank" rel="noopener noreferrer" className="btn btn-primary"><i className='bx bxl-google'></i> Buka Google Maps</a>
        </div>
      </section>

      {/* 12. Final CTA */}
      <section className="final-cta section-padding">
        <div className="container">
          <h2 className="section-title">Siap untuk Petualangan Anda?</h2>
          <p style={{ fontSize: '1.2rem', marginBottom: '20px' }}>Amankan spot terbaik Anda hari ini. Slot terbatas setiap akhir pekan!</p>
          <div className="final-btns">
            <Link to="/reservation" className="btn btn-outline">Reservasi Online</Link>
            <a href="https://wa.me/6281234567890" className="btn btn-secondary" target="_blank" rel="noopener noreferrer"><i className='bx bxl-whatsapp'></i> Hubungi Admin</a>
          </div>
        </div>
      </section>
    </main>
  );
}
