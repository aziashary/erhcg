document.addEventListener('DOMContentLoaded', () => {
  const searchForm = document.getElementById('search-form');
  const searchInput = document.getElementById('search-input');
  const resultContainer = document.getElementById('result-container');
  const notFound = document.getElementById('not-found');

  // URL Param support: auto search if ?id=INV-ROCK-1234
  const urlParams = new URLSearchParams(window.location.search);
  const idParam = urlParams.get('id');
  if (idParam) {
    searchInput.value = idParam;
    performSearch(idParam);
  }

  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = searchInput.value.trim().toUpperCase();
    if (!query) return;
    performSearch(query);
  });

  function performSearch(query) {
    resultContainer.style.display = 'none';
    notFound.style.display = 'none';
    
    // Call API
    fetch(`http://localhost:8000/api/reservations/${query}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Not found');
        }
        return response.json();
      })
      .then(data => {
        if (data.success) {
          showResult(data.data);
        } else {
          showError();
        }
      })
      .catch(err => {
        console.error('Error fetching reservation:', err);
        showError();
      });
  }

  function showError() {
    resultContainer.style.display = 'none';
    notFound.style.display = 'block';
  }

  function formatTanggalIndo(dateStr) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    const hari = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const bulan = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    
    const d = date.getDate().toString().padStart(2, '0');
    const m = bulan[date.getMonth()];
    const y = date.getFullYear().toString().slice(-2);
    const h = hari[date.getDay()];
    
    return `${h}, ${d}-${m}-${y}`;
  }

  function showResult(res) {
    notFound.style.display = 'none';
    resultContainer.style.display = 'block';

    document.getElementById('res-id').textContent = res.id;
    document.getElementById('res-status').textContent = res.status || 'Menunggu Konfirmasi';
    document.getElementById('res-name').textContent = res.nama;
    
    let contact = `WA: ${res.wa}`;
    if (res.email) contact += ` | Email: ${res.email}`;
    document.getElementById('res-contact').textContent = contact;

    const checkinFormatted = formatTanggalIndo(res.checkin);
    const checkoutFormatted = formatTanggalIndo(res.checkout);

    document.getElementById('res-dates').innerHTML = `${checkinFormatted} s.d<br>${checkoutFormatted}`;
    document.getElementById('res-nights').textContent = `${res.nights} Malam`;
    
    document.getElementById('res-area').textContent = res.area ? res.area : '-';
    document.getElementById('res-jam').textContent = res.jamKedatangan ? res.jamKedatangan : '-';
    
    let pax = `${res.dewasa} Dewasa`;
    if (res.anak && parseInt(res.anak) > 0) pax += `, ${res.anak} Anak`;
    document.getElementById('res-pax').textContent = pax;

    const createdDate = res.dateCreated ? new Date(res.dateCreated) : new Date();
    document.getElementById('res-created').textContent = createdDate.toLocaleString('id-ID', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    function renderTextAsFlex(text, containerId) {
      const container = document.getElementById(containerId);
      if (!text || text.trim() === '-' || text.includes('Tidak ada')) {
        container.innerHTML = text || '-';
        return;
      }
      
      const lines = text.split('\n');
      let html = '';
      for(let i=0; i<lines.length; i++) {
        let line = lines[i];
        if (line.startsWith('- ')) {
           const match = line.match(/^- (.+?)\s+(\d+x)$/);
           if (match) {
             html += `<div style="display:flex; justify-content:space-between; margin-bottom: 2px;">
                        <span>- ${match[1].trim()}</span>
                        <span>${match[2]}</span>
                      </div>`;
           } else {
             html += `<div>${line}</div>`;
           }
        } else if (line.trim().length > 0) {
           html += `<div style="color:#666; margin-bottom: 8px; margin-left: 12px;">${line.trim()}</div>`;
        }
      }
      container.innerHTML = html;
    }

    renderTextAsFlex(res.paketText, 'res-paket');
    renderTextAsFlex(res.addonsText, 'res-addons');

    document.getElementById('res-total').textContent = res.total;

    // WA Link
    const message = `Halo Admin, saya ingin konfirmasi pembayaran untuk reservasi dengan Nomor Invoice: *${res.id}*`;
    document.getElementById('btn-wa-confirm').href = `https://wa.me/6281234567890?text=${encodeURIComponent(message)}`;
  }
});
