import { useState } from 'react';

const ITEMS = [
  { id: 1, name: 'Tenda Safari VIP', cat: 'Akomodasi', desc: 'Kapasitas 4 orang, Kasur Queen, Listrik', price: 750000, unit: 'Malam' },
  { id: 2, name: 'Tenda Dome Standar', cat: 'Akomodasi', desc: 'Kapasitas 2-3 orang, Matras nyaman', price: 350000, unit: 'Malam' },
  { id: 3, name: 'Paket Grill BBQ', cat: 'Makanan', desc: 'Daging sapi, ayam, sayuran, alat panggang lengkap', price: 250000, unit: 'Paket' },
  { id: 4, name: 'Kayu Bakar', cat: 'Makanan & Api', desc: '1 ikat kayu pinus kering kualitas premium', price: 50000, unit: 'Ikat' },
  { id: 5, name: 'Sambungan Listrik', cat: 'Fasilitas', desc: 'Akses stop kontak di area tenda', price: 30000, unit: 'Malam' },
  { id: 6, name: 'Kursi Lipat', cat: 'Fasilitas', desc: 'Kursi camping outdoor portabel', price: 20000, unit: 'Buah' },
  { id: 7, name: 'Meja Lipat', cat: 'Fasilitas', desc: 'Meja lipat aluminium ringan', price: 35000, unit: 'Buah' },
  { id: 8, name: 'Flysheet', cat: 'Akomodasi', desc: 'Pelindung hujan, ukuran 4x6m', price: 35000, unit: 'Sewa' },
  { id: 9, name: 'Kompor Portable', cat: 'Fasilitas', desc: 'Kompor gas single burner', price: 30000, unit: 'Sewa' },
  { id: 10, name: 'Gas Portable', cat: 'Fasilitas', desc: 'Kaleng gas 250gr', price: 20000, unit: 'Kaleng' },
  { id: 11, name: 'Sleeping Bag', cat: 'Akomodasi', desc: 'Sleeping bag kapas hangat', price: 15000, unit: 'Sewa' },
  { id: 12, name: 'HTM Reguler', cat: 'Tiket', desc: 'Harga tiket masuk pengunjung', price: 35000, unit: 'Orang' },
];

const CATS = ['Semua', ...new Set(ITEMS.map(i => i.cat))];
const fmt = (n) => `Rp ${n.toLocaleString('id-ID')}`;

const catChipClass = { Akomodasi: 'chip-g', Makanan: 'chip-b', 'Makanan & Api': 'chip-b', Fasilitas: 'chip-m', Tiket: 'chip-m' };

export default function AdminPrices() {
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('Semua');

  const list = ITEMS.filter(i => {
    const mc = cat === 'Semua' || i.cat === cat;
    const ms = i.name.toLowerCase().includes(q.toLowerCase()) || i.desc.toLowerCase().includes(q.toLowerCase());
    return mc && ms;
  });

  return (
    <>
      <div className="pg-hdr">
        <div>
          <h1>Daftar Harga Master</h1>
          <p>Kelola harga sewa tenda, paket makan, dan perlengkapan tambahan secara terpusat.</p>
        </div>
        <div className="pg-hdr-right">
          <button className="btn btn-pri"><i className="bx bx-plus"></i> Tambah Item Baru</button>
        </div>
      </div>

      {/* ── DESKTOP TABLE ── */}
      <div className="tbl-wrap desk">
        <table className="tbl">
          <thead>
            <tr><th>Nama Item</th><th>Deskripsi</th><th>Harga</th><th style={{ textAlign: 'center' }}>Aksi</th></tr>
          </thead>
          <tbody>
            {list.map(i => (
              <tr key={i.id}>
                <td>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>{i.name}</div>
                  <span className={`chip ${catChipClass[i.cat] || 'chip-m'}`}>{i.cat}</span>
                </td>
                <td style={{ color: 'var(--on-dim)' }}>{i.desc}</td>
                <td>
                  <div style={{ fontFamily: 'Outfit', fontWeight: 700, color: 'var(--pri)', fontSize: 15 }}>{fmt(i.price)}</div>
                  <div style={{ fontSize: 11, color: 'var(--on-dim)' }}>/ {i.unit}</div>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                    <button className="btn btn-gh btn-icon"><i className="bx bx-edit-alt"></i></button>
                    <button className="btn btn-gh btn-icon" style={{ color: 'var(--err)' }}><i className="bx bx-trash"></i></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="tbl-foot">
          <span>Menampilkan {list.length} dari {ITEMS.length} item</span>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="btn btn-ol" style={{ padding: '7px 14px' }}>Sebelumnya</button>
            <button className="btn btn-pri" style={{ padding: '7px 14px' }}>Berikutnya</button>
          </div>
        </div>
      </div>

      {/* ── MOBILE ── */}
      <div className="mob-block" style={{ display: 'none' }}>
        <div className="search-bar" style={{ marginBottom: 10 }}>
          <i className="bx bx-search"></i>
          <input placeholder="Cari layanan atau fasilitas..." value={q} onChange={e => setQ(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 6, marginBottom: 12 }}>
          {CATS.map(c => (
            <button key={c} className={`ftab ${cat === c ? 'on' : ''}`} onClick={() => setCat(c)} style={{ flexShrink: 0 }}>{c}</button>
          ))}
        </div>
        {list.map(i => (
          <div key={i.id} className="pc-mob">
            <div className="pc-mob-top">
              <span className={`chip ${catChipClass[i.cat] || 'chip-m'}`}>{i.cat}</span>
              <div style={{ display: 'flex', gap: 6 }}>
                <button className="btn btn-gh btn-icon" style={{ padding: 4 }}><i className="bx bx-edit-alt"></i></button>
                <button className="btn btn-gh btn-icon" style={{ padding: 4, color: 'var(--err)' }}><i className="bx bx-trash"></i></button>
              </div>
            </div>
            <h4>{i.name}</h4>
            <p>{i.desc}</p>
            <div className="pc-mob-foot">
              <span>Harga per {i.unit.toLowerCase()}</span>
              <div className="price">{fmt(i.price)}</div>
            </div>
          </div>
        ))}
      </div>

      <button className="fab mob" style={{ display: 'none' }}><i className="bx bx-plus"></i></button>
    </>
  );
}
