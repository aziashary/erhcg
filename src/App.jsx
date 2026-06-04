import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';

import Gallery from './pages/Gallery';
import Area from './pages/Area';
import Packages from './pages/Packages';
import Reservation from './pages/Reservation';
import CheckReservation from './pages/CheckReservation';

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/area" element={<Area />} />
        <Route path="/packages" element={<Packages />} />
        <Route path="/reservation" element={<Reservation />} />
        <Route path="/check-reservation" element={<CheckReservation />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;
