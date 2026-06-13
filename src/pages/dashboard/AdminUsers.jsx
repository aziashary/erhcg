import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  // State for form
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ username: '', password: '', role: 'admin' });

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/hq-rockshill/users', {
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
      });
      const data = await res.json();
      if (res.ok) {
        setUsers(data.data || []);
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      Swal.fire('Error', err.message || 'Gagal memuat user', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openAdd = () => {
    setEditingId(null);
    setForm({ username: '', password: '', role: 'admin' });
    setShowModal(true);
  };

  const openEdit = (u) => {
    setEditingId(u.id);
    setForm({ username: u.username, password: '', role: u.role });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.username) return Swal.fire('Oops', 'Username wajib diisi', 'error');
    if (!editingId && !form.password) return Swal.fire('Oops', 'Password wajib diisi untuk user baru', 'error');

    const isUpdate = !!editingId;
    const url = isUpdate ? `/api/hq-rockshill/users/${editingId}` : '/api/hq-rockshill/users';
    const method = isUpdate ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      
      if (res.ok) {
        Swal.fire('Berhasil', data.message, 'success');
        setShowModal(false);
        fetchUsers();
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      Swal.fire('Error', err.message || 'Terjadi kesalahan', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus user ini?')) return;
    
    try {
      const res = await fetch(`/api/hq-rockshill/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
      });
      const data = await res.json();
      if (res.ok) {
        Swal.fire('Terhapus', data.message, 'success');
        fetchUsers();
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      Swal.fire('Error', err.message || 'Terjadi kesalahan', 'error');
    }
  };

  return (
    <>
      <div className="pg-hdr desk">
        <div>
          <h1>Manajemen User</h1>
          <p>Kelola akun admin, kasir, dan superadmin.</p>
        </div>
        <div className="pg-hdr-right">
          <button className="btn btn-pri" onClick={openAdd}>
            <i className="bx bx-plus"></i> Tambah User
          </button>
        </div>
      </div>

      <div className="mob" style={{ flexDirection: 'column', marginBottom: 15 }}>
        <h1 style={{ fontFamily: 'Outfit', fontSize: 24, fontWeight: 700 }}>Manajemen User</h1>
        <p style={{ fontSize: 13, color: 'var(--on-dim)', marginBottom: 15 }}>Kelola akun yang bisa mengakses dasbor.</p>
        <button className="btn btn-pri" style={{ width: '100%' }} onClick={openAdd}>
          <i className="bx bx-plus"></i> Tambah User
        </button>
      </div>

      <div className="tbl-wrap" style={{ paddingBottom: '100px', marginTop: '20px' }}>
        {loading ? (
          <div style={{ padding: 20 }}>Loading data...</div>
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th>Username</th>
                <th>Role</th>
                <th>Terdaftar Pada</th>
                <th style={{ width: 100 }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr><td colSpan={4} className="empty">Tidak ada data user.</td></tr>
              ) : users.map(u => (
                <tr key={u.id}>
                  <td><div style={{ fontWeight: 600 }}>{u.username}</div></td>
                  <td>
                    <span className="chip" style={{ 
                      background: u.role === 'superadmin' ? '#d1ecf1' : u.role === 'kasir' ? '#fff3cd' : '#e2e3e5',
                      color: u.role === 'superadmin' ? '#0c5460' : u.role === 'kasir' ? '#856404' : '#383d41'
                    }}>
                      {u.role.toUpperCase()}
                    </span>
                  </td>
                  <td>{new Date(u.created_at).toLocaleDateString('id-ID')}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-icon btn-ol" onClick={() => openEdit(u)}><i className="bx bx-edit"></i></button>
                      <button className="btn btn-icon btn-ol" style={{ color: 'var(--err)', borderColor: 'var(--err)' }} onClick={() => handleDelete(u.id)}><i className="bx bx-trash"></i></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay active" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, zIndex: 9999 }} onClick={(e) => { if(e.target.classList.contains('modal-overlay')) setShowModal(false); }}>
          <div className="modal-content" style={{ width: '100%', maxWidth: 420, padding: 24, borderRadius: 16, background: '#fff', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', border: 'none' }}>
            <h2 style={{ marginTop: 0, marginBottom: 20, fontSize: 20, fontFamily: 'Outfit', color: 'var(--txt-dark)' }}>
              {editingId ? 'Edit User' : 'Tambah User'}
            </h2>
            <form onSubmit={handleSave}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13, color: '#555' }}>Username</label>
                <input 
                  type="text" 
                  className="form-input" 
                  style={{ width: '100%', padding: '12px 14px', border: '1px solid var(--outline-var)', borderRadius: 8, outline: 'none', transition: 'border-color 0.2s' }}
                  placeholder="Masukkan username"
                  value={form.username} 
                  onChange={e => setForm({...form, username: e.target.value})} 
                  required 
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13, color: '#555' }}>
                  Password {editingId && <span style={{ color: '#888', fontWeight: 400 }}>(Opsional)</span>}
                </label>
                <input 
                  type="password" 
                  className="form-input" 
                  style={{ width: '100%', padding: '12px 14px', border: '1px solid var(--outline-var)', borderRadius: 8, outline: 'none', transition: 'border-color 0.2s' }}
                  placeholder={editingId ? 'Kosongkan jika tidak diganti' : 'Minimal 6 karakter'}
                  value={form.password} 
                  onChange={e => setForm({...form, password: e.target.value})} 
                  required={!editingId}
                />
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13, color: '#555' }}>Role Akses</label>
                <div style={{ position: 'relative' }}>
                  <select 
                    className="form-select" 
                    style={{ width: '100%', padding: '12px 14px', border: '1px solid var(--outline-var)', borderRadius: 8, outline: 'none', transition: 'border-color 0.2s', appearance: 'none', background: '#fff' }}
                    value={form.role} 
                    onChange={e => setForm({...form, role: e.target.value})}
                  >
                    <option value="kasir">Kasir</option>
                    <option value="admin">Admin</option>
                    <option value="superadmin">Superadmin</option>
                  </select>
                  <i className='bx bx-chevron-down' style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#888' }}></i>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
                <button type="button" className="btn btn-ol" style={{ flex: 1, padding: '10px' }} onClick={() => setShowModal(false)}>Batal</button>
                <button type="submit" className="btn btn-pri" style={{ flex: 1, padding: '10px' }}>Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
