import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './dashboard.css';

export default function AdminSettings() {
  const [formData, setFormData] = useState({
    whatsapp_number: '',
    bank_name: '',
    bank_account: '',
    bank_holder: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.data) {
          setFormData(prev => ({ ...prev, ...data.data }));
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch settings:', err);
        setLoading(false);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });
    
    const keys = Object.keys(formData);
    let hasError = false;

    for (let key of keys) {
      try {
        const res = await fetch(`/api/hq-rockshill/settings/${key}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('adminToken')
          },
          body: JSON.stringify({ value: formData[key] })
        });
        
        if (!res.ok) {
          hasError = true;
          break;
        }
      } catch (err) {
        console.error(err);
        hasError = true;
        break;
      }
    }

    if (hasError) {
      setMessage({ type: 'error', text: 'Gagal menyimpan pengaturan.' });
    } else {
      setMessage({ type: 'success', text: 'Pengaturan berhasil disimpan!' });
      // Reload page to refresh settings globally (or just wait for user to navigate away)
      setTimeout(() => window.location.reload(), 1500);
    }
    setSaving(false);
  };

  if (loading) return <div style={{ padding: 20 }}>Loading...</div>;

  return (
    <>
      <div className="pg-hdr desk">
        <div>
          <h1>Pengaturan Aplikasi</h1>
          <p>Ubah konfigurasi aplikasi seperti nomor WhatsApp dan data Rekening Bank.</p>
        </div>
        <div className="pg-hdr-right">
          <button className="btn btn-ol" onClick={() => navigate('/hq-rockshill/dashboard')}>
            <i className="bx bx-arrow-back"></i> Kembali ke Dashboard
          </button>
        </div>
      </div>
      
      {/* Mobile title */}
      <div className="mob" style={{ flexDirection: 'column', marginBottom: 14 }}>
        <button className="btn btn-ol" style={{ alignSelf: 'flex-start', marginBottom: 12, padding: '6px 12px' }} onClick={() => navigate('/hq-rockshill/dashboard')}>
          <i className="bx bx-arrow-back"></i> Kembali
        </button>
        <h1 style={{ fontFamily: 'Outfit', fontSize: 24, fontWeight: 700 }}>Pengaturan</h1>
        <p style={{ fontSize: 13, color: 'var(--on-dim)' }}>Ubah konfigurasi aplikasi</p>
      </div>

      {message.text && (
        <div style={{ padding: 15, marginBottom: 20, borderRadius: 8, background: message.type === 'success' ? '#e6f4ea' : '#fce8e6', color: message.type === 'success' ? '#137333' : '#c5221f' }}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ background: 'var(--card)', padding: '24px 28px', borderRadius: 'var(--r-md)', border: '1px solid var(--outline-var)', boxShadow: 'var(--sh-1)' }}>
        <h3 style={{ marginBottom: 20, fontSize: 18, fontWeight: 600 }}>Kontak Admin</h3>
        
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--on-dim)', marginBottom: 8 }}>Nomor WhatsApp</label>
          <input 
            type="text" 
            name="whatsapp_number" 
            value={formData.whatsapp_number} 
            onChange={handleChange} 
            style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--r-sm)', border: '1px solid var(--outline-var)', outline: 'none', background: 'var(--surface)', color: 'var(--on)', font: '400 14px/1 "Inter"' }}
            placeholder="Contoh: 6281234567890 (Gunakan kode negara 62)" 
            required 
            onFocus={(e) => e.target.style.borderColor = 'var(--pri)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--outline-var)'}
          />
        </div>

        <h3 style={{ marginTop: 32, marginBottom: 20, fontSize: 18, fontWeight: 600 }}>Rekening Pembayaran</h3>
        
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--on-dim)', marginBottom: 8 }}>Nama Bank</label>
          <input 
            type="text" 
            name="bank_name" 
            value={formData.bank_name} 
            onChange={handleChange} 
            style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--r-sm)', border: '1px solid var(--outline-var)', outline: 'none', background: 'var(--surface)', color: 'var(--on)', font: '400 14px/1 "Inter"' }}
            placeholder="Contoh: Bank BCA" 
            required 
            onFocus={(e) => e.target.style.borderColor = 'var(--pri)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--outline-var)'}
          />
        </div>
        
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--on-dim)', marginBottom: 8 }}>Nomor Rekening</label>
          <input 
            type="text" 
            name="bank_account" 
            value={formData.bank_account} 
            onChange={handleChange} 
            style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--r-sm)', border: '1px solid var(--outline-var)', outline: 'none', background: 'var(--surface)', color: 'var(--on)', font: '400 14px/1 "Inter"' }}
            placeholder="Nomor Rekening" 
            required 
            onFocus={(e) => e.target.style.borderColor = 'var(--pri)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--outline-var)'}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--on-dim)', marginBottom: 8 }}>Atas Nama (Pemilik Rekening)</label>
          <input 
            type="text" 
            name="bank_holder" 
            value={formData.bank_holder} 
            onChange={handleChange} 
            style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--r-sm)', border: '1px solid var(--outline-var)', outline: 'none', background: 'var(--surface)', color: 'var(--on)', font: '400 14px/1 "Inter"' }}
            placeholder="A.n. Mochamad Azi Ashary" 
            required 
            onFocus={(e) => e.target.style.borderColor = 'var(--pri)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--outline-var)'}
          />
        </div>

        <div style={{ marginTop: 32, display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" className="btn btn-pri" disabled={saving}>
            {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
          </button>
        </div>
      </form>
    </>
  );
}
