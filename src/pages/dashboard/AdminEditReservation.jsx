import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSettings } from '../../context/SettingsContext';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import SkeletonForm from '../../components/SkeletonForm';


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

export default function AdminEditReservation() {
  const { settings } = useSettings();
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [formData, setFormData] = useState({
    nama: '', wa: '', email: '',
    jml_dewasa: 2, jml_anak: 0, jml_motor: '', jml_mobil: '',
    checkin: today.toISOString().split('T')[0],
    checkout: tomorrow.toISOString().split('T')[0],
    jam_kedatangan: '', area_camp: '',
    paymentType: 'Full', dpAmount: '', discount: ''
  });

  const [packageDefs, setPackageDefs] = useState([]);
  const [addonDefs, setAddonDefs] = useState([]);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(true);
  const [isInitializing, setIsInitializing] = useState(true);
  const { id } = useParams();
  const [status, setStatus] = useState('Confirmed');
  const navigate = useNavigate();

  const [packages, setPackages] = useState({});
  const [addons, setAddons] = useState({});
  const [bookedCapacity, setBookedCapacity] = useState({});


  useEffect(() => {
    if (!id) return;
    
    // Fetch catalogs first
    fetch('/api/catalogs')
      .then(res => res.json())
      .then(catData => {
        const cat = catData.data || [];
        const pDefs = cat.filter(c => c.category === 'package').map(c => ({
          id: c.key_id, name: c.name, price: c.price, htm: c.htm, capacity: c.capacity, description: c.description,
          isRecommended: c.key_id.startsWith('lengkap_'), isBestseller: c.key_id.startsWith('konten_')
        }));

        const desiredAddonOrder = [
          'paket_grill', 'gas', 'kompor_portable', 'nesting', 'kayu_bakar', 'sleeping_bag',
          'matras_90', 'matras_180', 'lampu_tenda', 'lampu_tumblr', 'kursi_lipat',
          'meja_lipat_besi', 'kabel_roll', 'kasur', 'tiang_besi', 'tripod',
          'extra_sosis', 'extra_daging', 'extra_ayam'
        ];
        const aDefs = cat.filter(c => c.category === 'addon').map(c => ({
          id: c.key_id, name: c.name, price: c.price, type: c.billing_type
        })).sort((a, b) => {
          let ia = desiredAddonOrder.indexOf(a.id); let ib = desiredAddonOrder.indexOf(b.id);
          if (ia === -1) ia = 999; if (ib === -1) ib = 999;
          return ia - ib;
        });
        
        setPackageDefs(pDefs);
        setAddonDefs(aDefs);

        // Then fetch reservation
        fetch(`/api/hq-rockshill/reservations/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
        })
          .then(res => {
             if (!res.ok) throw new Error('Failed to fetch reservation');
             return res.json();
          })
          .then(res => {
            if (res.data) {
              const r = res.data;
              let checkinDateStr = '';
              let checkoutDateStr = '';
              try {
                  checkinDateStr = r.CheckIn ? new Date(r.CheckIn).toISOString().split('T')[0] : '';
                  checkoutDateStr = r.CheckOut ? new Date(r.CheckOut).toISOString().split('T')[0] : '';
              } catch(e) { console.error('Date parse error', e); }

              const items_json = r.ItemsJSON || {};

              setFormData({
                nama: r.CustomerName || '', wa: r.CustomerWA || '', email: r.CustomerEmail || '',
                checkin: checkinDateStr, checkout: checkoutDateStr,
                area_camp: items_json ? items_json.area : '',
                jam_kedatangan: items_json ? items_json.jam : '',
                jml_dewasa: r.PaxAdult || 0, jml_anak: r.PaxChild || 0,
                jml_motor: items_json ? items_json.motor : '',
                jml_mobil: items_json ? items_json.mobil : '',
                paymentType: (r.PaidAmount > 0 && r.PaidAmount < r.TotalAmount) ? 'DP' : 'Full',
                dpAmount: (r.PaidAmount || ''),
                discount: (items_json && items_json.discount) ? items_json.discount : ''
              });

              let initialPackages = pDefs.reduce((acc, curr) => ({ ...acc, [curr.id]: 0 }), {});
              initialPackages['tenda_sendiri'] = 0;
              let initialAddons = aDefs.reduce((acc, curr) => ({ ...acc, [curr.id]: 0 }), {});

              if (r.Items) {
                 r.Items.forEach(it => {
                   if (initialPackages[it.item_id] !== undefined) {
                     initialPackages[it.item_id] = it.quantity;
                   } else if (initialAddons[it.item_id] !== undefined) {
                     initialAddons[it.item_id] = it.quantity;
                   } else if (it.item_id === 'tenda_sendiri') {
                     initialPackages['tenda_sendiri'] = it.quantity;
                   }
                 });
              }
              setPackages(initialPackages);
              setAddons(initialAddons);
              setStatus(r.Status || 'Confirmed');
            }
            setIsInitializing(false);
            setIsLoadingCatalog(false);
          })
          .catch(err => {
             console.error('Failed to parse reservation data', err);
             setIsInitializing(false);
             setIsLoadingCatalog(false);
          });
      })
      .catch(err => {
        console.error('Failed to load data', err);
        setIsInitializing(false);
        setIsLoadingCatalog(false);
      });
  }, [id]);

  // Removed early return to prevent hook rule violations

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

  // useEffect catalog is merged into initialization

  const [flysheetRemoved, setFlysheetRemoved] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // 'info', 'alat', null
  const [activeInfoPaket, setActiveInfoPaket] = useState(null);
  const [turnstileToken, setTurnstileToken] = useState('dummy_token'); // Mock turnstile for React
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [showCopyToast, setShowCopyToast] = useState(false);

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

    
    const disc = parseInt(formData.discount) || 0;
    if (disc > 0) {
      total -= disc;
      htmlLines.push({ label: 'Diskon Khusus', val: -disc, removable: false });
    }

    return { htmlLines, total };
  }, [formData.jml_dewasa, formData.discount, packages, addons, nights, flysheetRemoved, packageDefs, addonDefs]);

  const areaCapacityValid = useMemo(() => {
    if (!formData.area_camp) return true;
    const max = MAX_AREA_CAPACITY[formData.area_camp] || 0;
    const booked = bookedCapacity[formData.area_camp] || 0;
    
    let currentTenda = 0;
    Object.keys(packages).forEach(id => {
      if (packages[id] > 0) {
        currentTenda += packages[id];
      }
    });

    return (booked + currentTenda) <= max;
  }, [formData.area_camp, bookedCapacity, packages]);

  const hasAnyOrder = summary.total > 0 || packages.tenda_sendiri > 0;
  const isSubmitDisabled = !capacityInfo.isValid || !areaCapacityValid || !hasAnyOrder || !turnstileToken || isSubmitting;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!capacityInfo.isValid || !areaCapacityValid) return;

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

    const selectedPackages = packageDefs.filter(p => packages[p.id] > 0).map(p => p.name);
    const packageName = selectedPackages.length > 0 ? selectedPackages.join(', ') : 'Sesuai Detail';

    let totalTents = 0;
    Object.keys(packages).forEach(id => {
      totalTents += packages[id];
    });

    const items = [];
    packageDefs.forEach(p => {
      const qty = packages[p.id];
      if (qty > 0) {
        items.push({ id: p.id, name: p.name, type: 'package', quantity: qty, price: p.price, subtotal: p.price * nights * qty });
      }
    });
    addonDefs.forEach(a => {
      const qty = addons[a.id];
      if (qty > 0) {
        let t = a.price * qty;
        if (a.type !== 'flat') t *= nights;
        items.push({ id: a.id, name: a.name, type: 'addon', quantity: qty, price: a.price, subtotal: t });
      }
    });
    if (packages['tenda_sendiri'] > 0) {
        items.push({ id: 'tenda_sendiri', name: 'Bawa Tenda Sendiri', type: 'package', quantity: packages['tenda_sendiri'], price: 0, subtotal: 0 });
    }

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
      packageName: packageName,
      total: formatRupiah(summary.total),
      totalTents: totalTents,
      status: 'Confirmed',
      dpAmount: parseInt(formData.dpAmount) || 0,
      discount: parseInt(formData.discount) || 0,
      items: items
    };

    fetch(`/api/hq-rockshill/reservations/${id}/edit`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(data => {
        setIsSubmitting(false);
        if (data.booking_code) {
          const invoiceId = data.invoice_id; // will be null/undefined
          const bookingCode = data.booking_code;

          Swal.fire({
            title: 'Berhasil!',
            text: `Reservasi berhasil diupdate. Kode Booking: ${bookingCode}`,
            icon: 'success',
            confirmButtonText: 'OK'
          }).then(() => {
            navigate('/hq-rockshill/confirmed');
          });
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

  if (isInitializing) {
    return (
      <div style={{ marginTop: '30px' }}>
        <SkeletonForm />
      </div>
    );
  }

  if (successData) {
    return (
      <main className="page-transition" style={{padding: '50px 20px', textAlign: 'center'}}>
         <h2>Reservasi Manual Berhasil Dibuat!</h2>
         <p>Kode Booking: <strong>{successData.booking_code}</strong></p>
         <button className="btn btn-primary" onClick={() => window.location.href = '/hq-rockshill/confirmed'}>Lihat Daftar Reservasi</button>
      </main>
    );
  }
return (
    <main className="page-transition">
      <div className="container" style={{ marginTop: '30px' }}>
        {isLoadingCatalog ? (
          <SkeletonForm />
        ) : (
        <div className="form-container">

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

            <h2 className="section-title">Payment</h2>
            <div className="form-group">
              <label>Diskon Khusus (Rp) - Opsional</label>
              <input type="number" name="discount" value={formData.discount} onChange={handleChange} className="form-control" placeholder="Contoh: 50000" />
            </div>
            
            <div className="form-group" style={{marginTop: '15px', marginBottom: '20px'}}>
              <label>Tipe Pembayaran</label>
              <div style={{display: 'flex', gap: '20px', marginTop: '10px'}}>
                <label><input type="radio" name="paymentType" value="Full" checked={formData.paymentType === 'Full'} onChange={handleChange} /> Lunas (Full)</label>
                <label><input type="radio" name="paymentType" value="DP" checked={formData.paymentType === 'DP'} onChange={handleChange} /> DP</label>
              </div>
            </div>

            {formData.paymentType === 'DP' && (
              <div className="form-group" style={{marginTop: '15px', padding: '15px', background: '#f5f5f5', borderRadius: '8px', marginBottom: '20px'}}>
                <label>Nominal DP (Rp)</label>
                <input type="number" name="dpAmount" value={formData.dpAmount} onChange={handleChange} className="form-control" required={formData.paymentType === 'DP'} placeholder="Masukkan nominal DP" />
                <p style={{marginTop: '10px', fontWeight: 'bold'}}>
                  Sisa yang harus dibayar: {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(Math.max(0, summary.total - (parseInt(formData.dpAmount) || 0)))}
                </p>
              </div>
            )}

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
                <small style={{ color: '#666', fontSize: '0.8rem' }}>Check in 14.00-00.00</small>
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
                  {Object.keys(MAX_AREA_CAPACITY).map(area => (
                    <option key={area} value={area}>{area} (Sisa Tenda: {Math.max(0, MAX_AREA_CAPACITY[area] - (bookedCapacity[area] || 0))})</option>
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

            {/* Summary */}
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
                            Swal.fire({
                              title: 'Hapus Item?',
                              text: `Anda yakin ingin menghapus ${line.label}?`,
                              icon: 'warning',
                              showCancelButton: true,
                              confirmButtonColor: '#d33',
                              cancelButtonColor: '#aaa',
                              confirmButtonText: 'Ya, hapus!',
                              cancelButtonText: 'Batal'
                            }).then((result) => {
                              if (result.isConfirmed) {
                                if (line.type === 'package') {
                                  handlePackageChange(line.id, -packages[line.id]);
                                } else if (line.type === 'addon') {
                                  handleAddonChange(line.id, -addons[line.id]);
                                }
                              }
                            });
                          }}
                          style={{ background: 'none', border: 'none', color: 'red', cursor: 'pointer', marginLeft: '5px' }}
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
              <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '5px' }}>*Estimasi ini belum termasuk penyesuaian khusus jika ada.</p>
            </div>

            <div style={{ marginTop: '30px', display: 'flex', gap: '15px' }}>
              <button type="button" className="btn btn-sec" style={{ flex: 1, padding: '15px', fontSize: '1.1rem' }} onClick={() => navigate('/hq-rockshill/confirmed')} disabled={isSubmitting}>
                Cancel
              </button>
              <button type="submit" className="btn btn-pri" style={{ flex: 1, padding: '15px', fontSize: '1.1rem' }} disabled={isSubmitDisabled}>
                {isSubmitting ? 'Menyimpan...' : 'Submit'}
              </button>
            </div>
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
