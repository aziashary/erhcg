function ReceiptModal({ reservation, onClose, onDecline }) {
  if (!reservation) return null;
  const r = reservation;

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="rcpt" onClick={e => e.stopPropagation()}>
        <div className="rcpt-hdr">
          <h2>Rockshill</h2>
          <p>Reservation Receipt</p>
        </div>
        <div className="rcpt-saw"></div>
        <div className="rcpt-body">
          <div className="rcpt-ids">
            <div className="lbl">Invoice</div>
            <div className="val grn">{r.invoice_id}</div>
            <div className="lbl" style={{ marginTop: 10 }}>Kode Booking</div>
            <div className="val brn">{r.booking_code}</div>
          </div>
          <div className="rcpt-rows">
            <div className="rcpt-row"><span className="k">Nama</span><span className="v">{r.nama}</span></div>
            <div className="rcpt-row"><span className="k">WhatsApp</span><span className="v">{r.wa}</span></div>
            <div className="rcpt-row"><span className="k">Check-in</span><span className="v">{r.checkin}</span></div>
            <div className="rcpt-row"><span className="k">Check-out</span><span className="v">{r.checkout}</span></div>
            <div className="rcpt-row"><span className="k">Area</span><span className="v">{r.area}</span></div>
            <div className="rcpt-row"><span className="k">Peserta</span><span className="v">{r.pax} Orang</span></div>
            {r.nights && <div className="rcpt-row"><span className="k">Durasi</span><span className="v">{r.nights} Malam</span></div>}
          </div>
          {(r.paketText || r.addonsText) && (
            <div className="rcpt-rows">
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--on-dim)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>Paket & Add-ons</div>
              {r.paketText && <div style={{ fontSize: 12, whiteSpace: 'pre-line', lineHeight: 1.5 }}>{r.paketText}</div>}
              {r.addonsText && <div style={{ fontSize: 12, whiteSpace: 'pre-line', marginTop: 6, lineHeight: 1.5 }}><strong>Tambahan:</strong><br />{r.addonsText}</div>}
            </div>
          )}
          <div className="rcpt-total">
            <span className="lbl">Total</span>
            <span className="amt">{r.total || '-'}</span>
          </div>
        </div>
        <div className="rcpt-foot" style={{ gap: '10px' }}>
          {r.status === 'Menunggu Konfirmasi' && onDecline && (
            <button className="btn btn-pri" style={{ flex: 1, background: '#dc3545', borderColor: '#dc3545', color: '#fff' }} onClick={() => { onDecline(); onClose(); }}>Decline</button>
          )}
          <button className="btn btn-ol" style={{ flex: 1 }} onClick={onClose}>Tutup</button>
        </div>
      </div>
    </div>
  );
}

export default ReceiptModal;
