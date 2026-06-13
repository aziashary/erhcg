import { useState, useEffect, useMemo } from 'react';
import { useSettings } from '../context/SettingsContext';
import { Link, useLocation } from 'react-router-dom';
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

export default function Reservation() {
  const { settings } = useSettings();
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const location = useLocation();
  const lockedData = useMemo(() => {
    try {
      const dataStr = new URLSearchParams(location.search).get('data');
      if (dataStr) {
        return JSON.parse(atob(dataStr));
      }
    } catch (e) {
      console.error('Failed to parse URL data', e);
    }
    return { p: {}, h: 0 };
  }, [location.search]);

  const [formData, setFormData] = useState({
    nama: '', wa: '', email: '',
    jml_dewasa: 2, jml_anak: 0, jml_motor: '', jml_mobil: '',
    checkin: today.toISOString().split('T')[0],
    checkout: tomorrow.toISOString().split('T')[0],
    jam_kedatangan: '', area_camp: ''
  });

  const [packages, setPackages] = useState({});
  const [addons, setAddons] = useState({});

  const [packageDefs, setPackageDefs] = useState([]);
  const [addonDefs, setAddonDefs] = useState([]);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(true);

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
          if(ia === -1) ia = 999;
          if(ib === -1) ib = 999;
          return ia - ib;
        });
        setPackageDefs(pDefs);
        setAddonDefs(aDefs);
        
        let initialPackages = pDefs.reduce((acc, curr) => ({ ...acc, [curr.id]: 0 }), {});
        let initialAddons = aDefs.reduce((acc, curr) => ({ ...acc, [curr.id]: 0 }), {});
        
        const dataStr = new URLSearchParams(location.search).get('data');
        if (dataStr) {
          try {
            const decoded = JSON.parse(atob(dataStr));
            if (decoded.p) { Object.keys(decoded.p).forEach(k => initialPackages[k] = decoded.p[k]); }
            if (decoded.a) { Object.keys(decoded.a).forEach(k => initialAddons[k] = decoded.a[k]); }
            if (decoded) {
              setFormData(prev => ({
                ...prev, 
                checkin: decoded.ci || prev.checkin, 
                checkout: decoded.co || prev.checkout, 
                area_camp: decoded.ar || '',
                jml_dewasa: decoded.h || prev.jml_dewasa
              }));
            }
          } catch(e) { console.error("Invalid payload"); }
        }

        setPackages(initialPackages);
        setAddons(initialAddons);
        setIsLoadingCatalog(false);
      })
      .catch(err => {
        console.error(err);
        setIsLoadingCatalog(false);
      });
  }, [location.search]);

  const [flysheetRemoved, setFlysheetRemoved] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // 'info', 'alat', null
  const [activeInfoPaket, setActiveInfoPaket] = useState(null);
  const [turnstileToken, setTurnstileToken] = useState('dummy_token'); // Mock turnstile for React
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [showCopyToast, setShowCopyToast] = useState(false);
  const [bookedCapacity, setBookedCapacity] = useState({});

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
    setFlysheetRemoved(false);
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

  // Fetch Capacity
  useEffect(() => {
    if (formData.checkin && formData.checkout) {
      fetch(`/api/reservations/capacity?start=${formData.checkin}&end=${formData.checkout}`)
        .then(res => res.json())
        .then(data => {
          if (data.data) {
            setBookedCapacity(data.data);
          }
        })
        .catch(err => console.error('Failed to fetch capacity:', err));
    }
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
  }, [formData.area_camp, isWeekend, packages, packageDefs]);

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
        const pDef = packageDefs.find(p => p.id === id);
        if (pDef) totalMaxCapacity += (qty * (pDef.capacity + 1));
      }
    });

    if (hasTendaSendiri) return { isValid: true };
    if (hasPackages && totalPeople > totalMaxCapacity) return { isValid: false, reason: 'people', totalPeople, totalMaxCapacity };
    return { isValid: true };
  }, [formData.jml_dewasa, formData.jml_anak, packages, packageDefs]);

  // Tent Capacity Check
  const totalTents = useMemo(() => {
    return Object.values(packages).reduce((sum, qty) => sum + qty, 0);
  }, [packages]);

  const remainingTents = useMemo(() => {
    if (!formData.area_camp) return null;
    const max = MAX_AREA_CAPACITY[formData.area_camp] || 0;
    const booked = bookedCapacity[formData.area_camp] || 0;
    return Math.max(0, max - booked);
  }, [formData.area_camp, bookedCapacity]);

  const isTentCapacityValid = remainingTents === null || totalTents <= remainingTents;

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

        if (p.htm === 'included') totalHtmIncluded += (qty * (p.capacity || 0));
        else if (p.htm === 'not_included') totalHtmDiscountCapacity += (qty * ((p.capacity || 0) + 1));

        if (p.price > 0) {
          const totalItem = p.price * nights * qty;
          total += totalItem;
          htmlLines.push({ id: p.id, type: 'package', label: `${qty}x ${p.name}${nightSuffix}`, val: totalItem, removable: false });
        } else if (p.id === 'tenda_sendiri') {
          htmlLines.push({ id: p.id, type: 'package', label: `${qty}x ${p.name}`, val: 0, text: '-', removable: false });
        }
      }
    });

    const dewasa = parseInt(formData.jml_dewasa) || 0;
    const remainingPeople = Math.max(0, dewasa - totalHtmIncluded);
    let peopleAt35k = Math.min(remainingPeople, totalHtmDiscountCapacity);
    const peopleAt45k = remainingPeople - peopleAt35k;


    if (peopleAt35k > 0) {
      const t = peopleAt35k * 35000;
      total += t;
      htmlLines.push({ label: `${peopleAt35k}x HTM`, val: t });
    }

    if (peopleAt45k > 0) {
      const t = peopleAt45k * 45000;
      total += t;
      htmlLines.push({ label: `${peopleAt45k}x HTM Tenda Sendiri`, val: t });
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

  const hasAnyOrder = summary.total > 0 || packages.tenda_sendiri > 0;
  const isSubmitDisabled = !hasAnyOrder || !turnstileToken || isSubmitting;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!capacityInfo.isValid || !isTentCapacityValid) {
      const errorEl = document.getElementById('capacity-error-alert');
      if (errorEl) {
        errorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    if (formData.jam_kedatangan < '14:00' && formData.jam_kedatangan !== '00:00') {
      Swal.fire('Perhatian', 'Check in 14.00-00.00', 'warning');
      return;
    }

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
       const qty = ['konten_4p', 'fullset_4p', 'konten_2p', 'fullset_2p'].reduce((sum, id) => sum + (packages[id] || 0), 0);
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

    // Add HTM to addonsText
    let totalHtmIncluded = 0;
    let totalHtmDiscountCapacity = 0;
    packageDefs.forEach(p => {
      const qty = packages[p.id];
      if (qty > 0) {
        if (p.htm === 'included') {
          totalHtmIncluded += (qty * (p.capacity || 0));
          totalHtmDiscountCapacity += (qty * 1);
        } else if (p.htm === 'not_included') {
          totalHtmDiscountCapacity += (qty * ((p.capacity || 0) + 1));
        }
      }
    });

    const dewasa = parseInt(formData.jml_dewasa) || 0;
    const remainingPeople = Math.max(0, dewasa - totalHtmIncluded);
    const peopleAt35k = Math.min(remainingPeople, totalHtmDiscountCapacity);
    const peopleAt45k = remainingPeople - peopleAt35k;

    if (peopleAt35k > 0) {
      addonsText += `- HTM Paket 35k          ${peopleAt35k}x\n   ${formatRupiah(peopleAt35k * 35000).replace('Rp ', '')}\n`;
    }
    if (peopleAt45k > 0) {
      addonsText += `- HTM Tenda Sendiri 45k  ${peopleAt45k}x\n   ${formatRupiah(peopleAt45k * 45000).replace('Rp ', '')}\n`;
    }

    if (addonsText === '') addonsText = '- Tidak ada\n';

    let packageName = paketText.trim().split('\n')[0];
    if (!packageName) packageName = '-';

    const items = [];
    packageDefs.forEach(p => {
      const qty = packages[p.id];
      if (qty > 0) {
        items.push({
          id: p.id,
          name: p.name,
          type: 'package',
          quantity: qty,
          price: p.price,
          subtotal: p.price * qty
        });
      }
    });

    if (hasKontenOrFullset && !flysheetRemoved) {
       const qty = ['konten_4p', 'fullset_4p', 'konten_2p', 'fullset_2p'].reduce((sum, id) => sum + (packages[id] || 0), 0);
       items.push({
         id: 'flysheet',
         name: 'Flysheet',
         type: 'addon',
         quantity: qty,
         price: 35000,
         subtotal: 35000 * nights * qty
       });
    }

    addonDefs.forEach(a => {
      const qty = addons[a.id];
      if (qty > 0) {
        let t = a.price * qty;
        if (a.type !== 'flat') t *= nights;
        items.push({
          id: a.id,
          name: a.name,
          type: 'addon',
          quantity: qty,
          price: a.price,
          subtotal: t
        });
      }
    });

    const payload = {
      nama: formData.nama,
      wa: formData.wa,
      email: formData.email,
      dewasa: parseInt(formData.jml_dewasa),
      anak: parseInt(formData.jml_anak),
      motor: parseInt(formData.jml_motor) || 0,
      mobil: parseInt(formData.jml_mobil) || 0,
      checkin: formData.checkin,
      checkout: formData.checkout,
      jamKedatangan: formData.jam_kedatangan,
      nights: nights,
      area: formData.area_camp,
      paketText: paketText.trim(),
      addonsText: addonsText.trim(),
      packageName: packageName,
      total: formatRupiah(summary.total),
      totalTents: totalTents,
      items: items
    };

    fetch('/api/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(data => {
      setIsSubmitting(false);
      if (data.booking_code) {
        const invoiceId = data.invoice_id;
        const bookingCode = data.booking_code;
        
        let message = `Halo Admin Rockshill Campground! Saya ingin konfirmasi pembayaran reservasi dengan detail:\n\n*Kode Booking:* ${bookingCode}\n\n`;
        message += `*Data Pemesan*\nNama: ${formData.nama}\nWhatsApp: ${formData.wa}\n`;
        if (formData.email) message += `Email: ${formData.email}\n`;
        message += `Peserta: ${formData.jml_dewasa} Dewasa, ${formData.jml_anak} Anak\nKendaraan: ${formData.jml_motor} Motor, ${formData.jml_mobil} Mobil\n\n`;
        message += `*Jadwal & Lokasi*\nJadwal: ${formatTanggalIndo(formData.checkin)} s.d ${formatTanggalIndo(formData.checkout)} (${nights} Malam)\n`;
        message += `Jam Kedatangan: ${formData.jam_kedatangan}\nArea Camp: ${formData.area_camp}\n\n`;
        message += `*Pilihan Paket*\n${paketText}\n*Alat Tambahan*\n${addonsText}\n*Estimasi Total: ${formatRupiah(summary.total)}*\n\nTerlampir bukti transfer saya. Terima kasih!`;

        setSuccessData({
          invoiceId,
          bookingCode,
          total: summary.total,
          message: message
        });
        window.scrollTo(0,0);
      } else {
        Swal.fire('Error', 'Gagal membuat reservasi: ' + (data.error || 'Error server', 'error'));
      }
    })
    .catch(err => {
      setIsSubmitting(false);
      console.error(err);
      Swal.fire('Perhatian', 'Terjadi kesalahan koneksi saat mengirim data reservasi.', 'warning');
    });
  };

  if (successData) {
    return (
      <main className="page-transition">
        <div className="page-header">
          <div className="container">
            <h1>Reservasi Berhasil</h1>
            <p>Selesaikan pembayaran Anda dalam waktu 1 jam ke depan.</p>
          </div>
        </div>
        <div className="container section-padding">
          <div className="form-container" style={{ textAlign: 'left', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ backgroundColor: '#e2f0d9', color: '#2e5c1e', padding: '20px', borderRadius: '8px', marginBottom: '30px', border: '1px solid #c3d69b' }}>
              <h2 style={{ margin: '0 0 10px 0', fontSize: '1.5rem' }}>Kode Booking: <strong>{successData.bookingCode}</strong></h2>
              <p style={{ margin: 0, fontSize: '0.9rem' }}>Batas Waktu Pembayaran: <strong>1 Jam setelah booking</strong> (Jika lewat, booking hangus dan harus isi form ulang)</p>
            </div>

            <h3 className="section-title">Informasi Pembayaran</h3>
            <p>Silakan lakukan pembayaran melalui transfer bank ke rekening berikut:</p>
            <div className="rekening-box" style={{ marginBottom: '30px' }}>
              <div>
                <div className="bank-label">{settings.bank_name}</div>
                <div className="norek">{settings.bank_account}</div>
                <div className="an">{settings.bank_holder}</div>
              </div>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(settings.bank_account);
                  setShowCopyToast(true);
                  setTimeout(() => setShowCopyToast(false), 2000);
                }}
                className="copy-btn"
                type="button"
              >
                <i className='bx bx-copy'></i> Salin
              </button>
            </div>

            <h3 className="section-title">Pilihan Pembayaran</h3>
            <div className="form-row" style={{ marginBottom: '30px', display: 'flex', gap: '15px' }}>
              <div style={{ flex: 1, backgroundColor: '#fff3cd', border: '1px solid #ffeeba', padding: '20px', borderRadius: '8px' }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#856404', fontSize: '1.1rem' }}>Down Payment (DP 50%)</h4>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#856404', margin: 0 }}>{formatRupiah(successData.total / 2)}</p>
              </div>
              <div style={{ flex: 1, backgroundColor: '#d4edda', border: '1px solid #c3e6cb', padding: '20px', borderRadius: '8px' }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#155724', fontSize: '1.1rem' }}>Pembayaran Lunas (Full)</h4>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#155724', margin: 0 }}>{formatRupiah(successData.total)}</p>
              </div>
            </div>

            <h3 className="section-title">Syarat & Ketentuan</h3>
            <div style={{ backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '30px', fontSize: '0.9rem', lineHeight: '1.6' }}>
              <h4 style={{ margin: '0 0 10px 0', color: 'var(--color-primary-brown)' }}>Syarat Perubahan Tanggal Kedatangan/Reservasi</h4>
              <ol style={{ paddingLeft: '20px', marginBottom: '20px' }}>
                <li>Pengunjung dapat merubah tanggal kedatangan maksimal 3 hari sebelum waktu kedatangan. Lewat dari waktu tersebut tidak bisa melakukan ubah tanggal.</li>
                <li>Perubahan tanggal hanya berlaku 1x dalam jangka waktu 30 hari kedepan.</li>
                <li>Uang muka tidak bisa dikembalikan dengan alasan apapun.</li>
              </ol>

              <h4 style={{ margin: '0 0 10px 0', color: 'var(--color-primary-brown)' }}>Perhatian Saat Camping</h4>
              <ol style={{ paddingLeft: '20px', margin: 0 }}>
                <li>Setiap tamu bertanggung jawab terhadap kebersihan dan perlengkapan tenda. Jika ada perlengkapan yang hilang, rusak, atau noda yang tidak hilang maka tamu wajib melapor dan mengganti produk tersebut.</li>
                <li>Setiap tamu bertanggung jawab terhadap barang pribadi & barang berharga miliknya.</li>
                <li>Landscape kami memiliki banyak area yang curam, aktivitas anak-anak wajib diawasi oleh orang tua.</li>
                <li>Tidak diperkenankan merokok dan membawa/mengonsumsi makanan berbau menyengat di dalam tenda kami.</li>
                <li>Harap menutup pintu tenda ketika keluar maupun ketika hujan.</li>
                <li>Tidak diperkenankan membawa narkoba atau obat-obatan maupun senyawa terlarang sesuai hukum yang berlaku di Indonesia.</li>
                <li>Gunakan listrik/lampu dengan bijak untuk menghemat daya.</li>
                <li>Mohon untuk tidak membuat kegaduhan misalnya memasang volume lagu terlalu kencang yang dapat mengganggu kenyamanan campers lain.</li>
                <li>Yang terakhir, jagalah alam, jangan merugikan hewan dan pohon kita!</li>
              </ol>
            </div>

            <p style={{ textAlign: 'center', marginBottom: '15px', color: '#555' }}>Silakan transfer dan kirimkan bukti pembayaran melalui tombol di bawah ini:</p>
            <a href={`https://wa.me/${settings.whatsapp_number}?text=${encodeURIComponent(successData.message)}`} target="_blank" rel="noopener noreferrer" className="btn btn-primary bounce-anim" style={{ display: 'block', textAlign: 'center', fontSize: '1.1rem', padding: '15px', borderRadius: '30px' }}>
              Konfirmasi ke WhatsApp Admin <i className='bx bxl-whatsapp'></i>
            </a>
          </div>
        </div>
        {showCopyToast && (
          <div className="toast-notification">
            <i className='bx bx-check-circle' style={{ color: '#4caf50', fontSize: '1.2rem' }}></i> Salin di Clipboard
          </div>
        )}
      </main>
    );
  }

  return (
    <main className="page-transition">
      <div className="page-header">
        <div className="container">
          <h1>Form Reservasi</h1>
          <p>Lengkapi data di bawah ini untuk melihat estimasi biaya dan melakukan pemesanan.</p>
        </div>
      </div>

      <div className="container">
        {isLoadingCatalog ? (
          <SkeletonForm />
        ) : (
          <div className="form-container">
            <p style={{ textAlign: 'center', marginBottom: '30px', fontSize: '0.95rem', color: '#555' }}>
              Sudah reservasi? <Link to="/check-reservation" style={{ color: 'var(--color-primary-brown)', fontWeight: 600, textDecoration: 'underline' }}>Cek status/invoice Anda di sini.</Link>
            </p>

            <form onSubmit={handleSubmit}>
              <div className="summary-box">
                <h3>Ringkasan Biaya</h3>
                <div>
                  {summary.htmlLines.length === 0 && <div className="summary-row"><span>Belum ada pesanan</span></div>}
                  {summary.htmlLines.map((line, idx) => (
                    <div key={idx} className="summary-row">
                      <span>
                        {line.label}
                        {line.removable && (
                          <button 
                            type="button" 
                            onClick={() => {
                              if (line.type === 'package') {
                                handlePackageChange(line.id, -packages[line.id]);
                              } else if (line.type === 'addon') {
                                handleAddonChange(line.id, -addons[line.id]);
                              }
                            }}
                            style={{background:'none', border:'none', color:'red', cursor:'pointer', marginLeft: '5px'}} 
                            title="Hapus Item"
                          >
                            <i className='bx bx-trash'></i>
                          </button>
                        )}
                      </span>
                      <span>{line.text || formatRupiah(line.val)}</span>
                    </div>
                  ))}
                </div>
                <div className="summary-total">
                  <span>Total Estimasi:</span>
                  <span>{formatRupiah(summary.total)}</span>
                </div>
                {nights > 1 && <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '10px', marginBottom: 0 }}>*Angka di dalam kurung menunjukkan jumlah malam.</p>}
              </div>

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
                  <input type="number" name="jml_dewasa" value={formData.jml_dewasa} onChange={handleChange} className="form-control" min={(lockedData && lockedData.h > 0) ? Math.max(2, lockedData.h) : 1} required />
                </div>
                <div className="form-group">
                  <label>Jumlah Anak-anak</label>
                  <input type="number" name="jml_anak" value={formData.jml_anak} onChange={handleChange} className="form-control" min="0" />
                </div>
              </div>

              <h2 className="section-title">Jadwal Camping</h2>
              <div className="form-row">
                <div className="form-group">
                  <label>Tgl Check In *</label>
                  <input type="date" name="checkin" className="form-control" value={formData.checkin} onChange={handleChange} required min={today.toISOString().split('T')[0]} readOnly={(lockedData && !!lockedData.ci)} style={{ backgroundColor: (lockedData && !!lockedData.ci) ? '#f0f0f0' : '#fff' }}/>
                </div>
                <div className="form-group">
                  <label>Tgl Check Out *</label>
                  <input type="date" name="checkout" className="form-control" value={formData.checkout} onChange={handleChange} required min={today.toISOString().split('T')[0]} readOnly={(lockedData && !!lockedData.co)} style={{ backgroundColor: (lockedData && !!lockedData.co) ? '#f0f0f0' : '#fff' }}/>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Jam Kedatangan *</label>
                  <input type="time" name="jam_kedatangan" value={formData.jam_kedatangan} onChange={handleChange} className="form-control" required />
                  <small style={{ color: '#666', fontSize: '0.8rem' }}>Check in 14.00-00.00</small>
                </div>
                <div className="form-group">
                  <label>Area Camp *</label>
                  <select name="area_camp" className="form-control" value={formData.area_camp} onChange={handleChange} required disabled={(lockedData && !!lockedData.ar)} style={{ backgroundColor: (lockedData && !!lockedData.ar) ? '#f0f0f0' : '#fff' }}>
                    <option value="" disabled>Pilih Area</option>
                    {Object.keys(MAX_AREA_CAPACITY).map(area => (
                      <option key={area} value={area}>{area} (Sisa Tenda: {Math.max(0, MAX_AREA_CAPACITY[area] - (bookedCapacity[area] || 0))})</option>
                    ))}
                  </select>
                  {(lockedData && !!lockedData.ar) && <input type="hidden" name="area_camp" value={formData.area_camp} />}
                </div>
              </div>

              {(!capacityInfo.isValid || !isTentCapacityValid) && (
                <div id="capacity-error-alert" style={{ backgroundColor: '#f8d7da', color: '#721c24', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                  <strong><i className='bx bx-error'></i> Kapasitas Tenda/Area Tidak Cukup!</strong>
                </div>
              )}
              <h2 className="section-title">Tambahan Sewa Alat & Ekstra</h2>
              <div className="addon-list">
                {addonDefs.slice(0, 4).map(a => (
                  <div key={a.id} className="addon-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{a.name} ({formatRupiah(a.price)})</span>
                    <div className="qty-container">
                      <button type="button" className="qty-btn minus" onClick={() => handleAddonChange(a.id, -1)}>-</button>
                      <input type="number" className="qty-input" value={addons[a.id]} readOnly style={{width:'40px', textAlign:'center', border:'none'}}/>
                      <button type="button" className="qty-btn plus" onClick={() => handleAddonChange(a.id, 1)}>+</button>
                    </div>
                  </div>
                ))}
              </div>
              <button type="button" onClick={() => setActiveModal('alat')} style={{ marginTop: '15px', width: '100%', borderRadius: '8px', fontWeight: 600, padding: '12px 15px', background: 'white', border: '2px solid var(--color-primary-brown)', color: 'var(--color-primary-brown)', cursor: 'pointer' }}>
                Lihat Alat Lainnya <i className='bx bx-list-ul' style={{ verticalAlign: 'middle', fontSize: '1.2rem' }}></i>
              </button>

              <button type="submit" className="btn btn-primary submit-btn" disabled={isSubmitDisabled}>
                {isSubmitting ? 'Memproses...' : 'Kirim ke WhatsApp Admin'}
              </button>
            </form>
          </div>
        )}
      </div>

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
