import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

export default function AdminCatalog() {
  const [catalogs, setCatalogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  const [formData, setFormData] = useState({
    key_id: '',
    name: '',
    category: 'package',
    price: 0,
    capacity: 0,
    htm: 'not_included',
    billing_type: 'night'
  });

  useEffect(() => {
    fetchCatalogs();
  }, []);

  const fetchCatalogs = async () => {
    try {
      const res = await fetch('/api/catalogs');
      const data = await res.json();
      setCatalogs(data.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch catalogs:', error);
      setLoading(false);
    }
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        key_id: item.key_id,
        name: item.name,
        category: item.category,
        price: item.price,
        capacity: item.capacity,
        htm: item.htm,
        billing_type: item.billing_type
      });
    } else {
      setEditingItem(null);
      setFormData({
        key_id: '',
        name: '',
        category: 'package',
        price: 0,
        capacity: 0,
        htm: 'not_included',
        billing_type: 'night'
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingItem(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'capacity' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');
    
    const url = editingItem 
      ? `/api/hq-rockshill/catalogs/${editingItem.id}` 
      : '/api/hq-rockshill/catalogs';
      
    const method = editingItem ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        fetchCatalogs();
        handleCloseModal();
      } else {
        const errorData = await res.json();
        Swal.fire('Error', 'Gagal menyimpan: ' + (errorData.error || 'Unknown error', 'error'));
      }
    } catch (error) {
      console.error('Error saving catalog:', error);
      Swal.fire('Perhatian', 'Terjadi kesalahan jaringan.', 'warning');
    }
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: 'Yakin ingin menghapus?',
      text: "Data yang dihapus tidak dapat dikembalikan!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: 'var(--err)',
      cancelButtonColor: 'var(--on-dim)',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    }).then(async (result) => {
      if (result.isConfirmed) {
        const token = localStorage.getItem('adminToken');
        try {
          const res = await fetch(`/api/hq-rockshill/catalogs/${id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (res.ok) {
            Swal.fire('Terhapus!', 'Item telah dihapus.', 'success');
            fetchCatalogs();
          } else {
            Swal.fire('Error', 'Gagal menghapus item', 'error');
          }
        } catch (error) {
          console.error('Error deleting:', error);
          Swal.fire('Error', 'Terjadi kesalahan jaringan.', 'error');
        }
      }
    });
  };

  if (loading) return <div style={{ padding: '20px' }}>Loading...</div>;

  const packages = catalogs.filter(c => c.category === 'package');
  const addons = catalogs.filter(c => c.category === 'addon');

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Kelola Katalog (Paket & Alat)</h2>
        <button onClick={() => handleOpenModal()} style={{ padding: '10px 20px', background: 'var(--color-primary-brown)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
          + Tambah Item
        </button>
      </div>

      <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', marginBottom: '30px' }}>
        <h3 style={{ borderBottom: '2px solid #eee', paddingBottom: '10px', marginBottom: '15px' }}>Daftar Paket Tenda</h3>
        {/* DESKTOP TABLE */}
        <div className="tbl-wrap desk">
          <table className="tbl">
            <thead>
              <tr>
                <th>ID Kunci</th>
                <th>Nama Paket</th>
                <th>Kapasitas</th>
                <th>Harga</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {packages.map(pkg => (
                <tr key={pkg.id}>
                  <td><span style={{ fontFamily: 'Outfit', fontWeight: 700, color: 'var(--pri)', fontSize: 14 }}>{pkg.key_id}</span></td>
                  <td><div style={{ fontWeight: 600 }}>{pkg.name}</div></td>
                  <td>{pkg.capacity > 0 ? pkg.capacity + ' Orang' : '-'}</td>
                  <td><span style={{ fontFamily: 'Outfit', fontWeight: 700, color: 'var(--pri)', fontSize: 15 }}>Rp {pkg.price.toLocaleString('id-ID')}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => handleOpenModal(pkg)} className="btn btn-ol"><i className="bx bx-edit"></i> Edit</button>
                      <button onClick={() => handleDelete(pkg.id)} className="btn btn-ol" style={{ color: '#ff4d4d', borderColor: '#ff4d4d' }}><i className="bx bx-trash"></i> Hapus</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* MOBILE CARDS */}
        <div className="mob-block" style={{ display: 'none' }}>
          {packages.map(pkg => (
            <div key={pkg.id} className="site-card" style={{ display: 'block', borderLeft: '4px solid var(--pri)', marginBottom: '15px' }}>
              <div className="site-info" style={{ padding: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                  <h4 style={{ fontSize: 16, wordBreak: 'break-word' }}>{pkg.name}</h4>
                  <span className="price" style={{ flexShrink: 0 }}>Rp {pkg.price.toLocaleString('id-ID')}</span>
                </div>
                <p style={{ fontSize: 12, marginBottom: 6 }}>ID: {pkg.key_id} • Kapasitas: {pkg.capacity > 0 ? pkg.capacity + ' Orang' : '-'}</p>
              </div>
              <div style={{ display: 'flex', gap: 6, padding: '10px 14px 14px', borderTop: '1px solid var(--surface-mid)' }}>
                <button className="btn btn-ol" style={{ flex: 1, padding: '8px' }} onClick={() => handleOpenModal(pkg)}><i className="bx bx-edit"></i> Edit</button>
                <button className="btn btn-ol" style={{ flex: 1, padding: '8px', color: '#ff4d4d', borderColor: '#ff4d4d' }} onClick={() => handleDelete(pkg.id)}><i className="bx bx-trash"></i> Hapus</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', marginBottom: '30px' }}>
        <h3 style={{ borderBottom: '2px solid #eee', paddingBottom: '10px', marginBottom: '15px' }}>Daftar Alat Tambahan</h3>
        {/* DESKTOP TABLE */}
        <div className="tbl-wrap desk">
          <table className="tbl">
            <thead>
              <tr>
                <th>ID Kunci</th>
                <th>Nama Alat</th>
                <th>Tipe Harga</th>
                <th>Harga</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {addons.map(add => (
                <tr key={add.id}>
                  <td><span style={{ fontFamily: 'Outfit', fontWeight: 700, color: 'var(--pri)', fontSize: 14 }}>{add.key_id}</span></td>
                  <td><div style={{ fontWeight: 600 }}>{add.name}</div></td>
                  <td>{add.billing_type === 'night' ? 'Per Malam' : 'Flat'}</td>
                  <td><span style={{ fontFamily: 'Outfit', fontWeight: 700, color: 'var(--pri)', fontSize: 15 }}>Rp {add.price.toLocaleString('id-ID')}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => handleOpenModal(add)} className="btn btn-ol"><i className="bx bx-edit"></i> Edit</button>
                      <button onClick={() => handleDelete(add.id)} className="btn btn-ol" style={{ color: '#ff4d4d', borderColor: '#ff4d4d' }}><i className="bx bx-trash"></i> Hapus</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* MOBILE CARDS */}
        <div className="mob-block" style={{ display: 'none' }}>
          {addons.map(add => (
            <div key={add.id} className="site-card" style={{ display: 'block', borderLeft: '4px solid var(--pri)', marginBottom: '15px' }}>
              <div className="site-info" style={{ padding: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                  <h4 style={{ fontSize: 16, wordBreak: 'break-word' }}>{add.name}</h4>
                  <span className="price" style={{ flexShrink: 0 }}>Rp {add.price.toLocaleString('id-ID')}</span>
                </div>
                <p style={{ fontSize: 12, marginBottom: 6 }}>ID: {add.key_id} • Tipe: {add.billing_type === 'night' ? 'Per Malam' : 'Flat'}</p>
              </div>
              <div style={{ display: 'flex', gap: 6, padding: '10px 14px 14px', borderTop: '1px solid var(--surface-mid)' }}>
                <button className="btn btn-ol" style={{ flex: 1, padding: '8px' }} onClick={() => handleOpenModal(add)}><i className="bx bx-edit"></i> Edit</button>
                <button className="btn btn-ol" style={{ flex: 1, padding: '8px', color: '#ff4d4d', borderColor: '#ff4d4d' }} onClick={() => handleDelete(add.id)}><i className="bx bx-trash"></i> Hapus</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ background: '#fff', padding: '30px', borderRadius: '12px', width: '90%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ marginTop: 0, marginBottom: '20px' }}>{editingItem ? 'Edit Item' : 'Tambah Item'}</h3>
            <form onSubmit={handleSubmit}>
              
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Kategori *</label>
                <select name="category" value={formData.category} onChange={handleChange} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}>
                  <option value="package">Paket Tenda</option>
                  <option value="addon">Alat Tambahan</option>
                </select>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>ID Kunci (Key ID) *</label>
                <input type="text" name="key_id" value={formData.key_id} onChange={handleChange} required placeholder="Contoh: lengkap_4p atau sleeping_bag" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
                <small style={{ color: '#888' }}>Digunakan oleh sistem untuk perhitungan khusus.</small>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Nama Item *</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Harga *</label>
                <input type="number" name="price" value={formData.price} onChange={handleChange} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
              </div>

              {formData.category === 'package' && (
                <>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Kapasitas (Orang) *</label>
                    <input type="number" name="capacity" value={formData.capacity} onChange={handleChange} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
                  </div>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Aturan HTM *</label>
                    <select name="htm" value={formData.htm} onChange={handleChange} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}>
                      <option value="not_included">Belum Termasuk HTM</option>
                      <option value="included">Sudah Termasuk HTM</option>
                      <option value="special">HTM Khusus (Bawa Tenda)</option>
                    </select>
                  </div>
                </>
              )}

              {formData.category === 'addon' && (
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px' }}>Tipe Harga (Billing Type) *</label>
                  <select name="billing_type" value={formData.billing_type} onChange={handleChange} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}>
                    <option value="night">Per Malam</option>
                    <option value="flat">Sekali Bayar (Flat)</option>
                  </select>
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', marginTop: '25px' }}>
                <button type="button" onClick={handleCloseModal} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #ddd', background: '#f5f5f5', cursor: 'pointer' }}>Batal</button>
                <button type="submit" style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', background: 'var(--color-primary-brown)', color: '#fff', cursor: 'pointer' }}>Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
