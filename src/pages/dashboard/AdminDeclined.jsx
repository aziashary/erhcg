import { useState, useEffect } from 'react';
import ReceiptModal from './ReceiptModal';
import Swal from 'sweetalert2';

export default function AdminDeclined() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sel, setSel] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter & Sort States
  const [filterArea, setFilterArea] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterPackage, setFilterPackage] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // newest, high-to-low, low-to-high
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const load = () => {
    fetch('/api/hq-rockshill/reservations', {
      headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
    })
      .then(r => r.json())
      .then(res => { 
        setRows((res.data || []).filter(r => r.status === 'Declined' || r.status === 'Expired')); 
        setLoading(false); 
      })
      .catch(() => setLoading(false));
  };

  useEffect(load, []);

  const reactivate = (id) => {
    Swal.fire({
      title: 'Aktifkan Kembali?',
      text: "Reservasi ini akan dikembalikan ke status Menunggu Konfirmasi",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: 'var(--on-dim)',
      confirmButtonText: 'Ya, Aktifkan',
      cancelButtonText: 'Batal'
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(`/api/hq-rockshill/reservations/${id}/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
          body: JSON.stringify({ status: 'Menunggu Konfirmasi' }),
        })
          .then(r => r.json())
          .then(d => { if (d.status) { Swal.fire('Berhasil', 'Berhasil diaktifkan kembali!', 'success'); load(); } })
          .catch(() => Swal.fire('Error', 'Gagal mengaktifkan reservasi.', 'error'));
      }
    });
  };

  if (loading) return (
    <div style={{ padding: '20px 0' }}>
      <div className="skeleton skeleton-title"></div>
      <div className="skeleton skeleton-card"></div>
      <div className="skeleton skeleton-card"></div>
      <div className="skeleton skeleton-card"></div>
    </div>
  );

  let filteredRows = rows.filter(r => 
    r.nama.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.booking_code.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (r.invoice_id && r.invoice_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
    r.wa.includes(searchTerm)
  );

  if (filterArea) {
    filteredRows = filteredRows.filter(r => r.area === filterArea);
  }
  if (filterDate) {
    filteredRows = filteredRows.filter(r => r.checkin && r.checkin.startsWith(filterDate));
  }
  if (filterPackage) {
    filteredRows = filteredRows.filter(r => r.paketText && r.paketText.toLowerCase().includes(filterPackage.toLowerCase()));
  }

  filteredRows.sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    } else if (sortBy === 'high-to-low' || sortBy === 'low-to-high') {
      const valA = parseInt((a.total || '0').toString().replace(/[^0-9]/g, ''), 10) || 0;
      const valB = parseInt((b.total || '0').toString().replace(/[^0-9]/g, ''), 10) || 0;
      return sortBy === 'high-to-low' ? valB - valA : valA - valB;
    }
    return 0;
  });

  return (
    <>
      <div className="pg-hdr desk">
        <div>
          <h1>Riwayat / Dibatalkan</h1>
          <p>Daftar reservasi yang kadaluwarsa atau ditolak.</p>
        </div>
        <div className="pg-hdr-right">
          <div className="search-wrap">
            <i className='bx bx-search'></i>
            <input 
              type="text" 
              placeholder="Cari nama, booking..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="hdr-btns">
            <div style={{ position: 'relative' }}>
              <button className={`btn btn-ol ${showFilterDropdown ? 'active' : ''}`} onClick={() => { setShowFilterDropdown(!showFilterDropdown); setShowSortDropdown(false); }}>
                <i className="bx bx-filter-alt"></i> Filter { (filterArea || filterDate || filterPackage) && <span style={{ width: 8, height: 8, background: 'var(--pri)', borderRadius: '50%', display: 'inline-block', marginLeft: 4 }}></span> }
              </button>
              {showFilterDropdown && (
                <div className="dropdown-menu" style={{ position: 'absolute', right: 0, top: '100%', background: '#fff', border: '1px solid #ddd', borderRadius: '8px', zIndex: 10, minWidth: '200px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', padding: '15px', marginTop: '8px' }}>
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ display: 'block', fontSize: 12, marginBottom: 4, fontWeight: 600 }}>Tanggal Check-in</label>
                    <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ display: 'block', fontSize: 12, marginBottom: 4, fontWeight: 600 }}>Area</label>
                    <select value={filterArea} onChange={e => setFilterArea(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}>
                      <option value="">Semua Area</option>
                      <option value="Area 1">Area 1</option>
                      <option value="Area 2">Area 2</option>
                      <option value="Area 3">Area 3</option>
                      <option value="Area 4">Area 4</option>
                      <option value="Area 5">Area 5</option>
                      <option value="Area 6">Area 6</option>
                      <option value="Area 7">Area 7</option>
                      <option value="Area 8">Area 8</option>
                      <option value="Campervan">Campervan</option>
                    </select>
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ display: 'block', fontSize: 12, marginBottom: 4, fontWeight: 600 }}>Paket Tenda</label>
                    <input type="text" placeholder="Misal: Lengkap 4P" value={filterPackage} onChange={e => setFilterPackage(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
                  </div>
                  <button className="btn btn-sec" style={{ width: '100%', padding: '6px' }} onClick={() => { setFilterArea(''); setFilterDate(''); setFilterPackage(''); }}>Reset</button>
                </div>
              )}
            </div>
            
            <div style={{ position: 'relative' }}>
              <button className={`btn btn-ol ${showSortDropdown ? 'active' : ''}`} onClick={() => { setShowSortDropdown(!showSortDropdown); setShowFilterDropdown(false); }}>
                <i className="bx bx-sort-alt-2"></i> Urutkan
              </button>
              {showSortDropdown && (
                <div className="dropdown-menu" style={{ position: 'absolute', right: 0, top: '100%', background: '#fff', border: '1px solid #ddd', borderRadius: '8px', zIndex: 10, minWidth: '180px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', padding: '5px 0', marginTop: '8px' }}>
                  <button style={{ width: '100%', padding: '10px 15px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} onClick={() => { setSortBy('newest'); setShowSortDropdown(false); }}>
                    Terbaru {sortBy === 'newest' && <i className='bx bx-check text-pri'></i>}
                  </button>
                  <button style={{ width: '100%', padding: '10px 15px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} onClick={() => { setSortBy('high-to-low'); setShowSortDropdown(false); }}>
                    Tagihan Tertinggi {sortBy === 'high-to-low' && <i className='bx bx-check text-pri'></i>}
                  </button>
                  <button style={{ width: '100%', padding: '10px 15px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} onClick={() => { setSortBy('low-to-high'); setShowSortDropdown(false); }}>
                    Tagihan Terendah {sortBy === 'low-to-high' && <i className='bx bx-check text-pri'></i>}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile title */}
      <div className="mob" style={{ flexDirection: 'column', marginBottom: 14 }}>
        <h1 style={{ fontFamily: 'Outfit', fontSize: 24, fontWeight: 700 }}>Riwayat</h1>
      </div>
      {/* Mobile search and filter */}
      <div className="mob" style={{ flexDirection: 'column', gap: 10, marginBottom: 14 }}>
        <div style={{ position: 'relative', width: '100%' }}>
          <i className='bx bx-search' style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--on-dim)' }}></i>
          <input 
            type="text" 
            placeholder="Cari nama, booking..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '10px 10px 10px 34px', borderRadius: '8px', border: '1px solid var(--outline-var)', outline: 'none', fontFamily: 'Inter', fontSize: '13px' }}
          />
        </div>
        <div style={{ display: 'flex', gap: 10, width: '100%' }}>
          <button className="btn btn-ol" style={{ flex: 1, padding: '8px' }} onClick={() => { setShowFilterDropdown(!showFilterDropdown); setShowSortDropdown(false); }}>
            <i className="bx bx-filter-alt"></i> Filter { (filterArea || filterDate || filterPackage) && <span style={{ width: 6, height: 6, background: 'var(--pri)', borderRadius: '50%', display: 'inline-block', marginLeft: 4 }}></span> }
          </button>
          <button className="btn btn-ol" style={{ flex: 1, padding: '8px' }} onClick={() => { setShowSortDropdown(!showSortDropdown); setShowFilterDropdown(false); }}>
            <i className="bx bx-sort-alt-2"></i> Urutkan
          </button>
        </div>
        
        {/* Mobile Filter Menu inline */}
        {showFilterDropdown && (
          <div style={{ background: '#fff', border: '1px solid #ddd', borderRadius: '8px', padding: '15px', width: '100%' }}>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 12, marginBottom: 4, fontWeight: 600 }}>Tanggal Check-in</label>
              <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 12, marginBottom: 4, fontWeight: 600 }}>Area</label>
              <select value={filterArea} onChange={e => setFilterArea(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}>
                <option value="">Semua Area</option>
                <option value="Area 1">Area 1</option>
                <option value="Area 2">Area 2</option>
                <option value="Area 3">Area 3</option>
                <option value="Area 4">Area 4</option>
                <option value="Area 5">Area 5</option>
                <option value="Area 6">Area 6</option>
                <option value="Area 7">Area 7</option>
                <option value="Area 8">Area 8</option>
                <option value="Campervan">Campervan</option>
              </select>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 12, marginBottom: 4, fontWeight: 600 }}>Paket Tenda</label>
              <input type="text" placeholder="Misal: Lengkap 4P" value={filterPackage} onChange={e => setFilterPackage(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-sec" style={{ flex: 1, padding: '6px' }} onClick={() => { setFilterArea(''); setFilterDate(''); setFilterPackage(''); setShowFilterDropdown(false); }}>Reset</button>
              <button className="btn btn-pri" style={{ flex: 1, padding: '6px', background: 'var(--pri)', color: '#fff', border: 'none', borderRadius: '4px' }} onClick={() => setShowFilterDropdown(false)}>OK</button>
            </div>
          </div>
        )}
        
        {/* Mobile Sort Menu inline */}
        {showSortDropdown && (
          <div style={{ background: '#fff', border: '1px solid #ddd', borderRadius: '8px', padding: '5px 0', width: '100%' }}>
            <button style={{ width: '100%', padding: '10px 15px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} onClick={() => { setSortBy('newest'); setShowSortDropdown(false); }}>
              Terbaru {sortBy === 'newest' && <i className='bx bx-check text-pri'></i>}
            </button>
            <button style={{ width: '100%', padding: '10px 15px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} onClick={() => { setSortBy('high-to-low'); setShowSortDropdown(false); }}>
              Tagihan Tertinggi {sortBy === 'high-to-low' && <i className='bx bx-check text-pri'></i>}
            </button>
            <button style={{ width: '100%', padding: '10px 15px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} onClick={() => { setSortBy('low-to-high'); setShowSortDropdown(false); }}>
              Tagihan Terendah {sortBy === 'low-to-high' && <i className='bx bx-check text-pri'></i>}
            </button>
          </div>
        )}
      </div>

      {/* ── DESKTOP TABLE ── */}
      <div className="tbl-wrap desk">
        <table className="tbl">
          <thead>
            <tr>
              <th>Kode Booking</th>
              <th>Nama</th>
              <th>Tanggal</th>
              <th>Area</th>
              <th>Status</th>
              <th>Total Tagihan</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.length === 0 ? (
              <tr><td colSpan={7} className="empty">Tidak ada data pembatalan</td></tr>
            ) : filteredRows.map(r => (
              <tr key={r.id}>
                <td><span style={{ fontFamily: 'Outfit', fontWeight: 700, color: 'var(--pri)', fontSize: 14 }}>{r.booking_code}</span></td>
                <td>
                  <div style={{ fontWeight: 600 }}>{r.nama}</div>
                  <div style={{ fontSize: 12, color: 'var(--on-dim)' }}>{r.wa}</div>
                </td>
                <td>
                  <div style={{ fontWeight: 600, color: 'var(--pri)', fontSize: 13 }}>{r.checkin} – {r.checkout}</div>
                  <div style={{ fontSize: 11, color: 'var(--on-dim)' }}>{r.nights} Malam</div>
                </td>
                <td><span className="area-chip">{r.area}</span></td>
                <td><span style={{ color: r.status === 'Expired' ? '#f39c12' : '#dc3545', fontWeight: 600, fontSize: 13 }}>{r.status}</span></td>
                <td><span style={{ fontFamily: 'Outfit', fontWeight: 700, color: 'var(--pri)', fontSize: 15 }}>{r.total}</span></td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-ol btn-icon" onClick={() => setSel(r)}><i className="bx bx-receipt"></i></button>
                    <button className="btn btn-sec" style={{ background: '#28a745', borderColor: '#28a745' }} onClick={() => reactivate(r.id)}><i className="bx bx-refresh"></i> Reactivate</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── MOBILE CARDS ── */}
      <div className="mob-block" style={{ display: 'none' }}>
        {filteredRows.length === 0 ? (
          <div className="empty">Tidak ada data pembatalan</div>
        ) : filteredRows.map(r => (
          <div key={r.id} className="rc">
            <div className="rc-hdr">
              <div><div className="rc-id">{r.booking_code}</div><div className="rc-name">{r.nama}</div></div>
              <span className="chip" style={{ background: r.status === 'Expired' ? '#fff3cd' : '#f8d7da', color: r.status === 'Expired' ? '#856404' : '#721c24' }}>{r.status}</span>
            </div>
            <div className="rc-body">
              <div className="rc-meta">
                <div className="rc-meta-item"><span><i className="bx bx-calendar"></i> Tanggal</span><strong>{r.checkin} – {r.checkout}</strong></div>
                <div className="rc-meta-item"><span><i className="bx bx-map"></i> Area</span><strong>{r.area}</strong></div>
              </div>
              <hr className="rc-divider" />
              <div className="rc-total-lbl">Total Tagihan</div>
              <div className="rc-total-val">{r.total}</div>
            </div>
            <div className="rc-actions">
              <button className="btn btn-sec" style={{ flex: 1, background: '#28a745', borderColor: '#28a745' }} onClick={() => reactivate(r.id)}>Reactivate</button>
              <button className="btn btn-ol btn-icon" onClick={() => setSel(r)}><i className="bx bx-dots-vertical-rounded"></i></button>
            </div>
          </div>
        ))}
      </div>

      {sel && <ReceiptModal reservation={sel} onClose={() => setSel(null)} />}
    </>
  );
}
