import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const MAX_AREA_CAPACITY = {
  'Area 0': 1, 'Area 1': 3, 'Area 2': 5, 'Area 3': 5, 'Area 4': 3,
  'Area 4 Samping': 1, 'Area 5': 2, 'Area 6': 2, 'Area 7': 2, 'Area 8': 3, 'Campervan': 3
};
const AREAS = Object.keys(MAX_AREA_CAPACITY);
const DAYS = ['MING', 'SEN', 'SEL', 'RAB', 'KAM', 'JUM', 'SAB'];

export default function AdminCalendar() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const initSelDate = searchParams.get('selDate') ? new Date(searchParams.get('selDate') + 'T00:00:00+07:00') : null;
  const [cur, setCur] = useState(initSelDate || new Date());
  const [data, setData] = useState([]);
  const [selDay, setSelDay] = useState(initSelDate);
  const [loading, setLoading] = useState(true);
  const detailRef = useRef(null);

  useEffect(() => {
    if (initSelDate && detailRef.current) {
      setTimeout(() => {
        detailRef.current.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
    fetch('/api/hq-rockshill/reservations', {
      headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
    })
      .then(r => r.json())
      .then(res => { setData((res.data || []).filter(r => r.status === 'Confirmed')); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const getBookedInfo = (date) => {
    const d = new Date(date); d.setHours(0, 0, 0, 0);
    const info = {};
    AREAS.forEach(a => info[a] = 0);
    
    data.forEach(r => {
      const ci = new Date(r.checkin); ci.setHours(0, 0, 0, 0);
      const co = new Date(r.checkout); co.setHours(0, 0, 0, 0);
      if (d >= ci && d < co) {
        if (info[r.area] !== undefined) {
          info[r.area] += (r.totalTents || 1);
        }
      }
    });
    return info;
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
            const bkInfo = c.cur ? getBookedInfo(c.date) : {};
            let fullCount = 0;
            if (c.cur) {
              AREAS.forEach(a => { if (bkInfo[a] >= MAX_AREA_CAPACITY[a]) fullCount++; });
            }
            const full = c.cur && fullCount === AREAS.length;
            return (
              <div key={i} className={`cal-cell ${!c.cur ? 'dim' : ''}`}>
                <div className={`cal-d ${!c.cur ? 'dim' : ''}`}>{c.d}</div>
                {c.cur && !full && (
                  <div className="cal-areas" style={{ gap: '2px', display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
                    {AREAS.map(a => {
                      const bookedTents = bkInfo[a] || 0;
                      const maxTents = MAX_AREA_CAPACITY[a];
                      const sisa = maxTents - bookedTents;
                      let cabClass = '';
                      if (bookedTents === 0) cabClass = 'avail';
                      else if (sisa <= 0) cabClass = 'no';
                      else if (sisa === 1) cabClass = 'warn';
                      else cabClass = 'ok';

                      return (
                        <div key={a} className={`cab ${cabClass}`} title={`${a}: ${bookedTents}/${maxTents} Terpesan`} style={{ width: 'auto', padding: '0 4px', textDecoration: cabClass === 'no' ? 'line-through' : 'none' }}>
                          {a.replace('Area ', 'A').replace('Campervan', 'CV')}: {bookedTents}/{maxTents}
                        </div>
                      );
                    })}
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
              const bkInfo = c.cur ? getBookedInfo(c.date) : {};
              let fullCount = 0;
              let partialCount = 0;
              if (c.cur) {
                AREAS.forEach(a => {
                  if (bkInfo[a] >= MAX_AREA_CAPACITY[a]) fullCount++;
                  else if (bkInfo[a] > 0) partialCount++;
                });
              }
              const isSel = selDay && c.date.toDateString() === new Date(selDay).toDateString();
              const isToday = c.date.toDateString() === new Date().toDateString();
              let dot = 'g';
              if (fullCount === AREAS.length) dot = 'r';
              else if (fullCount > 0 || partialCount > 0) dot = 'y';
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
          <div className="cal-detail" ref={detailRef}>
            <h3>Detail Tanggal: {new Date(selDay).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</h3>
            {AREAS.map(a => {
               const areaRes = selDayRes.filter(r => r.area === a);
               const bookedTents = areaRes.reduce((sum, r) => sum + parseInt((r.totalTents || 1), 10), 0);
               const maxTents = MAX_AREA_CAPACITY[a];
               const isFull = bookedTents >= maxTents;
               
               let dot = 'g';
               if (bookedTents === 0) dot = 'm'; // dim/abu-abu
               else if (bookedTents >= maxTents) dot = 'r';
               else dot = 'y';

               const localDateStr = `${selDay.getFullYear()}-${String(selDay.getMonth()+1).padStart(2, '0')}-${String(selDay.getDate()).padStart(2, '0')}`;

               return (
                 <div key={a} className="site-card" onClick={() => navigate(`/hq-rockshill/confirmed?date=${localDateStr}&area=${encodeURIComponent(a)}`)} style={{ cursor: 'pointer', borderLeft: `4px solid ${dot === 'm' ? 'var(--outline-var)' : (dot === 'r' ? 'var(--err)' : (dot === 'y' ? '#f7bc6a' : 'var(--sec)'))}` }}>
                   <div className="site-info" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     <div>
                       <h4>{a}</h4>
                       <p style={{ margin: 0 }}>{bookedTents} dari {maxTents} Tenda Terisi</p>
                     </div>
                     <i className="bx bx-chevron-right" style={{ fontSize: 20, color: 'var(--on-dim)' }}></i>
                   </div>
                 </div>
               );
            })}
          </div>
        )}
      </div>
    </>
  );
}
