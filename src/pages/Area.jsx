import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Area() {
  const [activeImage, setActiveImage] = useState(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && activeImage) {
        setActiveImage(null);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [activeImage]);

  const openLightbox = (src) => {
    setActiveImage(src);
  };

  const closeLightbox = () => {
    setActiveImage(null);
  };

  return (
    <main className="page-transition">
      <div className="page-header">
        <div className="container">
          <h1>Gallery Area Camp</h1>
          <p>Lihat suasana dan lokasi setiap area camp di Rockshill Campground.</p>
          <div style={{ marginTop: '20px' }}>
            <Link to="/reservation" className="btn btn-primary">Kembali ke Reservasi</Link>
          </div>
        </div>
      </div>

      <br />
      <main className="container gallery-section">
        {/* Area 1 */}
        <h2 className="area-title" id="area-1">Area 1</h2>
        <div className="gallery-grid">
          <div className="gallery-item" onClick={() => openLightbox('/area/1/1.jpg')}><img src="/area/1/1.jpg" alt="Area 1" loading="lazy" /></div>
        </div>

        {/* Area 2 */}
        <h2 className="area-title" id="area-2">Area 2</h2>
        <div className="gallery-grid">
          <div className="gallery-item" onClick={() => openLightbox('/area/2/2.JPG')}><img src="/area/2/2.JPG" alt="Area 2" loading="lazy" /></div>
          <div className="gallery-item" onClick={() => openLightbox('/area/2/3.JPG')}><img src="/area/2/3.JPG" alt="Area 2" loading="lazy" /></div>
        </div>

        {/* Area 3 */}
        <h2 className="area-title" id="area-3">Area 3</h2>
        <div className="gallery-grid">
          <div className="gallery-item" onClick={() => openLightbox('/area/3/18628c04-a8cc-44b8-a818-d9a60b1c0c53.JPG')}><img src="/area/3/18628c04-a8cc-44b8-a818-d9a60b1c0c53.JPG" alt="Area 3" loading="lazy" /></div>
          <div className="gallery-item" onClick={() => openLightbox('/area/3/205de935-42fe-4270-b680-f9e6a704b588.JPG')}><img src="/area/3/205de935-42fe-4270-b680-f9e6a704b588.JPG" alt="Area 3" loading="lazy" /></div>
          <div className="gallery-item" onClick={() => openLightbox('/area/3/862621da-0ae9-4fbc-8b88-f3a6a49e0e7c.JPG')}><img src="/area/3/862621da-0ae9-4fbc-8b88-f3a6a49e0e7c.JPG" alt="Area 3" loading="lazy" /></div>
          <div className="gallery-item" onClick={() => openLightbox('/area/3/IMG_0246.jpg')}><img src="/area/3/IMG_0246.jpg" alt="Area 3" loading="lazy" /></div>
          <div className="gallery-item" onClick={() => openLightbox('/area/3/IMG_2550.jpg')}><img src="/area/3/IMG_2550.jpg" alt="Area 3" loading="lazy" /></div>
        </div>

        {/* Area 4 */}
        <h2 className="area-title" id="area-4">Area 4</h2>
        <div className="gallery-grid">
          <div className="gallery-item" onClick={() => openLightbox('/area/4/92f2e601-c1e0-48a8-81c7-f75336f776bf.JPG')}><img src="/area/4/92f2e601-c1e0-48a8-81c7-f75336f776bf.JPG" alt="Area 4" loading="lazy" /></div>
          <div className="gallery-item" onClick={() => openLightbox('/area/4/IMG_3274.jpg')}><img src="/area/4/IMG_3274.jpg" alt="Area 4" loading="lazy" /></div>
          <div className="gallery-item" onClick={() => openLightbox('/area/4/eba8d9ec-edbc-48b8-b1c9-a5f1d4deb802.JPG')}><img src="/area/4/eba8d9ec-edbc-48b8-b1c9-a5f1d4deb802.JPG" alt="Area 4" loading="lazy" /></div>
        </div>

        {/* Area 5 */}
        <h2 className="area-title" id="area-5">Area 5</h2>
        <div className="gallery-grid">
          <div className="gallery-item" onClick={() => openLightbox('/area/5/IMG_0248.jpg')}><img src="/area/5/IMG_0248.jpg" alt="Area 5" loading="lazy" /></div>
          <div className="gallery-item" onClick={() => openLightbox('/area/5/IMG_2497.jpg')}><img src="/area/5/IMG_2497.jpg" alt="Area 5" loading="lazy" /></div>
        </div>

        {/* Area 6 */}
        <h2 className="area-title" id="area-6">Area 6</h2>
        <div className="gallery-grid">
          <div className="gallery-item" onClick={() => openLightbox('/area/6/7e8dc183-0fa4-4630-9d62-6c84b81adf2f.JPG')}><img src="/area/6/7e8dc183-0fa4-4630-9d62-6c84b81adf2f.JPG" alt="Area 6" loading="lazy" /></div>
          <div className="gallery-item" onClick={() => openLightbox('/area/6/93132c8e-d70c-4bfc-baf4-fea3acbacde4.JPG')}><img src="/area/6/93132c8e-d70c-4bfc-baf4-fea3acbacde4.JPG" alt="Area 6" loading="lazy" /></div>
          <div className="gallery-item" onClick={() => openLightbox('/area/6/IMG_0251.jpg')}><img src="/area/6/IMG_0251.jpg" alt="Area 6" loading="lazy" /></div>
        </div>

        {/* Area 7 */}
        <h2 className="area-title" id="area-7">Area 7</h2>
        <div className="gallery-grid">
          <div className="gallery-item" onClick={() => openLightbox('/area/7/101dd7cd-1295-4dd1-bf3a-8f47d1047758.JPG')}><img src="/area/7/101dd7cd-1295-4dd1-bf3a-8f47d1047758.JPG" alt="Area 7" loading="lazy" /></div>
          <div className="gallery-item" onClick={() => openLightbox('/area/7/d496077a-67fd-4bdf-bfd7-afc17c156b95.JPG')}><img src="/area/7/d496077a-67fd-4bdf-bfd7-afc17c156b95.JPG" alt="Area 7" loading="lazy" /></div>
        </div>

        {/* Area 8 */}
        <h2 className="area-title" id="area-8">Area 8</h2>
        <div className="gallery-grid">
          <div className="gallery-item" onClick={() => openLightbox('/area/8/9b5cecbf-b11d-45ce-85fd-1afe4afb2246.JPG')}><img src="/area/8/9b5cecbf-b11d-45ce-85fd-1afe4afb2246.JPG" alt="Area 8" loading="lazy" /></div>
          <div className="gallery-item" onClick={() => openLightbox('/area/8/d1857b26-14e2-4b77-b34d-72e4f37f36b1.JPG')}><img src="/area/8/d1857b26-14e2-4b77-b34d-72e4f37f36b1.JPG" alt="Area 8" loading="lazy" /></div>
        </div>

        {/* Campervan */}
        <h2 className="area-title" id="area-campervan">Area Campervan</h2>
        <div className="gallery-grid">
          <div className="gallery-item" onClick={() => openLightbox('/area/campervan/IMG_2536.jpg')}><img src="/area/campervan/IMG_2536.jpg" alt="Campervan" loading="lazy" /></div>
          <div className="gallery-item" onClick={() => openLightbox('/area/campervan/IMG_2542.jpg')}><img src="/area/campervan/IMG_2542.jpg" alt="Campervan" loading="lazy" /></div>
          <div className="gallery-item" onClick={() => openLightbox('/area/campervan/campervan.png')}><img src="/area/campervan/campervan.png" alt="Campervan" loading="lazy" /></div>
        </div>
      </main>

      {/* Lightbox Modal */}
      {activeImage && (
        <div className="lightbox active" onClick={(e) => {
          if (e.target.classList.contains('lightbox')) closeLightbox();
        }}>
          <button className="lightbox-close" onClick={closeLightbox}>&times;</button>
          <img src={activeImage} alt="Full view" />
        </div>
      )}
    </main>
  );
}
