import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';

import Gallery from './pages/Gallery';
import Area from './pages/Area';
import Packages from './pages/Packages';
import Reservation from './pages/Reservation';
import CheckReservation from './pages/CheckReservation';
import AdminLogin from './pages/dashboard/AdminLogin';
import AdminLayout from './pages/dashboard/AdminLayout';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import AdminPending from './pages/dashboard/AdminPending';
import AdminConfirmed from './pages/dashboard/AdminConfirmed';
import AdminDeclined from './pages/dashboard/AdminDeclined';
import AdminCalendar from './pages/dashboard/AdminCalendar';
import AdminPrices from './pages/dashboard/AdminPrices';
import { useLocation } from 'react-router-dom';

function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/hq-rockshill');

  return (
    <>
      {!isAdminRoute && <Header />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/area" element={<Area />} />
        <Route path="/packages" element={<Packages />} />
        <Route path="/reservation" element={<Reservation />} />
        <Route path="/check-reservation" element={<CheckReservation />} />
        
        {/* Admin Routes */}
        <Route path="/hq-rockshill/login" element={<AdminLogin />} />
        <Route path="/hq-rockshill" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="pending" element={<AdminPending />} />
          <Route path="confirmed" element={<AdminConfirmed />} />
          <Route path="declined" element={<AdminDeclined />} />
          <Route path="calendar" element={<AdminCalendar />} />
          <Route path="prices" element={<AdminPrices />} />
        </Route>
      </Routes>
      {!isAdminRoute && <Footer />}
    </>
  );
}

export default App;
