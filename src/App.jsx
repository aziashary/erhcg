import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
import GenerateFormWA from './pages/GenerateFormWA';
import AdminCatalog from './pages/dashboard/AdminCatalog';
import AdminSettings from './pages/dashboard/AdminSettings';
import AdminManualReservation from './pages/dashboard/AdminManualReservation';
import AdminEditReservation from './pages/dashboard/AdminEditReservation';
import AdminPOS from './pages/dashboard/AdminPOS';
import AdminUsers from './pages/dashboard/AdminUsers';
import SpecialReservation from './pages/SpecialReservation';
import { SettingsProvider } from './context/SettingsContext';

const RoleRoute = ({ element, allowedRoles }) => {
  const role = localStorage.getItem('adminRole') || 'admin';
  if (!allowedRoles.includes(role)) {
    return <Navigate to={role === 'kasir' ? "/hq-rockshill/calendar" : "/hq-rockshill/dashboard"} replace />;
  }
  return element;
};

function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/hq-rockshill');

  return (
    <SettingsProvider>
      {!isAdminRoute && <Header />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/area" element={<Area />} />
        <Route path="/packages" element={<Packages />} />
        <Route path="/reservation" element={<Reservation />} />
        <Route path="/special-booking" element={<SpecialReservation />} />
        <Route path="/generate-form-wa" element={<GenerateFormWA />} />
        <Route path="/check-reservation" element={<CheckReservation />} />
        
        {/* Admin Routes */}
        <Route path="/hq-rockshill/login" element={<AdminLogin />} />
        <Route path="/hq-rockshill" element={<AdminLayout />}>
          <Route index element={<RoleRoute element={<AdminDashboard />} allowedRoles={['superadmin', 'admin']} />} />
          <Route path="dashboard" element={<RoleRoute element={<AdminDashboard />} allowedRoles={['superadmin', 'admin']} />} />
          <Route path="pending" element={<RoleRoute element={<AdminPending />} allowedRoles={['superadmin', 'admin']} />} />
          <Route path="confirmed" element={<AdminConfirmed />} />
          <Route path="pos" element={<AdminPOS />} />
          <Route path="declined" element={<AdminDeclined />} />
          <Route path="calendar" element={<AdminCalendar />} />
          <Route path="catalog" element={<RoleRoute element={<AdminCatalog />} allowedRoles={['superadmin', 'admin']} />} />
          <Route path="settings" element={<RoleRoute element={<AdminSettings />} allowedRoles={['superadmin']} />} />
          <Route path="manual-reservation" element={<RoleRoute element={<AdminManualReservation />} allowedRoles={['superadmin', 'admin']} />} />
          <Route path="edit/:id" element={<RoleRoute element={<AdminEditReservation />} allowedRoles={['superadmin', 'admin']} />} />
          <Route path="users" element={<RoleRoute element={<AdminUsers />} allowedRoles={['superadmin']} />} />
        </Route>
      </Routes>
      {!isAdminRoute && <Footer />}
    </SettingsProvider>
  );
}

export default App;
