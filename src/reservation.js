document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('reservation-form');
  const checkinInput = document.getElementById('checkin');
  const checkoutInput = document.getElementById('checkout');
  const jmlDewasaInput = document.getElementById('jml_dewasa');
  const jmlAnakInput = document.getElementById('jml_anak');
  const nightCountText = document.getElementById('night-count');
  const summaryContent = document.getElementById('summary-content');
  const totalPriceEl = document.getElementById('total-price');
  const capacityAlert = document.getElementById('capacity-alert');
  const submitBtn = document.getElementById('submit-btn');

  const paketInputs = document.querySelectorAll('.paket-qty');
  const addonInputs = document.querySelectorAll('.addon-qty');
  const tendaSendiriInput = document.querySelector('.tenda-sendiri');

  const modal = document.getElementById('alat-modal');
  const btnOpenModal = document.getElementById('btn-open-modal');
  const btnCloseModal = document.getElementById('btn-close-modal');
  const btnSaveModal = document.getElementById('btn-save-modal');

  btnOpenModal.addEventListener('click', () => modal.classList.add('active'));
  btnCloseModal.addEventListener('click', () => modal.classList.remove('active'));
  btnSaveModal.addEventListener('click', () => modal.classList.remove('active'));

  const infoModal = document.getElementById('info-modal');
  const btnCloseInfo = document.getElementById('btn-close-info');
  const btnCloseInfoBottom = document.getElementById('btn-close-info-bottom');
  const infoModalTitle = document.getElementById('info-modal-title');
  const infoModalList = document.getElementById('info-modal-list');

  const paketDetails = {
    'lengkap_4p': { title: 'Paket Lengkap 4P', items: ['Tenda 4P, 4 SB, 4 Matras 90x180', 'Lampu tenda & Tumblr', '4 Kursi & 1 Meja, Kabel Roll', 'Paket Grill & Alat Masak', 'Termasuk HTM 4 Orang & Flysheet'] },
    'lengkap_2p': { title: 'Paket Lengkap 2P', items: ['Tenda 2P, 2 SB, 2 Matras 90x180', 'Lampu tenda & Tumblr', '2 Kursi & 1 Meja, Kabel Roll', 'Paket Grill & Alat Masak', 'Termasuk HTM 2 Orang & Flysheet'] },
    'konten_4p': { title: 'Paket Konten 4P', items: ['Tenda 4P, 4 SB, 4 Matras 90x180', 'Lampu tenda & Tumblr', '4 Kursi & 1 Meja', 'Kabel Roll & Tripod', '*Belum termasuk HTM & flysheet'] },
    'konten_2p': { title: 'Paket Konten 2P', items: ['Tenda 2P, 2 SB, 2 Matras 90x180', 'Lampu tenda & Tumblr', '2 Kursi & 1 Meja', 'Kabel Roll & Tripod', '*Belum termasuk HTM & flysheet'] },
    'fullset_4p': { title: 'Paket Fullset 4P', items: ['Tenda 4P, 4 SB, 4 Matras 90x180', 'Lampu tenda & Kabel Roll', '*Belum termasuk HTM & flysheet'] },
    'fullset_2p': { title: 'Paket Fullset 2P', items: ['Tenda 2P, 2 SB, 2 Matras 90x180', 'Lampu tenda & Kabel Roll', '*Belum termasuk HTM & flysheet'] }
  };

  document.querySelectorAll('.btn-info').forEach(btn => {
    btn.addEventListener('click', () => {
      const p = btn.dataset.paket;
      if (paketDetails[p]) {
        infoModalTitle.textContent = paketDetails[p].title;
        infoModalList.innerHTML = paketDetails[p].items.map(i => `<li>${i}</li>`).join('');
        infoModal.classList.add('active');
      }
    });
  });

  btnCloseInfo.addEventListener('click', () => infoModal.classList.remove('active'));
  btnCloseInfoBottom.addEventListener('click', () => infoModal.classList.remove('active'));

  let flysheetRemoved = false;
  
  // Custom button logic for -/+
  document.querySelectorAll('.qty-container').forEach(container => {
    const btnMinus = container.querySelector('.minus');
    const btnPlus = container.querySelector('.plus');
    const input = container.querySelector('.qty-input');
    
    btnMinus.addEventListener('click', () => {
      let val = parseInt(input.value) || 0;
      if (val > 0) {
        input.value = val - 1;
        input.dispatchEvent(new Event('change'));
      }
    });
    
    btnPlus.addEventListener('click', () => {
      let val = parseInt(input.value) || 0;
      input.value = val + 1;
      input.dispatchEvent(new Event('change'));
    });
  });

  paketInputs.forEach(input => {
    input.addEventListener('change', () => {
      flysheetRemoved = false;
    });
  });

  summaryContent.addEventListener('click', (e) => {
    if (e.target.closest('.btn-remove-flysheet')) {
      const confirm1 = confirm("Yakin ingin menghapus Flysheet?\n\nFlysheet sangat penting untuk menahan embun malam dan hujan agar tenda tidak basah/rembes.");
      if (confirm1) {
        const confirm2 = confirm("Apakah Anda benar-benar yakin?\n\nKenyamanan camping Anda mungkin akan terganggu tanpa Flysheet.");
        if (confirm2) {
          flysheetRemoved = true;
          updateSummary();
        }
      }
    }
  });

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  checkinInput.valueAsDate = today;
  checkinInput.min = today.toISOString().split('T')[0];
  checkoutInput.valueAsDate = tomorrow;
  checkoutInput.min = tomorrow.toISOString().split('T')[0];

  function formatRupiah(angka) {
    return 'Rp ' + angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  function calculateNights() {
    const ci = new Date(checkinInput.value);
    const co = new Date(checkoutInput.value);
    if (co <= ci) {
      co.setDate(ci.getDate() + 1);
      checkoutInput.valueAsDate = co;
    }
    const diffTime = Math.abs(co - ci);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    nightCountText.textContent = `Durasi: ${diffDays} Malam`;
    return diffDays;
  }

  function checkCapacity() {
    const dewasa = parseInt(jmlDewasaInput.value) || 0;
    const anak = parseInt(jmlAnakInput.value) || 0;
    const totalPeople = dewasa + anak;
    
    let totalMaxCapacity = 0;
    let hasPackages = false;
    let hasTendaSendiri = (parseInt(tendaSendiriInput.value) || 0) > 0;

    paketInputs.forEach(input => {
      const qty = parseInt(input.value) || 0;
      if (qty > 0 && input.dataset.val !== 'tenda_sendiri') {
        hasPackages = true;
        const capacity = parseInt(input.dataset.capacity);
        totalMaxCapacity += (qty * (capacity + 1));
      }
    });

    if (hasTendaSendiri) {
      capacityAlert.style.display = 'none';
      return true; 
    }

    if (hasPackages) {
      if (totalPeople > totalMaxCapacity) {
        capacityAlert.style.display = 'block';
        return false;
      }
    }
    
    capacityAlert.style.display = 'none';
    return true;
  }

  function updateSummary() {
    let html = '';
    let total = 0;
    
    const nights = calculateNights();
    const dewasa = parseInt(jmlDewasaInput.value) || 0;
    const isCapacityValid = checkCapacity();

    document.querySelectorAll('.radio-card').forEach(card => {
      const qty = parseInt(card.querySelector('.qty-input').value) || 0;
      if (qty > 0) card.classList.add('selected');
      else card.classList.remove('selected');
    });

    let totalHtmIncluded = 0;
    let totalHtmDiscountCapacity = 0;
    let hasKontenOrFullset = false;
    let sumKontenFullset = 0;

    paketInputs.forEach(input => {
      const qty = parseInt(input.value) || 0;
      if (qty > 0) {
        const price = parseInt(input.dataset.price);
        const name = input.dataset.name;
        
        if (input.dataset.val === 'konten_4p' || input.dataset.val === 'fullset_4p' || input.dataset.val === 'konten_2p' || input.dataset.val === 'fullset_2p') {
          hasKontenOrFullset = true;
          sumKontenFullset += qty;
        }

        if (input.dataset.htm === 'included') {
          totalHtmIncluded += (qty * parseInt(input.dataset.htmPax || 0));
        } else if (input.dataset.htm === 'not_included') {
          totalHtmDiscountCapacity += (qty * parseInt(input.dataset.capacity || 0));
        }

        if (price > 0) {
          const totalItem = price * nights * qty;
          total += totalItem;
          html += `<div class="summary-row"><span>${qty}x ${name} (${nights} mlm)</span><span>${formatRupiah(totalItem)}</span></div>`;
        } else if (input.dataset.val === 'tenda_sendiri') {
          html += `<div class="summary-row"><span>${qty}x ${name}</span><span>-</span></div>`;
        }
      }
    });

    const remainingPeople = Math.max(0, dewasa - totalHtmIncluded);
    const peopleAt35k = Math.min(remainingPeople, totalHtmDiscountCapacity);
    const peopleAt45k = remainingPeople - peopleAt35k;

    if (peopleAt35k > 0) {
      const htm35 = 35000;
      const total35 = peopleAt35k * htm35;
      total += total35;
      html += `<div class="summary-row"><span>HTM Tenda Sewa (${peopleAt35k} org x ${formatRupiah(htm35)})</span><span>${formatRupiah(total35)}</span></div>`;
    }

    if (peopleAt45k > 0) {
      const htm45 = 45000;
      const total45 = peopleAt45k * htm45;
      total += total45;
      html += `<div class="summary-row"><span>HTM Tenda Sendiri (${peopleAt45k} org x ${formatRupiah(htm45)})</span><span>${formatRupiah(total45)}</span></div>`;
    }

    if (hasKontenOrFullset && !flysheetRemoved) {
      const flysheetPrice = 35000;
      // Calculate flysheet based on total number of packages
      let sumTentsNeedFlysheet = 0;
      paketInputs.forEach(input => {
        const val = input.dataset.val;
        if (val === 'konten_4p' || val === 'fullset_4p' || val === 'konten_2p' || val === 'fullset_2p') sumTentsNeedFlysheet += (parseInt(input.value)||0);
      });
      const totalFlysheet = flysheetPrice * nights * sumTentsNeedFlysheet;
      total += totalFlysheet;
      html += `<div class="summary-row"><span>${sumTentsNeedFlysheet}x Flysheet (${nights} mlm) <button type="button" class="btn-remove-flysheet" title="Hapus Flysheet"><i class='bx bx-trash'></i></button></span><span>${formatRupiah(totalFlysheet)}</span></div>`;
    }

    addonInputs.forEach(input => {
      const qty = parseInt(input.value) || 0;
      if (qty > 0) {
        const price = parseInt(input.dataset.price);
        const type = input.dataset.type;
        const name = input.dataset.name;
        
        let itemTotal = price * qty;
        let suffix = '';
        if (type !== 'flat') {
          itemTotal = itemTotal * nights;
          suffix = ` (${nights} mlm)`;
        }
        
        total += itemTotal;
        html += `<div class="summary-row"><span>${qty}x ${name}${suffix}</span><span>${formatRupiah(itemTotal)}</span></div>`;
      }
    });

    if(html === '') html = '<div class="summary-row"><span>Belum ada pesanan</span></div>';

    summaryContent.innerHTML = html;
    totalPriceEl.textContent = formatRupiah(total);

    const hasAnyOrder = total > 0 || (parseInt(tendaSendiriInput.value)||0) > 0;
    if (!isCapacityValid || !hasAnyOrder) {
      submitBtn.disabled = true;
    } else {
      if (document.getElementById('turnstile-token').value) {
        submitBtn.disabled = false;
      } else {
        submitBtn.disabled = true;
      }
    }
  }

  const inputs = [checkinInput, checkoutInput, jmlDewasaInput, jmlAnakInput, ...paketInputs, ...addonInputs];
  inputs.forEach(input => {
    input.addEventListener('change', updateSummary);
    input.addEventListener('input', updateSummary);
  });

  window.onTurnstileSuccess = function(token) {
    document.getElementById('turnstile-token').value = token;
    updateSummary();
  }

  updateSummary();

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!checkCapacity()) return;

    const nama = document.getElementById('nama').value;
    const wa = document.getElementById('wa').value;
    const dewasa = document.getElementById('jml_dewasa').value;
    const anak = document.getElementById('jml_anak').value;
    const checkin = checkinInput.value;
    const checkout = checkoutInput.value;
    const nights = calculateNights();
    
    let paketText = '';
    let hasKontenOrFullset = false;
    let sumKontenFullset = 0;

    paketInputs.forEach(input => {
      const qty = parseInt(input.value) || 0;
      if (qty > 0) {
        paketText += `- ${qty}x ${input.dataset.name}\n`;
        const val = input.dataset.val;
        if (val === 'konten_4p' || val === 'fullset_4p' || val === 'konten_2p' || val === 'fullset_2p') {
          hasKontenOrFullset = true;
          sumKontenFullset += qty;
        }
      }
    });

    if(paketText === '') paketText = '- Tidak ada paket tenda\n';

    let addonsText = '';
    if (hasKontenOrFullset && !flysheetRemoved) {
      addonsText += `- ${sumKontenFullset}x Flysheet\n`;
    }

    addonInputs.forEach(input => {
      const qty = parseInt(input.value) || 0;
      if (qty > 0) {
        addonsText += `- ${qty}x ${input.dataset.name}\n`;
      }
    });

    if(addonsText === '') addonsText = '- Tidak ada\n';

    const total = totalPriceEl.textContent;

    let message = `Halo Admin Rockshill Campground! Saya ingin melakukan reservasi dengan detail berikut:\n\n`;
    message += `*Data Pemesan*\n`;
    message += `Nama: ${nama}\n`;
    message += `WhatsApp: ${wa}\n`;
    if (document.getElementById('email').value) {
      message += `Email: ${document.getElementById('email').value}\n`;
    }
    message += `Peserta: ${dewasa} Dewasa, ${anak} Anak\n\n`;
    message += `*Jadwal*\n`;
    message += `Check-in: ${checkin}\n`;
    message += `Check-out: ${checkout} (${nights} Malam)\n\n`;
    message += `*Pilihan Paket*\n`;
    message += `${paketText}\n`;
    message += `*Alat Tambahan*\n`;
    message += `${addonsText}\n`;
    message += `*Estimasi Total: ${total}*\n\n`;
    message += `Apakah tanggal tersebut tersedia? Terima kasih!`;

    const email = document.getElementById('email').value;

    // Build Payload for API
    const payload = {
      nama: nama,
      wa: wa,
      email: email,
      dewasa: parseInt(dewasa),
      anak: parseInt(anak) || 0,
      checkin: checkin,
      checkout: checkout,
      nights: nights,
      paketText: paketText.trim(),
      addonsText: addonsText.trim(),
      total: total
    };

    // Disable button to prevent double submit
    const submitBtn = document.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.innerHTML = 'Memproses...';
    submitBtn.disabled = true;

    fetch('http://localhost:8000/api/reservations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    })
    .then(response => response.json())
    .then(data => {
      submitBtn.innerHTML = originalBtnText;
      submitBtn.disabled = false;

      if (data.success) {
        const invoiceId = data.data.id;
        
        message = `Halo Admin Rockshill Campground! Saya ingin melakukan reservasi dengan detail berikut:\n\n*Invoice:* ${invoiceId}\n\n` + message.replace(`Halo Admin Rockshill Campground! Saya ingin melakukan reservasi dengan detail berikut:\n\n`, '');

        // Show alert
        alert(`Reservasi berhasil dibuat!\n\nNomor Invoice Anda: ${invoiceId}\n\nMohon simpan nomor invoice ini untuk mengecek status. Anda akan diarahkan ke WhatsApp untuk konfirmasi admin.`);

        const encodedMessage = encodeURIComponent(message);
        const waNumber = '6281234567890'; 
        window.location.href = `https://wa.me/${waNumber}?text=${encodedMessage}`;
      } else {
        alert('Gagal membuat reservasi: ' + (data.message || 'Error server'));
      }
    })
    .catch(error => {
      submitBtn.innerHTML = originalBtnText;
      submitBtn.disabled = false;
      console.error('Error:', error);
      alert('Terjadi kesalahan koneksi saat mengirim data reservasi.');
    });
  });
});
