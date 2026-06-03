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

  function showResult(res) {
    notFound.style.display = 'none';
    resultContainer.style.display = 'block';

    document.getElementById('res-id').textContent = res.id;
    document.getElementById('res-status').textContent = res.status || 'Menunggu Konfirmasi';
    document.getElementById('res-name').textContent = res.nama;
    
    let contact = `WA: ${res.wa}`;
    if (res.email) contact += ` | Email: ${res.email}`;
    document.getElementById('res-contact').textContent = contact;

    document.getElementById('res-dates').textContent = `${res.checkin} s.d ${res.checkout}`;
    document.getElementById('res-nights').textContent = `${res.nights} Malam`;
    
    let pax = `${res.dewasa} Dewasa`;
    if (res.anak && parseInt(res.anak) > 0) pax += `, ${res.anak} Anak`;
    document.getElementById('res-pax').textContent = pax;

    const createdDate = res.dateCreated ? new Date(res.dateCreated) : new Date();
    document.getElementById('res-created').textContent = createdDate.toLocaleString('id-ID', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    document.getElementById('res-paket').textContent = res.paketText || '-';
    document.getElementById('res-addons').textContent = res.addonsText || '-';
    document.getElementById('res-total').textContent = res.total;

    // WA Link
    const message = `Halo Admin, saya ingin konfirmasi pembayaran untuk reservasi dengan Nomor Invoice: *${res.id}*`;
    document.getElementById('btn-wa-confirm').href = `https://wa.me/6281234567890?text=${encodeURIComponent(message)}`;
  }
});
