import re

with open('src/pages/dashboard/AdminManualReservation.jsx', 'r') as f:
    content = f.read()

# Replace component name
content = content.replace('export default function AdminManualReservation()', 'export default function AdminEditReservation()')

# Add useParams
content = content.replace("import { useState, useEffect } from 'react';", "import { useState, useEffect } from 'react';\nimport { useParams } from 'react-router-dom';")

# Add id parsing
content = content.replace("  const [showInvoice, setShowInvoice] = useState(false);", "  const [showInvoice, setShowInvoice] = useState(false);\n  const { id } = useParams();\n  const [isInitializing, setIsInitializing] = useState(true);")

# Inject useEffect to load existing data
init_effect = """
  useEffect(() => {
    if (!id) return;
    fetch(`/api/hq-rockshill/reservations/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
    })
      .then(res => res.json())
      .then(res => {
        if (res.data) {
          const r = res.data;
          setFormData({
            nama: r.nama || '',
            wa: r.wa || '',
            email: r.email || '',
            checkin: r.checkin || '',
            checkout: r.checkout || '',
            area_camp: r.items_json ? r.items_json.area : '',
            jam_kedatangan: r.items_json ? r.items_json.jam : '',
            dewasa: r.pax_adult || 0,
            anak: r.pax_child || 0,
            motor: r.items_json ? r.items_json.motor : 0,
            mobil: r.items_json ? r.items_json.mobil : 0,
          });
          if (r.items) {
             const restoredCart = r.items.map(it => ({
               ...it,
               type: it.type === 'Paket Tenda' ? 'paket' : 'addon',
               price: it.price,
               qty: it.quantity,
               id: it.item_id
             }));
             setCart(restoredCart);
          }
          if (r.payment_type) setPaymentType(r.payment_type.toLowerCase());
          if (r.paid_amount && r.payment_type?.toLowerCase() === 'dp') setDpAmount(r.paid_amount);
          if (r.items_json && r.items_json.discount) setDiscount(r.items_json.discount);
          setStatus(r.status || 'Confirmed');
        }
        setIsInitializing(false);
      })
      .catch(err => {
        console.error('Failed to load reservation', err);
        setIsInitializing(false);
      });
  }, [id]);

  if (isInitializing) return <SkeletonForm />;
"""

# Insert right before fetchCatalogs useEffect
content = content.replace("  useEffect(() => {", init_effect + "\n  useEffect(() => {", 1)

# Change fetch to PUT
content = content.replace("fetch('/api/reservations', {", "fetch(`/api/hq-rockshill/reservations/${id}/edit`, {")
content = content.replace("method: 'POST',", "method: 'PUT',\n      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('adminToken')}` },")

# Remove standard application/json header since it's replaced above
content = content.replace("headers: { 'Content-Type': 'application/json' },", "")

# Fix the header title
content = content.replace("<h2>Buat Reservasi Manual</h2>", "<h2>Edit Reservasi</h2>")
content = content.replace("<p>Masukkan data tamu untuk reservasi dari OTA / WhatsApp.</p>", "<p>Ubah data tamu atau status pembayaran reservasi ini.</p>")
content = content.replace("Buat Reservasi</button>", "Simpan Perubahan</button>")
content = content.replace("'Reservasi manual berhasil dibuat!'", "'Reservasi berhasil diupdate!'")

with open('src/pages/dashboard/AdminEditReservation.jsx', 'w') as f:
    f.write(content)
