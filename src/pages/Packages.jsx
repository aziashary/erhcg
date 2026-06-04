import { Link } from 'react-router-dom';

export default function Packages() {
  return (
    <main className="page-transition">
      <div className="page-header">
        <div className="container">
          <h1>Pricelist Lengkap</h1>
          <p>Pilih paket tenda dan perlengkapan tambahan sesuai kebutuhan Anda.</p>
        </div>
      </div>

      <section className="section-padding" style={{ backgroundColor: 'var(--color-broken-white)' }}>
        <div className="container">
          <Link to="/" className="back-btn"><i className='bx bx-arrow-back'></i> Kembali ke Beranda</Link>
          
          <h2 className="section-title text-center">Seluruh Paket Tenda</h2>
          <p className="section-subtitle text-center">Daftar lengkap paket camping yang tersedia di Rockshill Campground.</p>
          
          <div className="package-grid mb-5">
            {/* BARIS 1: PAKET LENGKAP */}
            <div className="package-card">
              <div className="package-header" style={{ backgroundColor: 'var(--color-forest-green)', position: 'relative' }}>
                <div className="package-badge badge-recommended">
                  <svg viewBox="0 0 100 100" className="badge-starburst">
                    <polygon points="98.00,50.00 89.75,54.48 96.80,60.68 87.76,63.21 93.25,70.83 83.87,71.28 87.53,79.93 78.28,78.28 79.93,87.53 71.28,83.87 70.83,93.25 63.21,87.76 60.68,96.80 54.48,89.75 50.00,98.00 45.52,89.75 39.32,96.80 36.79,87.76 29.17,93.25 28.72,83.87 20.07,87.53 21.72,78.28 12.47,79.93 16.13,71.28 6.75,70.83 12.24,63.21 3.20,60.68 10.25,54.48 2.00,50.00 10.25,45.52 3.20,39.32 12.24,36.79 6.75,29.17 16.13,28.72 12.47,20.07 21.72,21.72 20.07,12.47 28.72,16.13 29.17,6.75 36.79,12.24 39.32,3.20 45.52,10.25 50.00,2.00 54.48,10.25 60.68,3.20 63.21,12.24 70.83,6.75 71.28,16.13 79.93,12.47 78.28,21.72 87.53,20.07 83.87,28.72 93.25,29.17 87.76,36.79 96.80,39.32 89.75,45.52"></polygon>
                  </svg>
                  <span className="badge-text">Recommended</span>
                </div>
                <h3 className="package-title">Paket Lengkap (4 Orang)</h3>
                <div className="package-price">Rp 680.000<span>/malam</span></div>
              </div>
              <div className="package-body">
                <ul className="package-list">
                  <li>Tenda 4P, 4 SB, 4 Matras 90x180</li>
                  <li>Lampu tenda & Tumblr</li>
                  <li>4 Kursi & 1 Meja, Kabel Roll</li>
                  <li>Paket Grill & Alat Masak</li>
                  <li>Termasuk HTM 4 Orang & Flysheet</li>
                </ul>
              </div>
            </div>

            <div className="package-card">
              <div className="package-header" style={{ backgroundColor: 'var(--color-forest-green)' }}>
                <h3 className="package-title">Paket Lengkap (2 Orang)</h3>
                <div className="package-price">Rp 560.000<span>/malam</span></div>
              </div>
              <div className="package-body">
                <ul className="package-list">
                  <li>Tenda 2P, 2 SB, 2 Matras 90x180</li>
                  <li>Lampu tenda & Tumblr</li>
                  <li>2 Kursi & 1 Meja, Kabel Roll</li>
                  <li>Paket Grill & Alat Masak</li>
                  <li>Termasuk HTM 2 Orang & Flysheet</li>
                </ul>
              </div>
            </div>

            {/* BARIS 2: PAKET KONTEN */}
            <div className="package-card">
              <div className="package-header" style={{ backgroundColor: 'var(--color-primary-brown)', position: 'relative' }}>
                <div className="package-badge badge-best-seller">
                  <svg viewBox="0 0 100 100" className="badge-starburst">
                    <polygon points="98.00,50.00 89.75,54.48 96.80,60.68 87.76,63.21 93.25,70.83 83.87,71.28 87.53,79.93 78.28,78.28 79.93,87.53 71.28,83.87 70.83,93.25 63.21,87.76 60.68,96.80 54.48,89.75 50.00,98.00 45.52,89.75 39.32,96.80 36.79,87.76 29.17,93.25 28.72,83.87 20.07,87.53 21.72,78.28 12.47,79.93 16.13,71.28 6.75,70.83 12.24,63.21 3.20,60.68 10.25,54.48 2.00,50.00 10.25,45.52 3.20,39.32 12.24,36.79 6.75,29.17 16.13,28.72 12.47,20.07 21.72,21.72 20.07,12.47 28.72,16.13 29.17,6.75 36.79,12.24 39.32,3.20 45.52,10.25 50.00,2.00 54.48,10.25 60.68,3.20 63.21,12.24 70.83,6.75 71.28,16.13 79.93,12.47 78.28,21.72 87.53,20.07 83.87,28.72 93.25,29.17 87.76,36.79 96.80,39.32 89.75,45.52"></polygon>
                  </svg>
                  <span className="badge-text">Best Seller</span>
                </div>
                <h3 className="package-title">Paket Konten (4 Orang)</h3>
                <div className="package-price">Rp 340.000<span>/malam</span></div>
              </div>
              <div className="package-body">
                <ul className="package-list">
                  <li>Tenda 4P, 4 SB, 4 Matras 90x180</li>
                  <li>Lampu tenda & Tumblr</li>
                  <li>4 Kursi & 1 Meja</li>
                  <li>Kabel Roll & Tripod</li>
                </ul>
                <p style={{ fontSize: '0.8rem', color: '#d9534f', fontWeight: 'bold' }}>*Belum termasuk HTM & flysheet</p>
              </div>
            </div>

            <div className="package-card">
              <div className="package-header" style={{ backgroundColor: 'var(--color-primary-brown)' }}>
                <h3 className="package-title">Paket Konten (2 Orang)</h3>
                <div className="package-price">Rp 290.000<span>/malam</span></div>
              </div>
              <div className="package-body">
                <ul className="package-list">
                  <li>Tenda 2P, 2 SB, 2 Matras 90x180</li>
                  <li>Lampu tenda & Tumblr</li>
                  <li>2 Kursi & 1 Meja</li>
                  <li>Kabel Roll & Tripod</li>
                </ul>
                <p style={{ fontSize: '0.8rem', color: '#d9534f', fontWeight: 'bold' }}>*Belum termasuk HTM & flysheet</p>
              </div>
            </div>

            {/* BARIS 3: PAKET FULLSET */}
            <div className="package-card">
              <div className="package-header" style={{ backgroundColor: 'var(--color-warm-gray)' }}>
                <h3 className="package-title">Paket Fullset (4 Orang)</h3>
                <div className="package-price">Rp 240.000<span>/malam</span></div>
              </div>
              <div className="package-body">
                <ul className="package-list">
                  <li>Tenda 4P, 4 SB, 4 Matras 90x180</li>
                  <li>Lampu tenda & Kabel Roll</li>
                </ul>
                <p style={{ fontSize: '0.8rem', color: '#d9534f', fontWeight: 'bold' }}>*Belum termasuk HTM & flysheet</p>
              </div>
            </div>

            <div className="package-card">
              <div className="package-header" style={{ backgroundColor: 'var(--color-warm-gray)' }}>
                <h3 className="package-title">Paket Fullset (2 Orang)</h3>
                <div className="package-price">Rp 190.000<span>/malam</span></div>
              </div>
              <div className="package-body">
                <ul className="package-list">
                  <li>Tenda 2P, 2 SB, 2 Matras 90x180</li>
                  <li>Lampu tenda & Kabel Roll</li>
                </ul>
                <p style={{ fontSize: '0.8rem', color: '#d9534f', fontWeight: 'bold' }}>*Belum termasuk HTM & flysheet</p>
              </div>
            </div>
          </div>
          
          <hr style={{ border: 'none', borderTop: '1px solid var(--color-soft-beige)', margin: '60px 0' }} />

          <h2 className="section-title text-center">Daftar Sewa Alat & Tambahan</h2>
          <p className="section-subtitle text-center">Jika Anda membawa tenda sendiri atau membutuhkan alat extra di luar paket.</p>
          
          <div className="table-container mb-5">
            <table>
              <thead>
                <tr>
                  <th>Nama Alat / Item</th>
                  <th style={{ textAlign: 'right' }}>Harga (Rp)</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>HTM (Harga Tiket Masuk)</td><td className="price-cell">35.000</td></tr>
                <tr><td>HTM Tenda Sendiri</td><td className="price-cell">45.000</td></tr>
                <tr><td>Flysheet</td><td className="price-cell">35.000</td></tr>
                <tr><td>Sleeping Bag</td><td className="price-cell">15.000</td></tr>
                <tr><td>Matras 90x180</td><td className="price-cell">10.000</td></tr>
                <tr><td>Matras 180x180</td><td className="price-cell">20.000</td></tr>
                <tr><td>Lampu Tenda</td><td className="price-cell">15.000</td></tr>
                <tr><td>Lampu Tumblr</td><td className="price-cell">25.000</td></tr>
                <tr><td>Kompor Portable</td><td className="price-cell">30.000</td></tr>
                <tr><td>Gas</td><td className="price-cell">20.000</td></tr>
                <tr><td>Kursi Lipat</td><td className="price-cell">20.000</td></tr>
                <tr><td>Meja Lipat</td><td className="price-cell">35.000</td></tr>
                <tr><td>Meja Lipat Besi</td><td className="price-cell">35.000</td></tr>
                <tr><td>Kabel Roll</td><td className="price-cell">30.000</td></tr>
                <tr><td>Nesting</td><td className="price-cell">30.000</td></tr>
                <tr><td>Kasur</td><td className="price-cell">35.000</td></tr>
                <tr><td>Tiang Besi</td><td className="price-cell">5.000</td></tr>
                <tr><td>Tripod</td><td className="price-cell">30.000</td></tr>
                
                {/* Addons/Food */}
                <tr style={{ backgroundColor: 'var(--color-soft-beige)' }}>
                  <td colSpan="2" style={{ fontWeight: 'bold', textAlign: 'center' }}>Grill & Makanan Extra</td>
                </tr>
                <tr><td>Paket Grill (Per Set)</td><td className="price-cell">130.000</td></tr>
                <tr><td>Kayu Bakar (Per Bundle)</td><td className="price-cell">35.000</td></tr>
                <tr><td>Extra Sosis (Per Pack)</td><td className="price-cell">15.000</td></tr>
                <tr><td>Extra Daging Slice (500gr)</td><td className="price-cell">80.000</td></tr>
                <tr><td>Extra Ayam Fillet (250gr)</td><td className="price-cell">38.000</td></tr>
              </tbody>
            </table>
          </div>

        </div>
      </section>
    </main>
  );
}
