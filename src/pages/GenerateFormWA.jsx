import { useState, useEffect, useMemo } from 'react';
import { useSettings } from '../context/SettingsContext';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import SkeletonForm from '../components/SkeletonForm';


function formatRupiah(angka) {
  return 'Rp ' + angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

const MAX_AREA_CAPACITY = {
  'Area 0': 1,
  'Area 1': 3,
  'Area 2': 5,
  'Area 3': 5,
  'Area 4': 3,
  'Area 4 Samping': 1,
  'Area 5': 2,
  'Area 6': 2,
  'Area 7': 2,
  'Area 8': 3,
  'Campervan': 3
};

export default function GenerateFormWA() {
  const { settings } = useSettings();
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [formData, setFormData] = useState({
    nama: '', wa: '', email: '',
    jml_dewasa: 2, jml_anak: 0, jml_motor: '', jml_mobil: '',
    checkin: today.toISOString().split('T')[0],
    checkout: tomorrow.toISOString().split('T')[0],
    jam_kedatangan: '', area_camp: ''
  });

  const [packageDefs, setPackageDefs] = useState([]);
  const [addonDefs, setAddonDefs] = useState([]);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(true);

  const [packages, setPackages] = useState({});
  const [addons, setAddons] = useState({});

  useEffect(() => {
    fetch('/api/catalogs')
      .then(res => res.json())
      .then(data => {
        const cat = data.data || [];
        const pDefs = cat.filter(c => c.category === 'package').map(c => ({
          id: c.key_id,
          name: c.name,
          price: c.price,
          htm: c.htm,
          capacity: c.capacity,
          description: c.description,
          isRecommended: c.key_id.startsWith('lengkap_'),
          isBestseller: c.key_id.startsWith('konten_')
        }));

        // Sort addonDefs exactly as the original hardcoded list
        const desiredAddonOrder = [
          'paket_grill', 'kompor_gas', 'nesting', 'kayu_bakar', 'sleeping_bag',
          'matras_90', 'matras_180', 'lampu_tenda', 'lampu_tumblr', 'kursi_lipat',
          'meja_lipat_besi', 'kabel_roll', 'kasur', 'tiang_besi', 'tripod',
          'extra_sosis', 'extra_daging', 'extra_ayam'
        ];

        const aDefs = cat.filter(c => c.category === 'addon').map(c => ({
          id: c.key_id,
          name: c.name,
          price: c.price,
          type: c.billing_type
        })).sort((a, b) => {
          let ia = desiredAddonOrder.indexOf(a.id);
          let ib = desiredAddonOrder.indexOf(b.id);
          if (ia === -1) ia = 999;
          if (ib === -1) ib = 999;
          return ia - ib;
        });
        setPackageDefs(pDefs);
        setAddonDefs(aDefs);

        setPackages(pDefs.reduce((acc, curr) => ({ ...acc, [curr.id]: 0 }), {}));
        setAddons(aDefs.reduce((acc, curr) => ({ ...acc, [curr.id]: 0 }), {}));
        setIsLoadingCatalog(false);
      })
      .catch(err => {
        console.error(err);
        setIsLoadingCatalog(false);
      });
  }, []);

  const [flysheetRemoved, setFlysheetRemoved] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // 'info', 'alat', null
  const [activeInfoPaket, setActiveInfoPaket] = useState(null);
  const [turnstileToken, setTurnstileToken] = useState('dummy_token'); // Mock turnstile for React
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [showCopyToast, setShowCopyToast] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const next = { ...prev, [name]: value };
      if (name === 'checkin') {
        const ci = new Date(value);
        if (!isNaN(ci.getTime())) {
          ci.setDate(ci.getDate() + 1);
          next.checkout = ci.toISOString().split('T')[0];
        }
      }
      return next;
    });
  };

  const handlePackageChange = (id, delta) => {
    setPackages(prev => {
      const current = prev[id] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [id]: next };
    });
    setFlysheetRemoved(false); // reset on package change
  };

  const handleAddonChange = (id, delta) => {
    setAddons(prev => {
      const current = prev[id] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [id]: next };
    });
  };

  // Calculations
  const nights = useMemo(() => {
    const ci = new Date(formData.checkin);
    const co = new Date(formData.checkout);
    if (co <= ci) return 1;
    return Math.ceil(Math.abs(co - ci) / (1000 * 60 * 60 * 24));
  }, [formData.checkin, formData.checkout]);

  const isWeekend = useMemo(() => {
    const ci = new Date(formData.checkin);
    const co = new Date(formData.checkout);
    let weekend = false;
    let current = new Date(ci);
    while (current < co) {
      const day = current.getDay();
      if (day === 0 || day === 5 || day === 6) { weekend = true; break; }
      current.setDate(current.getDate() + 1);
    }
    return weekend;
  }, [formData.checkin, formData.checkout]);

  // Area Rules Validation (auto-adjustments)
  useEffect(() => {
    const area = formData.area_camp;
    let newPackages = { ...packages };
    let changed = false;
    let alerts = [];

    // Rule 1: Weekend Campervan/Area 8 KHUSUS Bawa Tenda Sendiri
    if (isWeekend && (area === 'Campervan' || area === 'Area 8')) {
      let hasSewa = false;
      Object.keys(newPackages).forEach(id => {
        if (id !== 'tenda_sendiri' && newPackages[id] > 0) {
          hasSewa = true;
          newPackages[id] = 0;
        }
      });
      if (hasSewa) {
        changed = true;
        alerts.push(`Saat weekend/libur, ${area} KHUSUS untuk "Bawa Tenda Sendiri". Paket sewa Anda telah di-reset.`);
      }
    }

    // Rule 2: Paket 4P ONLY in Area 1, 3, 4, 5, 8, Campervan
    const allowed4pAreas = ['Area 1', 'Area 3', 'Area 4', 'Area 5', 'Area 8', 'Campervan'];
    if (area && !allowed4pAreas.includes(area)) {
      let has4p = false;
      packageDefs.filter(p => p.capacity === 4).forEach(p => {
        if (newPackages[p.id] > 0) {
          has4p = true;
          newPackages[p.id] = 0;
        }
      });
      if (has4p) {
        changed = true;
        alerts.push(`Paket berkapasitas 4 Orang tidak diizinkan di ${area}. Paket 4P Anda telah di-reset.`);
      }
    }

    if (changed) {
      setPackages(newPackages);
      Swal.fire('Perhatian', alerts.join('\n\n', 'warning'));
    }
  }, [formData.area_camp, isWeekend, packages]); // Dependency note: this might loop if not careful. The logic is only to zero out, so it stabilizes.

  // UI States derived from Area
  const recommended2pAreas = ['Area 2', 'Area 5', 'Area 6', 'Area 7'];

  // Capacity Check
  const capacityInfo = useMemo(() => {
    const dewasa = parseInt(formData.jml_dewasa) || 0;
    const anak = parseInt(formData.jml_anak) || 0;
    const totalPeople = dewasa + anak;

    let totalMaxCapacity = 0;
    let hasPackages = false;
    let hasTendaSendiri = packages.tenda_sendiri > 0;

    Object.keys(packages).forEach(id => {
      const qty = packages[id];
      if (qty > 0 && id !== 'tenda_sendiri') {
        hasPackages = true;
        const cap = packageDefs.find(p => p.id === id).capacity;
        totalMaxCapacity += (qty * (cap + 1)); // allow 1 extra? original logic said +1
      }
    });

    if (hasTendaSendiri) return { isValid: true };
    if (hasPackages && totalPeople > totalMaxCapacity) return { isValid: false };
    return { isValid: true };
  }, [formData.jml_dewasa, formData.jml_anak, packages]);

  // Summary Calculation
  const summary = useMemo(() => {
    let htmlLines = [];
    let total = 0;

    let totalHtmIncluded = 0;
    let totalHtmDiscountCapacity = 0;
    let hasKontenOrFullset = false;
    let sumKontenFullset = 0;

    const nightSuffix = nights > 1 ? ` (${nights})` : '';

    packageDefs.forEach(p => {
      const qty = packages[p.id];
      if (qty > 0) {
        if (['konten_4p', 'fullset_4p', 'konten_2p', 'fullset_2p'].includes(p.id)) {
          hasKontenOrFullset = true;
          sumKontenFullset += qty;
        }

        if (p.htm === 'included') {
          totalHtmIncluded += (qty * (p.capacity || 0));
          totalHtmDiscountCapacity += (qty * 1); // 1 extra person gets discount
        } else if (p.htm === 'not_included') {
          totalHtmDiscountCapacity += (qty * ((p.capacity || 0) + 1)); // base capacity + 1 extra person gets discount
        }

        if (p.price > 0) {
          const totalItem = p.price * nights * qty;
          total += totalItem;
          htmlLines.push({ id: p.id, type: 'package', label: `${qty}x ${p.name}${nightSuffix}`, val: totalItem, removable: true });
        } else if (p.id === 'tenda_sendiri') {
          htmlLines.push({ id: p.id, type: 'package', label: `${qty}x ${p.name}`, val: 0, text: '-', removable: true });
        }
      }
    });

    const dewasa = parseInt(formData.jml_dewasa) || 0;
    const remainingPeople = Math.max(0, dewasa - totalHtmIncluded);
    const peopleAt35k = Math.min(remainingPeople, totalHtmDiscountCapacity);
    const peopleAt45k = remainingPeople - peopleAt35k;

    if (peopleAt35k > 0) {
      const t = peopleAt35k * 35000;
      total += t;
      htmlLines.push({ label: `${peopleAt35k}x Htm Paket`, val: t });
    }

    if (peopleAt45k > 0) {
      const t = peopleAt45k * 45000;
      total += t;
      htmlLines.push({ label: `${peopleAt45k}x Htm Tenda Sendiri`, val: t });
    }

    if (hasKontenOrFullset && !flysheetRemoved) {
      const t = 35000 * nights * sumKontenFullset;
      total += t;
      htmlLines.push({
        label: `${sumKontenFullset}x Flysheet${nightSuffix}`,
        val: t,
        removable: false
      });
    }

    addonDefs.forEach(a => {
      const qty = addons[a.id];
      if (qty > 0) {
        let t = a.price * qty;
        let suffix = '';
        if (a.type !== 'flat' && nights > 1) {
          suffix = ` (${nights})`;
        }
        total += t;
        htmlLines.push({ id: a.id, type: 'addon', label: `${qty}x ${a.name}${suffix}`, val: t, removable: true });
      }
    });

    return { htmlLines, total };
  }, [formData.jml_dewasa, packages, addons, nights, flysheetRemoved, packageDefs, addonDefs]);

  const totalTents = useMemo(() => {
    let t = 0;
    Object.keys(packages).forEach(id => {
      if (id !== 'tenda_sendiri' && packages[id] > 0) t += packages[id];
    });
    t += (packages.tenda_sendiri || 0);
    return t;
  }, [packages]);

  const maxTents = formData.area_camp ? MAX_AREA_CAPACITY[formData.area_camp] || 99 : 99;
  const areaCapacityValid = !formData.area_camp || (totalTents <= maxTents);

  const hasAnyOrder = summary.total > 0 || packages.tenda_sendiri > 0;
  const isSubmitDisabled = !areaCapacityValid || !hasAnyOrder || !turnstileToken || isSubmitting;

  const handleSubmit = (e) => {
    e.preventDefault();

    let totalCapacity = 0;
    const filteredPackages = {};
    Object.keys(packages).forEach(id => {
      if (packages[id] > 0) {
        filteredPackages[id] = packages[id];
        const pkg = packageDefs.find(p => p.id === id);
        if (pkg && pkg.capacity) totalCapacity += (pkg.capacity * packages[id]);
      }
    });

    const filteredAddons = {};
    Object.keys(addons).forEach(id => {
      if (addons[id] > 0) {
        filteredAddons[id] = addons[id];
      }
    });

    const data = {
      p: filteredPackages,
      h: parseInt(formData.jml_dewasa) || 0,
      ci: formData.checkin,
      co: formData.checkout,
      ar: formData.area_camp,
      a: filteredAddons
    };

    const encoded = btoa(JSON.stringify(data));
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/special-booking?data=${encoded}`;
    setGeneratedLink(link);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedLink);
    setShowCopyToast(true);
    setTimeout(() => setShowCopyToast(false), 3000);
  };

  const removeFlysheet = () => {
    Swal.fire({
      title: 'Yakin ingin menghapus Flysheet?',
      text: "Flysheet sangat penting untuk menahan embun malam dan hujan agar tenda tidak basah/rembes.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Apakah Anda benar-benar yakin?',
          text: "Kenyamanan camping Anda mungkin akan terganggu tanpa Flysheet.",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#d33',
          cancelButtonColor: '#3085d6',
          confirmButtonText: 'Ya, Saya Yakin!',
          cancelButtonText: 'Batal'
        }).then((res2) => {
          if (res2.isConfirmed) {
            setFlysheetRemoved(true);
          }
        });
      }
    });
  };

  return (
    <main className="page-transition">
      <div className="page-header">
        <div className="container">
          <h1>Buat Link Reservasi</h1>
          <p>Pilih paket dan HTM sesuai permintaan customer di WhatsApp. Sistem akan membuat link khusus yang pre-filled dan terkunci.</p>
        </div>
      </div>

      <div className="container">
        {isLoadingCatalog ? (
          <SkeletonForm />
        ) : (
        <div className="form-container">
          <form onSubmit={handleSubmit}>
            {/* Jadwal Camping */}
            <h2 className="section-title">Jadwal Camping & Peserta</h2>
            <div className="form-row">
              <div className="form-group">
                <label>Tanggal Check-in *</label>
                <input type="date" name="checkin" value={formData.checkin} onChange={handleChange} className="form-control" required min={today.toISOString().split('T')[0]} />
              </div>
              <div className="form-group">
                <label>Tanggal Check-out *</label>
                <input type="date" name="checkout" value={formData.checkout} onChange={handleChange} className="form-control" required min={today.toISOString().split('T')[0]} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Jumlah Dewasa *</label>
                <input type="number" name="jml_dewasa" value={formData.jml_dewasa} onChange={handleChange} className="form-control" min="1" required />
              </div>
              <div className="form-group">
                <label>Jumlah Anak-anak</label>
                <input type="number" name="jml_anak" value={formData.jml_anak} onChange={handleChange} className="form-control" min="0" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group" style={{ flex: 1 }}>
                <label>
                  Area Camp *
                  <Link to="/area" style={{ marginLeft: '10px', fontSize: '0.85rem', color: 'var(--color-primary-brown)', textDecoration: 'none', fontWeight: 'bold' }}>
                    <i className='bx bx-info-circle'></i> Info Area
                  </Link>
                </label>
                <select name="area_camp" value={formData.area_camp} onChange={handleChange} className="form-control" required>
                  <option value="" disabled>Pilih Area Camp</option>
                  {['Area 0', 'Area 1', 'Area 2', 'Area 3', 'Area 4', 'Area 4 Samping', 'Area 5', 'Area 6', 'Area 7', 'Area 8', 'Campervan'].map(a => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>
            </div>

            {formData.area_camp === 'Area 1' && (
              <div style={{ backgroundColor: '#e2f0d9', color: '#2e5c1e', padding: '10px 15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #c3d69b', fontSize: '0.9rem' }}>
                <strong><i className="bx bx-info-circle"></i> Rekomendasi:</strong> Area 1 sangat disarankan untuk rombongan 2-3 tenda atau 6-12 orang.
              </div>
            )}
            {recommended2pAreas.includes(formData.area_camp) && (
              <div style={{ backgroundColor: '#e2f0d9', color: '#2e5c1e', padding: '10px 15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #c3d69b', fontSize: '0.9rem' }}>
                <strong><i className="bx bx-info-circle"></i> Rekomendasi:</strong> Area ini sangat cocok dan direkomendasikan untuk paket tenda berkapasitas 2 orang.
              </div>
            )}

            <p style={{ fontWeight: 600, color: 'var(--color-primary-brown)', marginTop: '-10px', marginBottom: '20px' }}>Durasi: {nights} Malam</p>

            {!areaCapacityValid && (
              <div style={{ backgroundColor: '#f8d7da', color: '#721c24', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #f5c6cb' }}>
                <strong><i className='bx bx-error'></i> Area Camp Penuh!</strong><br />
                Kapasitas {formData.area_camp} tidak cukup untuk menampung jumlah tenda Anda. Silakan kurangi tenda atau pilih Area lain.
              </div>
            )}

            {/* Pilihan Paket */}
            <h2 className="section-title">Pilihan Paket</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>

              {/* Lengkap */}
              <div style={{ display: 'flex', flexDirection: 'column', border: '1px solid #eee', borderRadius: '8px', overflow: 'hidden' }}>
                {packageDefs.filter(p => p.id.startsWith('lengkap_')).map(p => (
                  <div key={p.id} className={`radio-card ${packages[p.id] > 0 ? 'selected' : ''}`} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', border: 'none', borderBottom: '1px solid #eee', borderRadius: 0, padding: '15px' }}>
                    <div className="radio-content">
                      <strong>{p.name} <span style={{ backgroundColor: 'var(--color-forest-green)', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem' }}>Recommended</span>
                        <button type="button" className="btn-info-icon" onClick={() => { setActiveInfoPaket(p.id); setActiveModal('info'); }}><i className='bx bx-info-circle'></i></button>
                      </strong>
                      <span>{formatRupiah(p.price)}</span><br />
                      <small>Belum termasuk HTM</small>
                    </div>
                    <div className="qty-container">
                      <button type="button" className="qty-btn minus" onClick={() => handlePackageChange(p.id, -1)}>-</button>
                      <input type="number" className="qty-input" value={packages[p.id]} readOnly style={{ width: '40px', textAlign: 'center', border: 'none', outline: 'none', background: 'transparent' }} />
                      <button type="button" className="qty-btn plus" onClick={() => handlePackageChange(p.id, 1)}>+</button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Konten */}
              <div style={{ display: 'flex', flexDirection: 'column', border: '1px solid #eee', borderRadius: '8px', overflow: 'hidden' }}>
                {packageDefs.filter(p => p.id.startsWith('konten_')).map(p => (
                  <div key={p.id} className={`radio-card ${packages[p.id] > 0 ? 'selected' : ''}`} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', border: 'none', borderBottom: '1px solid #eee', borderRadius: 0, padding: '15px' }}>
                    <div className="radio-content">
                      <strong>{p.name} <span style={{ backgroundColor: 'var(--color-primary-brown)', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem' }}>Best Seller</span>
                        <button type="button" className="btn-info-icon" onClick={() => { setActiveInfoPaket(p.id); setActiveModal('info'); }}><i className='bx bx-info-circle'></i></button>
                      </strong>
                      <span>{formatRupiah(p.price)}</span><br />
                      <small>Belum termasuk HTM</small>
                    </div>
                    <div className="qty-container">
                      <button type="button" className="qty-btn minus" onClick={() => handlePackageChange(p.id, -1)}>-</button>
                      <input type="number" className="qty-input" value={packages[p.id]} readOnly style={{ width: '40px', textAlign: 'center', border: 'none', outline: 'none', background: 'transparent' }} />
                      <button type="button" className="qty-btn plus" onClick={() => handlePackageChange(p.id, 1)}>+</button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Fullset */}
              <div style={{ display: 'flex', flexDirection: 'column', border: '1px solid #eee', borderRadius: '8px', overflow: 'hidden' }}>
                {packageDefs.filter(p => p.id.startsWith('fullset_')).map(p => (
                  <div key={p.id} className={`radio-card ${packages[p.id] > 0 ? 'selected' : ''}`} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', border: 'none', borderBottom: '1px solid #eee', borderRadius: 0, padding: '15px' }}>
                    <div className="radio-content">
                      <strong>{p.name}
                        <button type="button" className="btn-info-icon" onClick={() => { setActiveInfoPaket(p.id); setActiveModal('info'); }}><i className='bx bx-info-circle'></i></button>
                      </strong>
                      <span>{formatRupiah(p.price)}</span><br />
                      <small>Belum termasuk HTM</small>
                    </div>
                    <div className="qty-container">
                      <button type="button" className="qty-btn minus" onClick={() => handlePackageChange(p.id, -1)}>-</button>
                      <input type="number" className="qty-input" value={packages[p.id]} readOnly style={{ width: '40px', textAlign: 'center', border: 'none', outline: 'none', background: 'transparent' }} />
                      <button type="button" className="qty-btn plus" onClick={() => handlePackageChange(p.id, 1)}>+</button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Tenda Sendiri */}
              <div style={{ display: 'flex', flexDirection: 'column', border: '1px solid #eee', borderRadius: '8px', overflow: 'hidden' }}>
                <div className={`radio-card ${packages.tenda_sendiri > 0 ? 'selected' : ''}`} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', border: 'none', padding: '15px' }}>
                  <div className="radio-content">
                    <strong>Bawa Tenda Sendiri</strong>
                    <span>Rp 0</span><br />
                    <small>HTM Rp 45.000 / org</small>
                  </div>
                  <div className="qty-container">
                    <button type="button" className="qty-btn minus" onClick={() => handlePackageChange('tenda_sendiri', -1)}>-</button>
                    <input type="number" className="qty-input" value={packages.tenda_sendiri} readOnly style={{ width: '40px', textAlign: 'center', border: 'none', outline: 'none', background: 'transparent' }} />
                    <button type="button" className="qty-btn plus" onClick={() => handlePackageChange('tenda_sendiri', 1)}>+</button>
                  </div>
                </div>
              </div>

            </div>

            {/* Addons */}
            <h2 className="section-title">Tambahan Sewa Alat & Ekstra</h2>
            <div className="addon-list">
              {addonDefs.slice(0, 4).map(a => (
                <div key={a.id} className="addon-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{a.name} ({formatRupiah(a.price)})</span>
                  <div className="qty-container">
                    <button type="button" className="qty-btn minus" onClick={() => handleAddonChange(a.id, -1)}>-</button>
                    <input type="number" className="qty-input" value={addons[a.id]} readOnly style={{ width: '40px', textAlign: 'center', border: 'none', outline: 'none', background: 'transparent' }} />
                    <button type="button" className="qty-btn plus" onClick={() => handleAddonChange(a.id, 1)}>+</button>
                  </div>
                </div>
              ))}
            </div>
            <button type="button" onClick={() => setActiveModal('alat')} style={{ marginTop: '15px', width: '100%', borderRadius: '8px', fontWeight: 600, padding: '12px 15px', background: 'white', border: '2px solid var(--color-primary-brown)', color: 'var(--color-primary-brown)', cursor: 'pointer' }}>
              Lihat Alat Lainnya <i className='bx bx-list-ul' style={{ verticalAlign: 'middle', fontSize: '1.2rem' }}></i>
            </button>



            <button type="submit" className="btn btn-primary submit-btn" disabled={isSubmitDisabled}>
              {isSubmitting ? 'Memproses...' : <>Generate Link WhatsApp <i className='bx bx-link'></i></>}
            </button>

            {generatedLink && (
              <div style={{ marginTop: '30px', padding: '20px', border: '2px dashed #dcfce7', borderRadius: '12px', backgroundColor: '#f0fdf4', textAlign: 'center' }}>
                <h3 style={{ color: '#166534', marginBottom: '10px' }}>Link Berhasil Dibuat!</h3>
                <p style={{ color: '#166534', fontSize: '0.9rem', marginBottom: '15px' }}>Silakan copy link di bawah ini dan kirim ke customer Anda.</p>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'stretch' }}>
                  <input type="text" readOnly value={generatedLink} style={{ flex: 1, padding: '12px 15px', border: '1px solid #bbf7d0', borderRadius: '8px', backgroundColor: '#fff', color: '#166534', fontSize: '0.95rem', outline: 'none' }} />
                  <button type="button" className="btn btn-primary" onClick={handleCopy} style={{ backgroundColor: '#166534', border: 'none', color: '#fff', padding: '0 20px', borderRadius: '8px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <i className='bx bx-copy'></i> Copy
                  </button>
                </div>
                {showCopyToast && (
                  <div style={{ marginTop: '10px', color: '#166534', fontSize: '0.9rem', fontWeight: 'bold' }}>
                    <i className='bx bx-check-circle'></i> Berhasil disalin!
                  </div>
                )}
              </div>
            )}
          </form>
        </div>
        )}
      </div>

      {/* Modals */}
      {activeModal === 'info' && activeInfoPaket && (
        <div className="modal-overlay active" style={{ display: 'flex' }} onClick={(e) => e.target.classList.contains('modal-overlay') && setActiveModal(null)}>
          <div className="modal-content">
            <div className="modal-header">
              <h3>{packageDefs.find(p => p.id === activeInfoPaket)?.name}</h3>
              <button type="button" className="modal-close" onClick={() => setActiveModal(null)}><i className='bx bx-x'></i></button>
            </div>
            <div className="modal-body">
              <ul style={{ paddingLeft: '20px', lineHeight: 1.6 }}>
                {(() => {
                  const pDef = packageDefs.find(p => p.id === activeInfoPaket);
                  if (!pDef || !pDef.description) return <li>Detail tidak tersedia</li>;
                  try {
                    const items = JSON.parse(pDef.description);
                    return items.map((item, idx) => <li key={idx}>{item}</li>);
                  } catch(e) {
                    return <li>{pDef.description}</li>;
                  }
                })()}
              </ul>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-primary" onClick={() => setActiveModal(null)} style={{ width: '100%' }}>Tutup</button>
            </div>
          </div>
        </div>
      )}

      {activeModal === 'alat' && (
        <div className="modal-overlay active" style={{ display: 'flex' }} onClick={(e) => e.target.classList.contains('modal-overlay') && setActiveModal(null)}>
          <div className="modal-content">
            <div className="modal-header">
              <h3>Sewa Alat Tambahan Lengkap</h3>
              <button type="button" className="modal-close" onClick={() => setActiveModal(null)}><i className='bx bx-x'></i></button>
            </div>
            <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              <div className="addon-list" style={{ gridTemplateColumns: '1fr' }}>
                {addonDefs.slice(4).map(a => (
                  <div key={a.id} className="addon-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{a.name} ({formatRupiah(a.price)})</span>
                    <div className="qty-container">
                      <button type="button" className="qty-btn minus" onClick={() => handleAddonChange(a.id, -1)}>-</button>
                      <input type="number" className="qty-input" value={addons[a.id]} readOnly style={{ width: '40px', textAlign: 'center', border: 'none', outline: 'none', background: 'transparent' }} />
                      <button type="button" className="qty-btn plus" onClick={() => handleAddonChange(a.id, 1)}>+</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-primary" onClick={() => setActiveModal(null)} style={{ width: '100%' }}>Terapkan & Tutup</button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}
