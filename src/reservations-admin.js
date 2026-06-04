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

  function openModal(res) {
    const createdStr = res.dateCreated ? new Date(res.dateCreated).toLocaleString('id-ID') : '-';
    
    const checkinFormatted = formatTanggalIndo(res.checkin);
    const checkoutFormatted = formatTanggalIndo(res.checkout);
    
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
          <strong>Jadwal & Lokasi</strong><br>
          Jadwal: ${checkinFormatted} s.d ${checkoutFormatted} (${res.nights} mlm)<br>
          Area Camp: ${res.area || '-'}<br>
          Jam Kedatangan: ${res.jamKedatangan || '-'}<br>
          Tgl Submit: ${createdStr}
        </div>
      </div>
      
      <div style="margin-bottom:15px;">
        <strong>Paket Tenda:</strong>
        <div id="modal-res-paket" style="background:#f9f9f9; padding:10px; border-radius:6px; font-family:inherit; margin-top:5px; font-size: 1rem; color: #444;"></div>
      </div>
      
      <div>
        <strong>Alat Tambahan:</strong>
        <div id="modal-res-addons" style="background:#f9f9f9; padding:10px; border-radius:6px; font-family:inherit; margin-top:5px; font-size: 1rem; color: #444;"></div>
      </div>
    `;
    modal.style.display = 'flex';
    
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

    renderTextAsFlex(res.paketText, 'modal-res-paket');
    renderTextAsFlex(res.addonsText, 'modal-res-addons');
  }
  
  btnCloseModal.addEventListener('click', () => {
    modal.style.display = 'none';
  });
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.style.display = 'none';
  });
});
