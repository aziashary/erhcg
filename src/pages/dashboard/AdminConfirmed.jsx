import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import InvoiceModal from '../../components/InvoiceModal';
import ReceiptModal from './ReceiptModal';

const formatRupiah = (angka) => 'Rp ' + angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

export default function AdminConfirmed() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sel, setSel] = useState(null);
  const [invoiceSel, setInvoiceSel] = useState(null);
  const [menuOpen, setMenuOpen] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const adminRole = localStorage.getItem('adminRole') || 'admin';

  // Filter & Sort States
  const [filterArea, setFilterArea] = useState(searchParams.get('area') || '');
  const [filterDate, setFilterDate] = useState(searchParams.get('date') || '');
  const [filterPackage, setFilterPackage] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // newest, high-to-low, low-to-high
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  
  const isFromCalendar = searchParams.get('date') && searchParams.get('area');

  useEffect(() => {
    window.scrollTo(0, 0);
    fetch('/api/hq-rockshill/reservations', {
      headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
    })
      .then(r => r.json())
      .then(res => { setRows((res.data || []).filter(r => r.status === 'Confirmed')); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

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

  if (adminRole === 'kasir') {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() + 3);
    
    filteredRows = filteredRows.filter(r => {
      if (!r.checkin) return false;
      const ci = new Date(r.checkin);
      ci.setHours(0, 0, 0, 0);
      
      // Kasir only sees today up to H+3
      if (ci < today || ci > maxDate) return false;
      
      // If a specific date is requested (e.g., from calendar), filter by it if it's within bounds
      if (filterDate && !r.checkin.startsWith(filterDate)) return false;
      
      return true;
    });
  } else if (filterDate) {
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
          {isFromCalendar && (
            <button className="btn btn-gh" style={{ marginBottom: 8, padding: 0 }} onClick={() => navigate(`/hq-rockshill/calendar?selDate=${filterDate}`)}>
              <i className="bx bx-arrow-back"></i> Kembali ke Kalender
            </button>
          )}
          <h1>Sudah Bayar {isFromCalendar && `- ${filterArea} (${filterDate})`}</h1>
          <p>Mengelola {filteredRows.length} total pemesanan dan pembayaran terkonfirmasi.</p>
        </div>
        <div className="pg-hdr-right">
          <div className="search-wrap">
            <i className='bx bx-search'></i>
            <input 
              type="text" 
              placeholder="Cari nama, invoice..." 
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
                  {adminRole !== 'kasir' && (
                    <div style={{ marginBottom: 12 }}>
                      <label style={{ display: 'block', fontSize: 12, marginBottom: 4, fontWeight: 600 }}>Tanggal Check-in</label>
                      <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
                    </div>
                  )}
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
                  <button className="btn btn-sec" style={{ width: '100%', padding: '6px' }} onClick={() => { setFilterArea(''); if(adminRole !== 'kasir') setFilterDate(''); setFilterPackage(''); }}>Reset</button>
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
      <div className="mob" style={{ flexDirection: 'column', marginBottom: 10 }}>
        <h1 style={{ fontFamily: 'Outfit', fontSize: 24, fontWeight: 700 }}>Sudah Bayar</h1>
        <p style={{ fontSize: 13, color: 'var(--on-dim)' }}>Reservasi terkonfirmasi</p>
      </div>

      {/* Mobile search and filter */}
      <div className="mob" style={{ flexDirection: 'column', gap: 10, marginBottom: 14 }}>
        {isFromCalendar && (
          <button className="btn btn-ol" style={{ alignSelf: 'flex-start', padding: '6px 12px' }} onClick={() => navigate(`/hq-rockshill/calendar?selDate=${filterDate}`)}>
            <i className="bx bx-arrow-back"></i> Kembali ke Kalender
          </button>
        )}
        <div style={{ position: 'relative', width: '100%' }}>
          <i className='bx bx-search' style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--on-dim)' }}></i>
          <input 
            type="text" 
            placeholder="Cari nama, invoice..." 
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
            {adminRole !== 'kasir' && (
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 12, marginBottom: 4, fontWeight: 600 }}>Tanggal Check-in</label>
                <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
              </div>
            )}
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
              <button className="btn btn-sec" style={{ flex: 1, padding: '6px' }} onClick={() => { setFilterArea(''); if(adminRole !== 'kasir') setFilterDate(''); setFilterPackage(''); setShowFilterDropdown(false); }}>Reset</button>
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
      <div className="tbl-wrap desk" style={{ paddingBottom: '100px' }}>
        <table className="tbl">
          <thead>
            <tr>
              <th>No Invoice</th>
              <th>Nama</th>
              <th>Tanggal</th>
              <th>Area</th>
              <th>Pembayaran</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.length === 0 ? (
              <tr><td colSpan={6} className="empty">Tidak ada reservasi terkonfirmasi</td></tr>
            ) : filteredRows.map(r => {
              const totalNum = parseInt((r.total || '0').toString().replace(/[^0-9]/g, '') || 0, 10);
              const payAmtNum = parseInt((r.paymentAmount || '0').toString().replace(/[^0-9]/g, '') || 0, 10);
              return (
              <tr key={r.id}>
                <td>
                  <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 14 }}>{r.invoice_id || '-'}</div>
                  <div style={{ fontSize: 11, color: 'var(--on-dim)' }}>{r.booking_code}</div>
                </td>
                <td>
                  <div style={{ fontWeight: 600 }}>{r.nama}</div>
                  <div style={{ fontSize: 12, color: 'var(--on-dim)' }}>{r.wa}</div>
                </td>
                <td>
                  <div style={{ fontWeight: 600, color: 'var(--pri)', fontSize: 13 }}>{r.checkin} – {r.checkout}</div>
                  <div style={{ fontSize: 11, color: 'var(--on-dim)' }}>{r.nights} Malam</div>
                </td>
                <td><span className="area-chip">{r.area}</span></td>
                <td>
                  {(() => {
                    const isLunas = payAmtNum >= totalNum && totalNum > 0;
                    if (!isLunas) {
                      return (
                        <>
                          {payAmtNum > 0 && <div style={{ fontSize: 12 }}>DP: {formatRupiah(payAmtNum)}</div>}
                          <div style={{ fontSize: 12, color: 'var(--on-dim)' }}>Sisa: {formatRupiah(totalNum - payAmtNum)}</div>
                          <div style={{ fontFamily: 'Outfit', fontWeight: 700, color: 'var(--pri)', fontSize: 13, marginTop: 4 }}>Total: {r.total}</div>
                          <div style={{ marginTop: 4 }}><span className="chip chip-o" style={{ fontSize: 10, background: payAmtNum > 0 ? '#fff3cd' : '#f8d7da', color: payAmtNum > 0 ? '#856404' : '#721c24', padding: '2px 8px' }}>{payAmtNum > 0 ? 'DP' : 'BELUM DIBAYAR'}</span></div>
                        </>
                      );
                    } else {
                      return (
                        <>
                          <div style={{ fontFamily: 'Outfit', fontWeight: 700, color: 'var(--pri)', fontSize: 15 }}>{r.total}</div>
                          <div><span className="chip chip-g" style={{ fontSize: 10 }}><i className="bx bx-check-circle"></i> Lunas</span></div>
                        </>
                      );
                    }
                  })()}
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 6, position: 'relative' }}>
                    <button className="btn btn-ol btn-icon" onClick={() => setSel(r)}><i className="bx bx-receipt"></i></button>
                    <button className="btn btn-gh btn-icon" onClick={() => setMenuOpen(menuOpen === r.id ? null : r.id)}><i className="bx bx-dots-vertical-rounded"></i></button>
                    
                    {menuOpen === r.id && (
                      <div className="dropdown-menu" style={{ position: 'absolute', right: 0, top: '100%', background: '#fff', border: '1px solid #ddd', borderRadius: '4px', zIndex: 10, minWidth: '140px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', padding: '5px 0' }}>
                        <button 
                          style={{ width: '100%', padding: '8px 12px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }} 
                          onClick={() => { setInvoiceSel(r); setMenuOpen(null); }}
                        >
                          <i className="bx bx-printer"></i> Cetak Invoice
                        </button>
                        {adminRole !== 'kasir' && (
                          <button 
                            style={{ width: '100%', padding: '8px 12px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }} 
                            onClick={() => navigate(`/hq-rockshill/edit/${r.id}`)}
                          >
                            <i className="bx bx-edit"></i> Edit Reservasi
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── MOBILE CARDS ── */}
      <div className="mob-block" style={{ display: 'none' }}>


        {filteredRows.length === 0 ? (
          <div className="empty">Tidak ada reservasi confirmed</div>
        ) : filteredRows.map(r => {
          const totalNum = parseInt((r.total || '0').toString().replace(/[^0-9]/g, '') || 0, 10);
          const payAmtNum = parseInt((r.paymentAmount || '0').toString().replace(/[^0-9]/g, '') || 0, 10);
          const isLunas = payAmtNum >= totalNum && totalNum > 0;
          return (
          <div key={r.id} className="site-card" onClick={() => setSel(r)} style={{ display: 'block', cursor: 'pointer', borderLeft: !isLunas ? '4px solid #f7bc6a' : '4px solid var(--sec)' }}>
            <div className="site-info" style={{ padding: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                <h4 style={{ fontSize: 15, wordBreak: 'break-word' }}>{r.invoice_id || r.booking_code}</h4>
                <span className="price" style={{ fontSize: 15, flexShrink: 0 }}>{r.total}</span>
              </div>
                <p style={{ fontSize: 12, marginBottom: 6 }}>{r.nama} • {r.area}</p>
                
                {!isLunas && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 8, padding: '4px 6px', background: 'var(--surface-low)', borderRadius: 4 }}>
                    <span>{payAmtNum > 0 ? `DP: ${formatRupiah(payAmtNum)}` : 'Belum Dibayar'}</span>
                    <span style={{ color: '#dc3545', fontWeight: 600 }}>Sisa: {formatRupiah(totalNum - payAmtNum)}</span>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="chip" style={{ fontSize: 10, background: !isLunas ? (payAmtNum > 0 ? '#fff3cd' : '#f8d7da') : 'var(--sec-ctr)', color: !isLunas ? (payAmtNum > 0 ? '#856404' : '#721c24') : 'var(--on-sec-ctr)' }}>
                    {!isLunas ? (payAmtNum > 0 ? 'DP' : 'BELUM DIBAYAR') : <><i className="bx bx-check-circle"></i> Lunas</>}
                  </span>
                  <p style={{ margin: 0, fontSize: 11, color: 'var(--on-dim)' }}><i className="bx bx-calendar"></i> {r.checkin}</p>
                </div>
            </div>
          </div>
          );
        })}
      </div>

      {sel && <ReceiptModal 
        reservation={sel} 
        onClose={() => setSel(null)} 
        onPrintInvoice={() => { setInvoiceSel(sel); setSel(null); }}
        onEdit={adminRole !== 'kasir' ? () => navigate(`/hq-rockshill/edit/${sel.id}`) : undefined}
      />}
      {invoiceSel && <InvoiceModal reservation={invoiceSel} onClose={() => setInvoiceSel(null)} />}
    </>
  );
}
