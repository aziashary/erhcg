import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';

const packageDefs = [
  { id: 'lengkap_4p', name: 'Paket Lengkap 4P', price: 680000, htm: 'included', htmPax: 4, capacity: 4, isRecommended: true },
  { id: 'lengkap_2p', name: 'Paket Lengkap 2P', price: 560000, htm: 'included', htmPax: 2, capacity: 2, isRecommended: true },
  { id: 'konten_4p', name: 'Paket Konten 4P', price: 340000, htm: 'not_included', capacity: 4, isBestseller: true },
  { id: 'konten_2p', name: 'Paket Konten 2P', price: 290000, htm: 'not_included', capacity: 2, isBestseller: true },
  { id: 'fullset_4p', name: 'Paket Fullset 4P', price: 240000, htm: 'not_included', capacity: 4 },
  { id: 'fullset_2p', name: 'Paket Fullset 2P', price: 190000, htm: 'not_included', capacity: 2 },
  { id: 'tenda_sendiri', name: 'Bawa Tenda Sendiri', price: 0, htm: 'special', capacity: 999 }
];

const addonDefs = [
  { id: 'paket_grill', name: 'Paket Grill', price: 130000, type: 'flat' },
  { id: 'kompor_gas', name: 'Kompor + Gas', price: 50000, type: 'night' },
  { id: 'nesting', name: 'Nesting', price: 30000, type: 'night' },
  { id: 'kayu_bakar', name: 'Kayu Bakar', price: 35000, type: 'flat' },
  { id: 'sleeping_bag', name: 'Sleeping Bag', price: 15000, type: 'night' },
  { id: 'matras_90', name: 'Matras 90x180', price: 10000, type: 'night' },
  { id: 'matras_180', name: 'Matras 180x180', price: 20000, type: 'night' },
  { id: 'lampu_tenda', name: 'Lampu Tenda', price: 15000, type: 'night' },
  { id: 'lampu_tumblr', name: 'Lampu Tumblr', price: 25000, type: 'night' },
  { id: 'kursi_lipat', name: 'Kursi Lipat', price: 20000, type: 'night' },
  { id: 'meja_lipat', name: 'Meja Lipat', price: 35000, type: 'night' },
  { id: 'meja_lipat_besi', name: 'Meja Lipat Besi', price: 35000, type: 'night' },
  { id: 'kabel_roll', name: 'Kabel Roll', price: 30000, type: 'night' },
  { id: 'kasur', name: 'Kasur', price: 35000, type: 'night' },
  { id: 'tiang_besi', name: 'Tiang Besi', price: 5000, type: 'night' },
  { id: 'tripod', name: 'Tripod', price: 30000, type: 'night' },
];

const paketDetails = {
  'lengkap_4p': { title: 'Paket Lengkap 4P', items: ['Tenda 4P, 4 SB, 4 Matras 90x180', 'Lampu tenda & Tumblr', '4 Kursi & 1 Meja, Kabel Roll', 'Paket Grill & Alat Masak', 'Termasuk HTM 4 Orang & Flysheet'] },
  'lengkap_2p': { title: 'Paket Lengkap 2P', items: ['Tenda 2P, 2 SB, 2 Matras 90x180', 'Lampu tenda & Tumblr', '2 Kursi & 1 Meja, Kabel Roll', 'Paket Grill & Alat Masak', 'Termasuk HTM 2 Orang & Flysheet'] },
  'konten_4p': { title: 'Paket Konten 4P', items: ['Tenda 4P, 4 SB, 4 Matras 90x180', 'Lampu tenda & Tumblr', '4 Kursi & 1 Meja', 'Kabel Roll & Tripod', '*Belum termasuk HTM & flysheet'] },
  'konten_2p': { title: 'Paket Konten 2P', items: ['Tenda 2P, 2 SB, 2 Matras 90x180', 'Lampu tenda & Tumblr', '2 Kursi & 1 Meja', 'Kabel Roll & Tripod', '*Belum termasuk HTM & flysheet'] },
  'fullset_4p': { title: 'Paket Fullset 4P', items: ['Tenda 4P, 4 SB, 4 Matras 90x180', 'Lampu tenda & Kabel Roll', '*Belum termasuk HTM & flysheet'] },
  'fullset_2p': { title: 'Paket Fullset 2P', items: ['Tenda 2P, 2 SB, 2 Matras 90x180', 'Lampu tenda & Kabel Roll', '*Belum termasuk HTM & flysheet'] }
};

function formatRupiah(angka) {
  return 'Rp ' + angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export default function Reservation() {
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

  const [packages, setPackages] = useState(
    packageDefs.reduce((acc, curr) => ({ ...acc, [curr.id]: 0 }), {})
  );

  const [addons, setAddons] = useState(
    addonDefs.reduce((acc, curr) => ({ ...acc, [curr.id]: 0 }), {})
  );

  const [flysheetRemoved, setFlysheetRemoved] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // 'info', 'alat', null
  const [activeInfoPaket, setActiveInfoPaket] = useState(null);
  const [turnstileToken, setTurnstileToken] = useState('dummy_token'); // Mock turnstile for React
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePackageChange = (id, delta) => {
    setPackages(prev => {
      const current = prev[id];
      const next = Math.max(0, current + delta);
      return { ...prev, [id]: next };
    });
    setFlysheetRemoved(false); // reset on package change
  };

  const handleAddonChange = (id, delta) => {
    setAddons(prev => {
      const current = prev[id];
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
      alert(alerts.join('\n\n'));
    }
  }, [formData.area_camp, isWeekend, packages]); // Dependency note: this might loop if not careful. The logic is only to zero out, so it stabilizes.

  // UI States derived from Area
  const dimAreas = ['Area 2', 'Area 3', 'Area 4', 'Area 6'];
  const isDimmed = formData.area_camp && dimAreas.includes(formData.area_camp);
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

    packageDefs.forEach(p => {
      const qty = packages[p.id];
      if (qty > 0) {
        if (['konten_4p', 'fullset_4p', 'konten_2p', 'fullset_2p'].includes(p.id)) {
          hasKontenOrFullset = true;
          sumKontenFullset += qty;
        }

        if (p.htm === 'included') totalHtmIncluded += (qty * (p.htmPax || 0));
        else if (p.htm === 'not_included') totalHtmDiscountCapacity += (qty * p.capacity);

        if (p.price > 0) {
          const totalItem = p.price * nights * qty;
          total += totalItem;
          htmlLines.push({ label: `${qty}x ${p.name} (${nights} mlm)`, val: totalItem });
        } else if (p.id === 'tenda_sendiri') {
          htmlLines.push({ label: `${qty}x ${p.name}`, val: 0, text: '-' });
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
      htmlLines.push({ label: `HTM Tenda Sewa (${peopleAt35k} org)`, val: t });
    }

    if (peopleAt45k > 0) {
      const t = peopleAt45k * 45000;
      total += t;
      htmlLines.push({ label: `HTM Tenda Sendiri (${peopleAt45k} org)`, val: t });
    }

    if (hasKontenOrFullset && !flysheetRemoved) {
      const t = 35000 * nights * sumKontenFullset;
      total += t;
      htmlLines.push({ 
        label: `${sumKontenFullset}x Flysheet (${nights} mlm)`, 
        val: t,
        removable: true
      });
    }

    addonDefs.forEach(a => {
      const qty = addons[a.id];
      if (qty > 0) {
        let t = a.price * qty;
        let suffix = '';
        if (a.type !== 'flat') {
          t *= nights;
          suffix = ` (${nights} mlm)`;
        }
        total += t;
        htmlLines.push({ label: `${qty}x ${a.name}${suffix}`, val: t });
      }
    });

    return { htmlLines, total };
  }, [formData.jml_dewasa, packages, addons, nights, flysheetRemoved]);

  const hasAnyOrder = summary.total > 0 || packages.tenda_sendiri > 0;
  const isSubmitDisabled = !capacityInfo.isValid || !hasAnyOrder || !turnstileToken || isSubmitting;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!capacityInfo.isValid) return;

    setIsSubmitting(true);
    
    // Generate Whatsapp Message
    function formatTanggalIndo(dateStr) {
      const date = new Date(dateStr);
      const hari = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
      const bulan = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
      const d = date.getDate().toString().padStart(2, '0');
      const m = bulan[date.getMonth()];
      const y = date.getFullYear().toString().slice(-2);
      const h = hari[date.getDay()];
      return `${h}, ${d}-${m}-${y}`;
    }

    let paketText = '';
    packageDefs.forEach(p => {
      const qty = packages[p.id];
      if (qty > 0) {
        if (p.price > 0) {
           paketText += `- ${p.name.padEnd(23, ' ')} ${qty}x\n   ${formatRupiah(p.price * nights * qty).replace('Rp ', '')}\n`;
        } else {
           paketText += `- ${p.name.padEnd(23, ' ')} ${qty}x\n`;
        }
      }
    });
    if (paketText === '') paketText = '- Tidak ada paket tenda\n';

    let addonsText = '';
    const hasKontenOrFullset = ['konten_4p', 'fullset_4p', 'konten_2p', 'fullset_2p'].some(id => packages[id] > 0);
    if (hasKontenOrFullset && !flysheetRemoved) {
       const qty = ['konten_4p', 'fullset_4p', 'konten_2p', 'fullset_2p'].reduce((sum, id) => sum + packages[id], 0);
       addonsText += `- Flysheet                 ${qty}x\n   ${formatRupiah(35000 * nights * qty).replace('Rp ', '')}\n`;
    }
    addonDefs.forEach(a => {
      const qty = addons[a.id];
      if (qty > 0) {
        let t = a.price * qty;
        if (a.type !== 'flat') t *= nights;
        addonsText += `- ${a.name.padEnd(23, ' ')} ${qty}x\n   ${formatRupiah(t).replace('Rp ', '')}\n`;
      }
    });
    if (addonsText === '') addonsText = '- Tidak ada\n';

    const payload = {
      nama: formData.nama,
      wa: formData.wa,
      email: formData.email,
      dewasa: parseInt(formData.jml_dewasa),
      anak: parseInt(formData.jml_anak) || 0,
      motor: parseInt(formData.jml_motor) || 0,
      mobil: parseInt(formData.jml_mobil) || 0,
      checkin: formData.checkin,
      checkout: formData.checkout,
      jamKedatangan: formData.jam_kedatangan,
      nights: nights,
      area: formData.area_camp,
      paketText: paketText.trim(),
      addonsText: addonsText.trim(),
      total: formatRupiah(summary.total)
    };

    fetch('http://localhost:8000/api/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(data => {
      setIsSubmitting(false);
      if (data.success) {
        const invoiceId = data.data.id;
        
        let message = `Halo Admin Rockshill Campground! Saya ingin melakukan reservasi dengan detail berikut:\n\n*Invoice:* ${invoiceId}\n\n`;
        message += `*Data Pemesan*\nNama: ${formData.nama}\nWhatsApp: ${formData.wa}\n`;
        if (formData.email) message += `Email: ${formData.email}\n`;
        message += `Peserta: ${formData.jml_dewasa} Dewasa, ${formData.jml_anak} Anak\nKendaraan: ${formData.jml_motor} Motor, ${formData.jml_mobil} Mobil\n\n`;
        message += `*Jadwal & Lokasi*\nJadwal: ${formatTanggalIndo(formData.checkin)} s.d ${formatTanggalIndo(formData.checkout)} (${nights} Malam)\n`;
        message += `Jam Kedatangan: ${formData.jam_kedatangan}\nArea Camp: ${formData.area_camp}\n\n`;
        message += `*Pilihan Paket*\n${paketText}\n*Alat Tambahan*\n${addonsText}\n*Estimasi Total: ${formatRupiah(summary.total)}*\n\nApakah tanggal tersebut tersedia? Terima kasih!`;

        alert(`Reservasi berhasil dibuat!\n\nNomor Invoice Anda: ${invoiceId}\n\nMohon simpan nomor invoice ini untuk mengecek status. Anda akan diarahkan ke WhatsApp untuk konfirmasi admin.`);
        window.location.href = `https://wa.me/6281234567890?text=${encodeURIComponent(message)}`;
      } else {
        alert('Gagal membuat reservasi: ' + (data.message || 'Error server'));
      }
    })
    .catch(err => {
      setIsSubmitting(false);
      console.error(err);
      alert('Terjadi kesalahan koneksi saat mengirim data reservasi.');
    });
  };

  const removeFlysheet = () => {
    if(confirm("Yakin ingin menghapus Flysheet?\nFlysheet sangat penting untuk menahan embun malam dan hujan agar tenda tidak basah/rembes.")) {
      if(confirm("Apakah Anda benar-benar yakin?\nKenyamanan camping Anda mungkin akan terganggu tanpa Flysheet.")) {
        setFlysheetRemoved(true);
      }
    }
  };

  return (
    <main className="page-transition">
      <div className="page-header">
        <div className="container">
          <h1>Form Reservasi</h1>
          <p>Lengkapi data di bawah ini untuk melihat estimasi biaya dan melakukan pemesanan.</p>
        </div>
      </div>

      <div className="container">
        <div className="form-container">
          <p style={{ textAlign: 'center', marginBottom: '30px', fontSize: '0.95rem', color: '#555' }}>
            Sudah reservasi? <Link to="/check-reservation" style={{ color: 'var(--color-primary-brown)', fontWeight: 600, textDecoration: 'underline' }}>Cek status/invoice Anda di sini.</Link>
          </p>

          <form onSubmit={handleSubmit}>
            {/* Data Pemesan */}
            <h2 className="section-title">Data Pemesan</h2>
            <div className="form-group">
              <label>Nama Lengkap *</label>
              <input type="text" name="nama" value={formData.nama} onChange={handleChange} className="form-control" required placeholder="Masukkan nama Anda" />
            </div>
            <div className="form-group">
              <label>Nomor WhatsApp *</label>
              <input type="tel" name="wa" value={formData.wa} onChange={handleChange} className="form-control" required placeholder="Contoh: 08123456789" />
            </div>
            <div className="form-group">
              <label>Email (Opsional)</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} className="form-control" placeholder="Contoh: nama@email.com" />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Jumlah Dewasa *</label>
                <input type="number" name="jml_dewasa" value={formData.jml_dewasa} onChange={handleChange} className="form-control" min="1" required />
              </div>
              <div className="form-group">
                <label>Jumlah Anak-anak</label>
                <input type="number" name="jml_anak" value={formData.jml_anak} onChange={handleChange} className="form-control" min="0" />
                <small style={{ color: '#666', fontSize: '0.8rem' }}>Anak di bawah 5 tahun</small>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Jumlah Motor (Opsional)</label>
                <input type="number" name="jml_motor" value={formData.jml_motor} onChange={handleChange} className="form-control" min="0" placeholder="0" />
              </div>
              <div className="form-group">
                <label>Jumlah Mobil (Opsional)</label>
                <input type="number" name="jml_mobil" value={formData.jml_mobil} onChange={handleChange} className="form-control" min="0" placeholder="0" />
              </div>
            </div>

            {/* Jadwal Camping */}
            <h2 className="section-title">Jadwal Camping</h2>
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
                <label>Jam Kedatangan *</label>
                <input type="time" name="jam_kedatangan" value={formData.jam_kedatangan} onChange={handleChange} className="form-control" required />
              </div>
              <div className="form-group">
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

            {/* Capacity Alert */}
            {!capacityInfo.isValid && (
              <div style={{ backgroundColor: '#f8d7da', color: '#721c24', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #f5c6cb' }}>
                <strong><i className='bx bx-error'></i> Kapasitas Tenda Tidak Cukup!</strong><br />
                Jumlah total peserta melebihi kapasitas maksimal tenda yang disewa. Silakan tambah jumlah paket.
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
                      <strong>{p.name} <span style={{backgroundColor: 'var(--color-forest-green)', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem'}}>Recommended</span> 
                        <button type="button" className="btn-info-icon" onClick={() => { setActiveInfoPaket(p.id); setActiveModal('info'); }}><i className='bx bx-info-circle'></i></button>
                      </strong>
                      <span>{formatRupiah(p.price)}</span><br />
                      <small>Termasuk HTM {p.htmPax} org</small>
                    </div>
                    <div className="qty-container">
                      <button type="button" className="qty-btn minus" onClick={() => handlePackageChange(p.id, -1)} disabled={p.capacity === 4 && !['Area 1', 'Area 3', 'Area 4', 'Area 5', 'Area 8', 'Campervan', ''].includes(formData.area_camp)}>-</button>
                      <input type="number" className="qty-input" value={packages[p.id]} readOnly style={{width:'40px', textAlign:'center', border:'none', outline:'none', background:'transparent'}}/>
                      <button type="button" className="qty-btn plus" onClick={() => handlePackageChange(p.id, 1)} disabled={p.capacity === 4 && !['Area 1', 'Area 3', 'Area 4', 'Area 5', 'Area 8', 'Campervan', ''].includes(formData.area_camp)}>+</button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Konten */}
              <div style={{ display: 'flex', flexDirection: 'column', border: '1px solid #eee', borderRadius: '8px', overflow: 'hidden' }}>
                {packageDefs.filter(p => p.id.startsWith('konten_')).map(p => (
                  <div key={p.id} className={`radio-card ${packages[p.id] > 0 ? 'selected' : ''}`} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', border: 'none', borderBottom: '1px solid #eee', borderRadius: 0, padding: '15px' }}>
                    <div className="radio-content">
                      <strong>{p.name} <span style={{backgroundColor: 'var(--color-primary-brown)', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem'}}>Best Seller</span> 
                        <button type="button" className="btn-info-icon" onClick={() => { setActiveInfoPaket(p.id); setActiveModal('info'); }}><i className='bx bx-info-circle'></i></button>
                      </strong>
                      <span>{formatRupiah(p.price)}</span><br />
                      <small>Belum termasuk HTM</small>
                    </div>
                    <div className="qty-container">
                      <button type="button" className="qty-btn minus" onClick={() => handlePackageChange(p.id, -1)}>-</button>
                      <input type="number" className="qty-input" value={packages[p.id]} readOnly style={{width:'40px', textAlign:'center', border:'none', outline:'none', background:'transparent'}}/>
                      <button type="button" className="qty-btn plus" onClick={() => handlePackageChange(p.id, 1)}>+</button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Fullset */}
              <div className={isDimmed ? 'less-visible' : ''} style={{ display: 'flex', flexDirection: 'column', border: '1px solid #eee', borderRadius: '8px', overflow: 'hidden' }}>
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
                      <input type="number" className="qty-input" value={packages[p.id]} readOnly style={{width:'40px', textAlign:'center', border:'none', outline:'none', background:'transparent'}}/>
                      <button type="button" className="qty-btn plus" onClick={() => handlePackageChange(p.id, 1)}>+</button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Tenda Sendiri */}
              <div className={isDimmed ? 'less-visible' : ''} style={{ display: 'flex', flexDirection: 'column', border: '1px solid #eee', borderRadius: '8px', overflow: 'hidden' }}>
                <div className={`radio-card ${packages.tenda_sendiri > 0 ? 'selected' : ''}`} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', border: 'none', padding: '15px' }}>
                  <div className="radio-content">
                    <strong>Bawa Tenda Sendiri</strong>
                    <span>Rp 0</span><br />
                    <small>HTM Rp 45.000 / org</small>
                  </div>
                  <div className="qty-container">
                    <button type="button" className="qty-btn minus" onClick={() => handlePackageChange('tenda_sendiri', -1)}>-</button>
                    <input type="number" className="qty-input" value={packages.tenda_sendiri} readOnly style={{width:'40px', textAlign:'center', border:'none', outline:'none', background:'transparent'}}/>
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
                    <input type="number" className="qty-input" value={addons[a.id]} readOnly style={{width:'40px', textAlign:'center', border:'none', outline:'none', background:'transparent'}}/>
                    <button type="button" className="qty-btn plus" onClick={() => handleAddonChange(a.id, 1)}>+</button>
                  </div>
                </div>
              ))}
            </div>
            <button type="button" onClick={() => setActiveModal('alat')} style={{ marginTop: '15px', width: '100%', borderRadius: '8px', fontWeight: 600, padding: '12px 15px', background: 'white', border: '2px solid var(--color-primary-brown)', color: 'var(--color-primary-brown)', cursor: 'pointer' }}>
              Lihat Alat Lainnya <i className='bx bx-list-ul' style={{ verticalAlign: 'middle', fontSize: '1.2rem' }}></i>
            </button>

            {/* Summary */}
            <div className="summary-box">
              <h3>Ringkasan Biaya</h3>
              <div>
                {summary.htmlLines.length === 0 && <div className="summary-row"><span>Belum ada pesanan</span></div>}
                {summary.htmlLines.map((line, idx) => (
                  <div key={idx} className="summary-row">
                    <span>
                      {line.label}
                      {line.removable && <button type="button" onClick={removeFlysheet} style={{background:'none', border:'none', color:'red', cursor:'pointer'}} title="Hapus Flysheet"><i className='bx bx-trash'></i></button>}
                    </span>
                    <span>{line.text || formatRupiah(line.val)}</span>
                  </div>
                ))}
              </div>
              <div className="summary-total">
                <span>Total Estimasi:</span>
                <span>{formatRupiah(summary.total)}</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '10px' }}>*Estimasi ini belum termasuk penyesuaian khusus jika ada.</p>
            </div>

            <button type="submit" className="btn btn-primary submit-btn" disabled={isSubmitDisabled}>
              {isSubmitting ? 'Memproses...' : <>Kirim ke WhatsApp Admin <i className='bx bxl-whatsapp'></i></>}
            </button>
          </form>
        </div>
      </div>

      {/* Modals */}
      {activeModal === 'info' && activeInfoPaket && (
        <div className="modal-overlay active" style={{ display: 'flex' }} onClick={(e) => e.target.classList.contains('modal-overlay') && setActiveModal(null)}>
          <div className="modal-content">
            <div className="modal-header">
              <h3>{paketDetails[activeInfoPaket].title}</h3>
              <button type="button" className="modal-close" onClick={() => setActiveModal(null)}><i className='bx bx-x'></i></button>
            </div>
            <div className="modal-body">
              <ul style={{ paddingLeft: '20px', lineHeight: 1.6 }}>
                {paketDetails[activeInfoPaket].items.map((item, idx) => <li key={idx}>{item}</li>)}
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
                      <input type="number" className="qty-input" value={addons[a.id]} readOnly style={{width:'40px', textAlign:'center', border:'none', outline:'none', background:'transparent'}}/>
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
