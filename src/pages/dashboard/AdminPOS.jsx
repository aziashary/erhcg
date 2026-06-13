import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import Select from 'react-select';

export default function AdminPOS() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [catalogs, setCatalogs] = useState([]);
  
  const [posMode, setPosMode] = useState('existing'); // 'existing' or 'ots'
  const [otsData, setOtsData] = useState({ nama: '', area: '' });

  const [sel, setSel] = useState(null);
  const [cartAddons, setCartAddons] = useState({}); // { itemId: qty }
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
    fetchCatalogs();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/hq-rockshill/reservations', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.data) {
        // GMT+7 Now
        const now = new Date(new Date().getTime() + 7 * 3600 * 1000);
        now.setHours(0, 0, 0, 0);

        const hMinus3 = new Date(now); hMinus3.setDate(now.getDate() - 3);
        const hPlus3 = new Date(now); hPlus3.setDate(now.getDate() + 3);

        const filtered = data.data.filter(r => {
          if (r.status === 'Declined' || r.status === 'Dibatalkan') return false;

          const ci = new Date(r.checkin);
          ci.setHours(0, 0, 0, 0);

          // Only show reservations within range
          if (ci < hMinus3 || ci > hPlus3) return false;

          // Only show if they have paid something (DP > 0 or Lunas)
          const bPayment = parseInt((r.paymentAmount || '0').toString().replace(/[^0-9]/g, ''), 10) || 0;
          if (bPayment <= 0) return false;

          return true;
        });

        setRows(filtered);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCatalogs = async () => {
    try {
      const res = await fetch('/api/catalogs');
      const data = await res.json();
      if (data.data) {
        const dbItems = data.data.filter(c => c.category === 'addon' || c.category === 'package' || c.category === 'htm');
        setCatalogs(dbItems);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const formatRupiah = (angka) => {
    if (!angka && angka !== 0) return '0';
    return angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const handleSelectChange = (e) => {
    const id = e.target.value;
    if (!id) {
      setSel(null);
      setCartAddons({});
      return;
    }
    const found = rows.find(r => r.id === id);
    if (found) {
      setSel(found);
      setCartAddons({});
    }
  };

  const handleAddonChange = (id, delta) => {
    setCartAddons(prev => {
      const curr = prev[id] || 0;
      const next = Math.max(0, curr + delta);
      if (next === 0) {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      }
      return { ...prev, [id]: next };
    });
  };

  const { baseTotal, basePayment, cartTotal, newTotal, remainingBalance, isAlreadyLunas, oldItems } = useMemo(() => {
    let bTotal = 0;
    let bPayment = 0;
    let oldItems = [];
    let isAlreadyLunas = false;

    if (posMode === 'existing' && sel) {
      bTotal = parseInt((sel.total || sel.totalAmount || '0').toString().replace(/[^0-9]/g, ''), 10) || 0;
      bPayment = parseInt((sel.paymentAmount || '0').toString().replace(/[^0-9]/g, ''), 10) || 0;
      isAlreadyLunas = (bPayment >= bTotal) && bTotal > 0;
      
      if (sel.items && Array.isArray(sel.items) && sel.items.length > 0) {
        oldItems = sel.items.map(it => ({
          name: it.item_name,
          qty: it.quantity,
          subtotal: parseInt(it.subtotal, 10) || 0
        }));
      } else {
        const pText = sel.paketText || '';
        const aText = sel.addonsText || '';
        const pLines = pText.split('\n');
        const itemsArr = [];
        let currentItem = null;

        pLines.forEach(line => {
          const match = line.match(/^- (.+?)\s+(\d+)x$/);
          if (match) {
            if (currentItem) itemsArr.push(currentItem);
            currentItem = { name: match[1], qty: parseInt(match[2], 10), subs: [], subtotal: 0 };
          } else if (line.trim().startsWith('-- ') && currentItem) {
            currentItem.subs.push(line.replace('-- ', '').trim());
          }
        });
        if (currentItem) itemsArr.push(currentItem);
        
        const aItems = aText.split(',').map(s => s.trim()).filter(Boolean);
        aItems.forEach(iStr => {
          const match = iStr.match(/^(\d+)x\s+(.+)$/);
          if (match) itemsArr.push({ name: match[2], qty: parseInt(match[1], 10), subs: [], subtotal: 0 });
          else itemsArr.push({ name: iStr, qty: 1, subs: [], subtotal: 0 });
        });
        oldItems = itemsArr;
      }
    }

    let cTotal = 0;
    Object.keys(cartAddons).forEach(id => {
      const cat = catalogs.find(c => c.id === id);
      if (cat) cTotal += cat.price * cartAddons[id];
    });

    const nTotal = bTotal + cTotal;
    const rBalance = nTotal - bPayment;

    return { baseTotal: bTotal, basePayment: bPayment, cartTotal: cTotal, newTotal: nTotal, remainingBalance: rBalance, isAlreadyLunas, oldItems };
  }, [sel, cartAddons, catalogs, posMode]);

  const handleSubmitPOS = async () => {
    if (posMode === 'existing' && !sel) return;
    if (posMode === 'ots' && (!otsData.nama || !otsData.area)) {
      return Swal.fire('Oops', 'Nama dan Area harus diisi untuk tamu OTS', 'error');
    }

    if (cartTotal === 0 && posMode === 'existing') {
      return Swal.fire('Oops', 'Belum ada item tambahan yang dimasukkan.', 'info');
    }
    if (cartTotal === 0 && posMode === 'ots') {
      return Swal.fire('Oops', 'Masukkan setidaknya 1 item untuk tamu OTS.', 'info');
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('adminToken');

      let newItemsPayload = [];
      let newAddonsTextParts = [];
      
      Object.keys(cartAddons).forEach(id => {
        const cat = catalogs.find(c => c.id === id);
        if (cat) {
          const qty = cartAddons[id];
          newItemsPayload.push({
            id: cat.id,
            name: cat.name,
            type: cat.category,
            quantity: qty,
            price: cat.price,
            subtotal: cat.price * qty
          });
          newAddonsTextParts.push(`${qty}x ${cat.name}`);
        }
      });

      if (posMode === 'existing') {
        const payload = {
          addonsText: (sel.addonsText ? sel.addonsText + ', ' : '') + newAddonsTextParts.join(', '),
          newItems: newItemsPayload,
          additionalTotal: cartTotal
        };

        const res = await fetch(`/api/hq-rockshill/reservations/${sel.id}/pos`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(payload)
        });

        const data = await res.json();
        if (res.ok) {
          Swal.fire('Berhasil!', 'Pembayaran tambahan / POS berhasil diproses dan disimpan.', 'success').then(() => {
            fetchData();
            setSel(null);
            setCartAddons({});
          });
        } else {
          throw new Error(data.error || 'Gagal checkout POS');
        }
      } else {
        let calculatedDewasa = 0;
        newItemsPayload.forEach(i => {
          if (i.type === 'htm') {
            calculatedDewasa += i.quantity;
          }
        });
        if (calculatedDewasa === 0) calculatedDewasa = 1;

        const payload = {
          nama: otsData.nama,
          area_camp: otsData.area,
          dewasa: calculatedDewasa,
          payment_amount: cartTotal,
          total: cartTotal,
          items: newItemsPayload.map(i => ({
            item_id: i.id,
            item_name: i.name,
            item_type: i.type,
            quantity: i.quantity,
            price: i.price,
            subtotal: i.subtotal
          }))
        };

        const res = await fetch(`/api/hq-rockshill/reservations/ots`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(payload)
        });

        const data = await res.json();
        if (res.ok) {
          Swal.fire('Berhasil!', 'Reservasi OTS berhasil dibuat dan lunas.', 'success').then(() => {
            setOtsData({ nama: '', area: '' });
            setCartAddons({});
          });
        } else {
          throw new Error(data.error || 'Gagal checkout OTS');
        }
      }
    } catch (err) {
      Swal.fire('Error', err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 25 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: 'var(--txt-dark)' }}>Point of Sale (POS)</h2>
          <p style={{ margin: '4px 0 0', color: 'var(--txt-muted)', fontSize: 14 }}>Kasir Lapangan - Pelunasan & Penambahan Alat</p>
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #eee' }}>

        <div style={{ display: 'flex', gap: 10, marginBottom: 25, borderBottom: '2px solid #f0f0f0', paddingBottom: 10, flexWrap: 'wrap' }}>
          <button 
            className={`btn ${posMode === 'existing' ? 'btn-sec' : ''}`}
            style={{ background: posMode === 'existing' ? 'var(--sec)' : 'transparent', color: posMode === 'existing' ? '#fff' : '#666', border: posMode === 'existing' ? 'none' : '1px solid #ddd', padding: '8px 16px', borderRadius: '8px', flex: 1, minWidth: '140px' }}
            onClick={() => setPosMode('existing')}
          >
            Pelanggan Reservasi
          </button>
          <button 
            className={`btn ${posMode === 'ots' ? 'btn-sec' : ''}`}
            style={{ background: posMode === 'ots' ? 'var(--sec)' : 'transparent', color: posMode === 'ots' ? '#fff' : '#666', border: posMode === 'ots' ? 'none' : '1px solid #ddd', padding: '8px 16px', borderRadius: '8px', flex: 1, minWidth: '140px' }}
            onClick={() => setPosMode('ots')}
          >
            Pelanggan Baru (OTS)
          </button>
        </div>

        {posMode === 'existing' ? (
          <div style={{ marginBottom: 25 }}>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, color: 'var(--txt-dark)' }}>Pilih Tamu (Khusus Sudah DP / Lunas)</label>
            {loading ? (
              <div style={{ padding: 10, background: '#f8f9fa', borderRadius: 8, color: '#888' }}>Memuat data tamu...</div>
            ) : rows.length === 0 ? (
              <div style={{ padding: 10, background: '#fff4f4', borderRadius: 8, color: 'var(--err)', border: '1px solid #ffebeb' }}>Tidak ada tamu aktif hari ini</div>
            ) : (
              <Select
                options={rows.map(r => ({ value: r.id, label: `${r.nama} - ${r.area}` }))}
                onChange={(selectedOption) => handleSelectChange({ target: { value: selectedOption ? selectedOption.value : '' } })}
                value={sel ? { value: sel.id, label: `${sel.nama} - ${sel.area}` } : null}
                placeholder="-- Ketik / Pilih --"
                isClearable
                styles={{
                  control: (base) => ({
                    ...base,
                    padding: '4px',
                    borderRadius: '8px',
                    border: '2px solid #eee',
                    fontSize: '16px',
                    boxShadow: 'none',
                    '&:hover': { border: '2px solid #eee' }
                  })
                }}
              />
            )}
          </div>
        ) : (
          <div style={{ marginBottom: 25, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 15 }}>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, color: 'var(--txt-dark)' }}>Nama Tamu</label>
              <input type="text" className="form-input" style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: 8 }} placeholder="Masukkan nama tamu" value={otsData.nama} onChange={(e) => setOtsData({...otsData, nama: e.target.value})} />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, color: 'var(--txt-dark)' }}>Area Camp</label>
              <select className="form-select" style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: 8 }} value={otsData.area} onChange={(e) => setOtsData({...otsData, area: e.target.value})}>
                <option value="">Pilih Area</option>
                {['Area 1', 'Area 2', 'Campervan', 'Area 3', 'Area 4', 'Area 4 Samping', 'Area 5', 'Area 6', 'Area 7', 'Area 8'].map(a => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {(posMode === 'ots' || sel) && (
          <div style={{ animation: 'fadeIn 0.3s ease-in-out' }}>

            {posMode === 'existing' && sel && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 15, marginBottom: 25 }}>
                  <div style={{ background: '#f8f9fa', padding: 15, borderRadius: 12 }}>
                    <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Check-in / Out</div>
                    <div style={{ fontWeight: 600, color: 'var(--txt-dark)', fontSize: 14 }}>
                      {new Date(sel.checkin).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} - {new Date(sel.checkout).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                    </div>
                  </div>
                  <div style={{ background: '#f8f9fa', padding: 15, borderRadius: 12 }}>
                    <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Area</div>
                    <div style={{ fontWeight: 600, color: 'var(--txt-dark)', fontSize: 14 }}>{sel.area}</div>
                  </div>
                </div>

                {oldItems && oldItems.length > 0 && (
                  <div style={{ marginBottom: 25 }}>
                    <div style={{ fontWeight: 600, marginBottom: 10, fontSize: 14, borderBottom: '2px solid #eee', paddingBottom: 8 }}>Item Reservasi & Tagihan Awal</div>
                    {oldItems.map((it, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 8, paddingBottom: 8, borderBottom: '1px dashed #eee' }}>
                        <div>{it.name} <span style={{ color: '#888' }}>x{it.qty}</span></div>
                        <div>Rp {formatRupiah(it.subtotal || 0)}</div>
                      </div>
                    ))}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 600, marginTop: 10, color: 'var(--txt-dark)' }}>
                      <div>Total Tagihan Awal</div>
                      <div>Rp {formatRupiah(baseTotal)}</div>
                    </div>
                  </div>
                )}
              </>
            )}

            <div style={{ marginBottom: 25, borderTop: '2px dashed #ddd', paddingTop: 20 }}>
              <div style={{ fontWeight: 600, marginBottom: 15, fontSize: 15, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>Item Tambahan</span>
                <button className="btn btn-sec" style={{ padding: '6px 12px', fontSize: 13 }} onClick={() => setShowItemModal(true)}>+ Tambah Item</button>
              </div>

              {Object.keys(cartAddons).length === 0 ? (
                <div style={{ padding: 15, background: '#f8f9fa', borderRadius: 8, color: '#888', textAlign: 'center', fontSize: 13 }}>Belum ada alat tambahan.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {Object.keys(cartAddons).map(id => {
                    const cat = catalogs.find(c => c.id === id);
                    if (!cat) return null;
                    return (
                      <div key={id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 12, background: '#fff8f0', borderRadius: 8, border: '1px solid #fee2cc' }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{cat.name} <span style={{ color: '#888' }}>x{cartAddons[id]}</span></div>
                        </div>
                        <div style={{ fontWeight: 700 }}>Rp {formatRupiah(cat.price * cartAddons[id])}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div style={{ background: remainingBalance > 0 ? '#fffcf8' : '#e6f7eb', padding: 20, borderRadius: 12, border: `1px solid ${remainingBalance > 0 ? '#ffeeba' : '#c3e6cb'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 15 }}>
                <div style={{ color: '#666' }}>Total Harga Item Baru</div>
                <div style={{ fontWeight: 600 }}>Rp {formatRupiah(cartTotal)}</div>
              </div>

              {posMode === 'existing' && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 15, paddingBottom: 15, borderBottom: '1px dashed #ddd' }}>
                  <div style={{ color: '#666' }}>Sudah Dibayar (Termasuk DP)</div>
                  <div style={{ fontWeight: 600, color: '#2d8a4e' }}>Rp {formatRupiah(basePayment)}</div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: remainingBalance > 0 ? '#fffcf8' : '#f0fdf4', padding: 15, borderRadius: 12, border: `1px solid ${remainingBalance > 0 ? '#fae4cd' : '#bbf7d0'}` }}>
                <div style={{ fontWeight: 600, fontSize: 16, color: remainingBalance > 0 ? 'var(--sec)' : '#166534' }}>
                  {posMode === 'ots' ? 'Total Harus Dibayar' : (remainingBalance > 0 ? 'Total Kekurangan' : 'Status Tagihan Lunas')}
                </div>
                <div style={{ fontWeight: 800, fontSize: 20, color: remainingBalance > 0 ? 'var(--sec)' : '#166534' }}>
                  Rp {formatRupiah(posMode === 'ots' ? cartTotal : (remainingBalance > 0 ? remainingBalance : 0))}
                </div>
              </div>

              <button
                className="btn btn-sec"
                style={{ width: '100%', marginTop: 20, padding: '16px', fontSize: 16, background: remainingBalance > 0 || posMode === 'ots' ? 'var(--sec)' : '#2d8a4e' }}
                onClick={handleSubmitPOS}
                disabled={isSubmitting || (remainingBalance <= 0 && cartTotal === 0 && isAlreadyLunas && posMode === 'existing')}
              >
                {isSubmitting ? 'Memproses...' : (remainingBalance > 0 || posMode === 'ots' ? 'Terima Pembayaran' : 'Simpan Selesai')}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL TAMBAH ITEM */}
      {showItemModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#fff', padding: 24, borderRadius: 16, width: '100%', maxWidth: 500, maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 18, color: 'var(--txt-dark)' }}>Pilih Item Tambahan</h3>
              <i className="bx bx-x" style={{ fontSize: 24, cursor: 'pointer', color: '#888' }} onClick={() => setShowItemModal(false)}></i>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Kategori HTM */}
              <div>
                <div style={{ fontWeight: 700, color: 'var(--txt-dark)', marginBottom: 10, borderBottom: '2px solid #eee', paddingBottom: 5 }}>HTM (Tiket Masuk Tambahan)</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {catalogs.filter(c => c.category === 'htm').map(c => {
                    const qty = cartAddons[c.id] || 0;
                    return (
                      <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px dashed #eee' }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--txt-dark)' }}>{c.name}</div>
                          <div style={{ color: 'var(--pri)', fontSize: 13, fontWeight: 600 }}>Rp {formatRupiah(c.price)}</div>
                        </div>
                        <div className="qty-container">
                          <button className="qty-btn minus" onClick={() => handleAddonChange(c.id, -1)} disabled={qty === 0}>-</button>
                          <span className="qty-input" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{qty}</span>
                          <button className="qty-btn plus" onClick={() => handleAddonChange(c.id, 1)}>+</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Kategori Paket Tenda */}
              <div>
                <div style={{ fontWeight: 700, color: 'var(--txt-dark)', marginBottom: 10, borderBottom: '2px solid #eee', paddingBottom: 5 }}>Paket Tenda</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {catalogs.filter(c => c.category === 'package').map(c => {
                    const qty = cartAddons[c.id] || 0;
                    return (
                      <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px dashed #eee' }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--txt-dark)' }}>{c.name}</div>
                          <div style={{ color: 'var(--pri)', fontSize: 13, fontWeight: 600 }}>Rp {formatRupiah(c.price)}</div>
                        </div>
                        <div className="qty-container">
                          <button className="qty-btn minus" onClick={() => handleAddonChange(c.id, -1)} disabled={qty === 0}>-</button>
                          <span className="qty-input" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{qty}</span>
                          <button className="qty-btn plus" onClick={() => handleAddonChange(c.id, 1)}>+</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Kategori Add Ons */}
              <div>
                <div style={{ fontWeight: 700, color: 'var(--txt-dark)', marginBottom: 10, borderBottom: '2px solid #eee', paddingBottom: 5 }}>Add Ons (Alat Tambahan)</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {catalogs.filter(c => c.category === 'addon').map(c => {
                    const qty = cartAddons[c.id] || 0;
                    return (
                      <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px dashed #eee' }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--txt-dark)' }}>{c.name}</div>
                          <div style={{ color: 'var(--pri)', fontSize: 13, fontWeight: 600 }}>Rp {formatRupiah(c.price)}</div>
                        </div>
                        <div className="qty-container">
                          <button className="qty-btn minus" onClick={() => handleAddonChange(c.id, -1)} disabled={qty === 0}>-</button>
                          <span className="qty-input" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{qty}</span>
                          <button className="qty-btn plus" onClick={() => handleAddonChange(c.id, 1)}>+</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            <button
              className="btn btn-sec"
              style={{ width: '100%', marginTop: 25, padding: 12 }}
              onClick={() => setShowItemModal(false)}
            >
              Simpan & Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
