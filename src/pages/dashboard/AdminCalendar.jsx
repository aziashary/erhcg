import { useState, useEffect } from 'react';

const AREAS = [2, 3, 4, 5, 6];
const DAYS = ['MING', 'SEN', 'SEL', 'RAB', 'KAM', 'JUM', 'SAB'];

export default function AdminCalendar() {
  const [cur, setCur] = useState(new Date());
  const [data, setData] = useState([]);
  const [selDay, setSelDay] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/hq-rockshill/reservations', {
      headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
    })
      .then(r => r.json())
      .then(res => { setData((res.data || []).filter(r => r.status !== 'Rejected' && r.status !== 'Cancelled')); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const booked = (date) => {
    const d = new Date(date); d.setHours(0, 0, 0, 0);
    return AREAS.filter(a =>
      data.some(r => {
        const ci = new Date(r.checkin); ci.setHours(0, 0, 0, 0);
        const co = new Date(r.checkout); co.setHours(0, 0, 0, 0);
        const m = r.area.match(/\d+/);
        return m && m[0] === a.toString() && d >= ci && d < co;
      })
    );
  };

  const y = cur.getFullYear(), m = cur.getMonth();
  const dim = new Date(y, m + 1, 0).getDate();
  const fd = new Date(y, m, 1).getDay();
  const pmd = new Date(y, m, 0).getDate();
  const mName = cur.toLocaleString('id-ID', { month: 'long', year: 'numeric' });

  const cells = [];
  for (let i = fd - 1; i >= 0; i--) cells.push({ d: pmd - i, cur: false, date: new Date(y, m - 1, pmd - i) });
  for (let d = 1; d <= dim; d++) cells.push({ d, cur: true, date: new Date(y, m, d) });
  const rem = 42 - cells.length;
  for (let d = 1; d <= rem; d++) cells.push({ d, cur: false, date: new Date(y, m + 1, d) });

  const selDayRes = selDay ? data.filter(r => {
    const ci = new Date(r.checkin); ci.setHours(0, 0, 0, 0);
    const co = new Date(r.checkout); co.setHours(0, 0, 0, 0);
    const sd = new Date(selDay); sd.setHours(0, 0, 0, 0);
    return sd >= ci && sd < co;
  }) : [];

  const prev = () => setCur(new Date(y, m - 1, 1));
  const next = () => setCur(new Date(y, m + 1, 1));

  if (loading) return (
    <div style={{ padding: '20px 0' }}>
      <div className="skeleton skeleton-title" style={{ width: '40%' }}></div>
      <div className="skeleton" style={{ width: '100%', height: '300px', borderRadius: '12px' }}></div>
    </div>
  );

  return (
    <>
      <div className="pg-hdr desk">
        <div>
          <h1>Kalender Ketersediaan</h1>
          <p>Kelola dan lihat ketersediaan area perkemahan.</p>
        </div>
        <div className="pg-hdr-right desk" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button className="btn btn-ol btn-icon" onClick={prev}><i className="bx bx-chevron-left"></i></button>
          <h2 style={{ fontFamily: 'Outfit', fontSize: 20, fontWeight: 600, color: 'var(--pri)', minWidth: 150, textAlign: 'center' }}>{mName}</h2>
          <button className="btn btn-ol btn-icon" onClick={next}><i className="bx bx-chevron-right"></i></button>
          <button className="btn btn-ol" onClick={() => setCur(new Date())} style={{ marginLeft: 8 }}>Hari Ini</button>
        </div>
      </div>

      {/* Mobile title */}
      <div className="mob" style={{ flexDirection: 'column', marginBottom: 14 }}>
        <h1 style={{ fontFamily: 'Outfit', fontSize: 24, fontWeight: 700 }}>Kalender</h1>
        <p style={{ fontSize: 13, color: 'var(--on-dim)' }}>Ketersediaan area perkemahan</p>
      </div>

      {/* ── DESKTOP ── */}
      <div className="cal-card desk">
        <div className="cal-legend">
          <div className="cal-legend-item"><div className="cal-dot g"></div>Tersedia</div>
          <div className="cal-legend-item"><div className="cal-dot r"></div>Dipesan</div>
        </div>
        <div className="cal-hdr">{DAYS.map(d => <div key={d}>{d}</div>)}</div>
        <div className="cal-body">
          {cells.map((c, i) => {
            const bk = c.cur ? booked(c.date) : [];
            const full = c.cur && bk.length === AREAS.length;
            return (
              <div key={i} className={`cal-cell ${!c.cur ? 'dim' : ''}`}>
                <div className={`cal-d ${!c.cur ? 'dim' : ''}`}>{c.d}</div>
                {c.cur && !full && (
                  <div className="cal-areas">
                    {AREAS.map(a => (
                      <div key={a} className={`cab ${bk.includes(a) ? 'no' : 'ok'}`} title={`Area ${a}`}>A{a}</div>
                    ))}
                  </div>
                )}
                {full && <span className="cal-full">Penuh</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── MOBILE ── */}
      <div className="mob-block" style={{ display: 'none' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ fontSize: 12, color: 'var(--on-dim)' }}>Update: {mName}</span>
          <button className="btn btn-pri" style={{ fontSize: 12, padding: '7px 12px' }}><i className="bx bx-plus"></i> Booking</button>
        </div>

        <div className="cal-card" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px' }}>
            <button className="btn btn-gh btn-icon" onClick={prev}><i className="bx bx-chevron-left"></i></button>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--pri)' }}>{mName}</h3>
            <button className="btn btn-gh btn-icon" onClick={next}><i className="bx bx-chevron-right"></i></button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', padding: '0 4px', marginBottom: 4, textAlign: 'center' }}>
            {DAYS.map(d => <div key={d} style={{ fontSize: 10, fontWeight: 700, color: 'var(--on-dim)', padding: '3px 0', textTransform: 'uppercase' }}>{d}</div>)}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', padding: '0 4px 8px' }}>
            {cells.map((c, i) => {
              const bk = c.cur ? booked(c.date) : [];
              const isSel = selDay && c.date.toDateString() === new Date(selDay).toDateString();
              const isToday = c.date.toDateString() === new Date().toDateString();
              let dot = 'g';
              if (bk.length === AREAS.length) dot = 'r';
              else if (bk.length > 0) dot = 'y';
              return (
                <div key={i} className={`mcal-cell ${!c.cur ? 'dim' : ''} ${isSel ? 'sel' : ''}`}
                  onClick={() => c.cur && setSelDay(c.date)}>
                  <div className={`mcal-d ${!c.cur ? 'dim' : ''}`}
                    style={{ color: isSel ? '#fff' : isToday ? 'var(--pri)' : undefined, fontWeight: isToday || isSel ? 700 : undefined }}>
                    {c.d}
                  </div>
                  {c.cur && <div className="mcal-dots"><div className={`cal-dot ${dot}`}></div></div>}
                </div>
              );
            })}
          </div>
          <div style={{ display: 'flex', gap: 18, padding: '8px 14px', borderTop: '1px solid var(--outline-var)', fontSize: 11 }}>
            <div className="cal-legend-item"><div className="cal-dot g"></div>Tersedia</div>
            <div className="cal-legend-item"><div className="cal-dot y"></div>Terpesan</div>
            <div className="cal-legend-item"><div className="cal-dot r"></div>Penuh</div>
          </div>
        </div>

        {selDay && (
          <div className="cal-detail">
            <h3>Detail Tanggal: {new Date(selDay).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</h3>
            {selDayRes.length === 0 ? (
              <div className="site-card">
                <div className="site-img"><i className="bx bx-check-circle" style={{ color: 'var(--sec)' }}></i></div>
                <div className="site-info"><h4>Semua Area Tersedia</h4><p>Tidak ada pemesanan pada tanggal ini</p></div>
              </div>
            ) : selDayRes.map(r => (
              <div key={r.id} className="site-card">
                <div className="site-img"><i className="bx bxs-home-alt-2"></i></div>
                <div className="site-info">
                  <h4>{r.area}</h4>
                  <p>{r.nama} • {r.wa}</p>
                  <span className="chip chip-b" style={{ fontSize: 10 }}>Terpesan</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
