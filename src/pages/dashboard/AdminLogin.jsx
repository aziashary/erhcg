import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './dashboard.css';

function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:8000/api/hq-rockshill/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (data.status && data.token) {
        localStorage.setItem('adminToken', data.token);
        navigate('/hq-rockshill');
      } else {
        setError(data.error || 'Login gagal. Periksa username dan password.');
      }
    } catch {
      setError('Tidak dapat terhubung ke server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#fff8ef', fontFamily: "'Inter', sans-serif", padding: 20,
    }}>
      <div style={{
        width: '100%', maxWidth: 380, background: '#fff', borderRadius: 16,
        border: '1px solid #d4c4b3', boxShadow: '0 8px 20px rgba(74,47,24,.10)', overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          background: '#a7752a', padding: '28px 24px', textAlign: 'center', color: '#fff',
        }}>
          <div style={{
            width: 48, height: 48, background: 'rgba(255,255,255,.2)', borderRadius: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 12px', fontSize: 24,
          }}>
            <i className="bx bx-mountain"></i>
          </div>
          <h1 style={{ fontFamily: 'Outfit', fontSize: 22, fontWeight: 700, margin: 0 }}>Rockshill</h1>
          <p style={{ fontSize: 11, opacity: .8, marginTop: 4, textTransform: 'uppercase', letterSpacing: '.06em' }}>
            Admin Perkemahan
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: 24 }}>
          <h2 style={{ fontFamily: 'Outfit', fontSize: 20, fontWeight: 600, marginBottom: 4, color: '#1e1b16' }}>
            Masuk ke Dashboard
          </h2>
          <p style={{ fontSize: 13, color: '#504538', marginBottom: 20 }}>
            Gunakan akun admin untuk melanjutkan.
          </p>

          {error && (
            <div style={{
              background: '#ffdad6', border: '1px solid #f5c6c6', borderRadius: 8,
              padding: '10px 14px', marginBottom: 16, color: '#93000a', fontSize: 13,
            }}>
              {error}
            </div>
          )}

          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#504538', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.04em' }}>
            Username
          </label>
          <input
            type="text" value={username} onChange={e => setUsername(e.target.value)} required
            placeholder="Masukkan username"
            style={{
              width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #d4c4b3',
              fontSize: 14, marginBottom: 16, outline: 'none', background: '#fff', fontFamily: 'Inter',
              transition: 'border-color .2s', boxSizing: 'border-box',
            }}
            onFocus={e => e.target.style.borderColor = '#a7752a'}
            onBlur={e => e.target.style.borderColor = '#d4c4b3'}
          />

          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#504538', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.04em' }}>
            Password
          </label>
          <input
            type="password" value={password} onChange={e => setPassword(e.target.value)} required
            placeholder="••••••••"
            style={{
              width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #d4c4b3',
              fontSize: 14, marginBottom: 24, outline: 'none', background: '#fff', fontFamily: 'Inter',
              transition: 'border-color .2s', boxSizing: 'border-box',
            }}
            onFocus={e => e.target.style.borderColor = '#a7752a'}
            onBlur={e => e.target.style.borderColor = '#d4c4b3'}
          />

          <button
            type="submit" disabled={loading}
            style={{
              width: '100%', padding: '12px', background: loading ? '#9b6b20' : '#a7752a', color: '#fff',
              border: 'none', borderRadius: 8, fontFamily: 'Inter', fontSize: 14, fontWeight: 600,
              cursor: loading ? 'wait' : 'pointer', transition: 'background .2s',
            }}
          >
            {loading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;
