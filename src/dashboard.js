document.addEventListener('DOMContentLoaded', () => {
  // Check auth
  const session = JSON.parse(localStorage.getItem('erhcg_admin_session'));
  const isLoginPage = window.location.pathname.includes('login.html');
  
  if (!session || !session.isLoggedIn) {
    if (!isLoginPage) {
      window.location.href = 'login.html';
    }
    return;
  }
  
  // Set user info
  if (!isLoginPage) {
    document.getElementById('user-name').textContent = session.name;
    document.getElementById('user-role').textContent = session.role;
    document.getElementById('user-avatar').textContent = session.name.charAt(0).toUpperCase();
    
    // Sidebar toggle
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');
    if (menuToggle) {
      menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('show');
      });
    }
    
    // Logout
    document.getElementById('btn-logout').addEventListener('click', () => {
      localStorage.removeItem('erhcg_admin_session');
      window.location.href = 'login.html';
    });
  }
  
  // Overview Logic (hanya jalan di index.html)
  if (window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('dashboard/') || window.location.pathname.endsWith('dashboard')) {
    loadOverview();
  }
  
  function loadOverview() {
    const token = session.token;
    
    fetch('http://localhost:8000/api/admin/overview', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    })
    .then(response => {
      if (response.status === 401) {
        localStorage.removeItem('erhcg_admin_session');
        window.location.href = 'login.html';
        throw new Error('Unauthorized');
      }
      return response.json();
    })
    .then(data => {
      if (!data.success) return;
      
      const stats = data.data;
      
      // Total Reservasi
      document.getElementById('stat-total-res').textContent = stats.total_reservations;
      document.getElementById('stat-pending').textContent = stats.pending_count;
      document.getElementById('stat-guests').textContent = stats.total_guests;
      
      // Format rupiah
      const formatRp = (angka) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
      };
      document.getElementById('stat-revenue').textContent = formatRp(stats.total_revenue);
      
      // Render 5 recent reservations
      const recentTbody = document.getElementById('recent-tbody');
      if (!recentTbody) return;
      
      recentTbody.innerHTML = '';
      
      const recent = stats.recent;
      
      if (recent.length === 0) {
        recentTbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:20px;">Belum ada reservasi</td></tr>`;
        return;
      }
      
      recent.forEach(r => {
        let badgeClass = 'badge-pending';
        if (r.status === 'Confirmed') badgeClass = 'badge-confirmed';
        if (r.status === 'Cancelled') badgeClass = 'badge-cancelled';
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><strong style="color:var(--color-primary-brown)">${r.id}</strong></td>
          <td>${r.nama}</td>
          <td>${r.checkin}</td>
          <td style="max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${r.paketText.replace(/\n/g, ', ')}</td>
          <td><span class="badge ${badgeClass}">${r.status}</span></td>
          <td><strong>${r.total}</strong></td>
        `;
        recentTbody.appendChild(tr);
      });
    })
    .catch(error => console.error('Error fetching overview:', error));
  }
});
