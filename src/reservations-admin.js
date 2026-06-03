document.addEventListener('DOMContentLoaded', () => {
  if (!window.location.pathname.endsWith('reservations.html')) return;
  
  const tbody = document.getElementById('reservations-tbody');
  const searchInput = document.getElementById('search-inv');
  const filterSelect = document.getElementById('filter-status');
  
  const modal = document.getElementById('detail-modal');
  const modalBody = document.getElementById('modal-detail-body');
  const btnCloseModal = document.getElementById('btn-close-modal');
  
  let reservations = [];
  const session = JSON.parse(localStorage.getItem('erhcg_admin_session')) || {};
  const token = session.token;
  
  function fetchReservations() {
    fetch('http://localhost:8000/api/admin/reservations', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    })
    .then(response => {
      if (response.status === 401) {
        window.location.href = 'login.html';
        throw new Error('Unauthorized');
      }
      return response.json();
    })
    .then(data => {
      if (data.success) {
        reservations = data.data;
        renderTable();
      }
    })
    .catch(error => console.error('Error fetching reservations:', error));
  }
  
  function renderTable() {
    tbody.innerHTML = '';
    
    const query = searchInput.value.toLowerCase();
    const statusFilter = filterSelect.value;
    
    // Sort descending by date
    let filtered = [...reservations].sort((a,b) => new Date(b.dateCreated) - new Date(a.dateCreated));
    
    // Apply filters
    filtered = filtered.filter(r => {
      const matchSearch = r.id.toLowerCase().includes(query) || r.nama.toLowerCase().includes(query);
      const matchStatus = statusFilter === 'all' || r.status === statusFilter || (statusFilter === 'Menunggu Konfirmasi' && !r.status);
      return matchSearch && matchStatus;
    });
    
    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:20px;">Tidak ada data reservasi ditemukan.</td></tr>`;
      return;
    }
    
    filtered.forEach(r => {
      let badgeClass = 'badge-pending';
      if (r.status === 'Confirmed') badgeClass = 'badge-confirmed';
      if (r.status === 'Cancelled') badgeClass = 'badge-cancelled';
      
      let badgeText = r.status || 'Menunggu Konfirmasi';
      if (badgeText === 'Menunggu Konfirmasi') badgeText = 'Pending';
      
      const createdStr = r.dateCreated ? new Date(r.dateCreated).toLocaleDateString('id-ID') : '-';
      
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>
          <a href="#" class="view-detail" data-id="${r.id}" style="color:var(--color-primary-brown); font-weight:bold; text-decoration:none;">${r.id}</a>
        </td>
        <td>
          <strong>${r.nama}</strong><br>
          <small style="color:#666">${r.wa}</small>
        </td>
        <td>${createdStr}</td>
        <td>${r.checkin} (${r.nights} mlm)</td>
        <td><span class="badge ${badgeClass}">${badgeText}</span></td>
        <td>
          <select class="action-select" data-id="${r.id}">
            <option value="Menunggu Konfirmasi" ${r.status === 'Menunggu Konfirmasi' || !r.status ? 'selected' : ''}>Pending</option>
            <option value="Confirmed" ${r.status === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
            <option value="Cancelled" ${r.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
          </select>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }
  
  fetchReservations();
  
  // Event Listeners for Filters
  searchInput.addEventListener('input', renderTable);
  filterSelect.addEventListener('change', renderTable);
  
  // Update Status
  tbody.addEventListener('change', (e) => {
    if (e.target.classList.contains('action-select')) {
      const id = e.target.dataset.id;
      const newStatus = e.target.value;
      
      e.target.disabled = true;
      
      fetch(`http://localhost:8000/api/admin/reservations/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      })
      .then(response => response.json())
      .then(data => {
        e.target.disabled = false;
        if (data.success) {
          const index = reservations.findIndex(r => r.id === id);
          if (index !== -1) {
            reservations[index].status = newStatus;
            renderTable();
          }
        } else {
          alert('Gagal update status: ' + data.message);
          renderTable(); // Revert
        }
      })
      .catch(error => {
        e.target.disabled = false;
        console.error('Error updating status:', error);
        alert('Terjadi kesalahan koneksi.');
        renderTable(); // Revert
      });
    }
  });
  
  // View Detail Modal
  tbody.addEventListener('click', (e) => {
    if (e.target.classList.contains('view-detail')) {
      e.preventDefault();
      const id = e.target.dataset.id;
      const res = reservations.find(r => r.id === id);
      if (res) openModal(res);
    }
  });
  
  function openModal(res) {
    const createdStr = res.dateCreated ? new Date(res.dateCreated).toLocaleString('id-ID') : '-';
    
    modalBody.innerHTML = `
      <div style="display:flex; justify-content:space-between; margin-bottom:15px; border-bottom:1px solid #eee; padding-bottom:15px;">
        <div>
          <h2 style="color:var(--color-primary-brown); margin-bottom:5px;">${res.id}</h2>
          <span class="badge ${res.status === 'Confirmed' ? 'badge-confirmed' : (res.status === 'Cancelled' ? 'badge-cancelled' : 'badge-pending')}">${res.status || 'Pending'}</span>
        </div>
        <div style="text-align:right;">
          <strong>Total Estimasi</strong>
          <h2 style="color:var(--color-forest-green);">${res.total}</h2>
        </div>
      </div>
      
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px; margin-bottom:20px;">
        <div>
          <strong>Data Pemesan</strong><br>
          Nama: ${res.nama}<br>
          WA: ${res.wa}<br>
          Email: ${res.email || '-'}<br>
          Peserta: ${res.dewasa} Dewasa, ${res.anak} Anak
        </div>
        <div>
          <strong>Jadwal</strong><br>
          Check-in: ${res.checkin}<br>
          Check-out: ${res.checkout}<br>
          Malam: ${res.nights}<br>
          Tgl Submit: ${createdStr}
        </div>
      </div>
      
      <div style="margin-bottom:15px;">
        <strong>Paket Tenda:</strong>
        <pre style="background:#f9f9f9; padding:10px; border-radius:6px; font-family:inherit; margin-top:5px; white-space:pre-wrap;">${res.paketText || '-'}</pre>
      </div>
      
      <div>
        <strong>Alat Tambahan:</strong>
        <pre style="background:#f9f9f9; padding:10px; border-radius:6px; font-family:inherit; margin-top:5px; white-space:pre-wrap;">${res.addonsText || '-'}</pre>
      </div>
    `;
    modal.style.display = 'flex';
  }
  
  btnCloseModal.addEventListener('click', () => {
    modal.style.display = 'none';
  });
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.style.display = 'none';
  });
});
