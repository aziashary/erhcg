import re

with open('src/pages/dashboard/AdminCatalog.jsx', 'r') as f:
    content = f.read()

# Replace the Paket Tenda table
paket_table_regex = re.compile(
    r'<h3 style={{ borderBottom.*?Daftar Paket Tenda</h3>\n\s*<table.*?</table>',
    re.DOTALL
)

paket_replacement = """<h3 style={{ borderBottom: '2px solid #eee', paddingBottom: '10px', marginBottom: '15px' }}>Daftar Paket Tenda</h3>
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
            <div key={pkg.id} className="site-card" style={{ display: 'block', borderLeft: '4px solid var(--pri)' }}>
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
        </div>"""

content = paket_table_regex.sub(paket_replacement, content)

# Replace the Alat Tambahan table
addon_table_regex = re.compile(
    r'<h3 style={{ borderBottom.*?Daftar Alat Tambahan</h3>\n\s*<table.*?</table>',
    re.DOTALL
)

addon_replacement = """<h3 style={{ borderBottom: '2px solid #eee', paddingBottom: '10px', marginBottom: '15px' }}>Daftar Alat Tambahan</h3>
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
            <div key={add.id} className="site-card" style={{ display: 'block', borderLeft: '4px solid var(--pri)' }}>
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
        </div>"""

content = addon_table_regex.sub(addon_replacement, content)

with open('src/pages/dashboard/AdminCatalog.jsx', 'w') as f:
    f.write(content)
