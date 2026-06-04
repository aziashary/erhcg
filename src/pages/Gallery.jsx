import { useState, useEffect } from 'react';

export default function Gallery() {
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
          <h1>Gallery</h1>
        </div>
      </div>

      <br />

      <div className="container gallery-section">
        <div className="bento-grid">
          <div className="bento-item large" onClick={() => openLightbox('/gallery/IMG_1521.jpg')}>
            <img src="/gallery/IMG_1521.jpg" alt="Rockshill Camp" loading="lazy" />
          </div>
          <div className="bento-item wide" onClick={() => openLightbox('/gallery/IMG_1522.jpg')}>
            <img src="/gallery/IMG_1522.jpg" alt="Rockshill Camp" loading="lazy" />
          </div>
          <div className="bento-item tall" onClick={() => openLightbox('/gallery/IMG_1523.jpg')}>
            <img src="/gallery/IMG_1523.jpg" alt="Rockshill Camp" loading="lazy" />
          </div>
          <div className="bento-item" onClick={() => openLightbox('/gallery/IMG_1067.jpg')}>
            <img src="/gallery/IMG_1067.jpg" alt="Rockshill Camp" loading="lazy" />
          </div>
          <div className="bento-item" onClick={() => openLightbox('/gallery/IMG_1069.jpg')}>
            <img src="/gallery/IMG_1069.jpg" alt="Rockshill Camp" loading="lazy" />
          </div>
          <div className="bento-item wide" onClick={() => openLightbox('/gallery/IMG_1516.jpg')}>
            <img src="/gallery/IMG_1516.jpg" alt="Rockshill Camp" loading="lazy" />
          </div>
          <div className="bento-item large" onClick={() => openLightbox('/gallery/IMG_3822.jpg')}>
            <img src="/gallery/IMG_3822.jpg" alt="Rockshill Camp" loading="lazy" />
          </div>

          {/* Area Images */}
          <div className="bento-item large" onClick={() => openLightbox('/area/4/IMG_3274.jpg')}>
            <img src="/area/4/IMG_3274.jpg" alt="Rockshill Camp" loading="lazy" />
          </div>
          <div className="bento-item wide" onClick={() => openLightbox('/area/3/IMG_2550.jpg')}>
            <img src="/area/3/IMG_2550.jpg" alt="Rockshill Camp" loading="lazy" />
          </div>
          <div className="bento-item tall" onClick={() => openLightbox('/area/7/d496077a-67fd-4bdf-bfd7-afc17c156b95.JPG')}>
            <img src="/area/7/d496077a-67fd-4bdf-bfd7-afc17c156b95.JPG" alt="Rockshill Camp" loading="lazy" />
          </div>
          <div className="bento-item" onClick={() => openLightbox('/area/1/1.jpg')}>
            <img src="/area/1/1.jpg" alt="Rockshill Camp" loading="lazy" />
          </div>
          <div className="bento-item" onClick={() => openLightbox('/area/2/2.JPG')}>
            <img src="/area/2/2.JPG" alt="Rockshill Camp" loading="lazy" />
          </div>
          <div className="bento-item large" onClick={() => openLightbox('/area/campervan/IMG_2536.jpg')}>
            <img src="/area/campervan/IMG_2536.jpg" alt="Rockshill Campervan" loading="lazy" />
          </div>
          <div className="bento-item" onClick={() => openLightbox('/area/3/862621da-0ae9-4fbc-8b88-f3a6a49e0e7c.JPG')}>
            <img src="/area/3/862621da-0ae9-4fbc-8b88-f3a6a49e0e7c.JPG" alt="Rockshill Camp" loading="lazy" />
          </div>
          <div className="bento-item tall" onClick={() => openLightbox('/area/5/IMG_2497.jpg')}>
            <img src="/area/5/IMG_2497.jpg" alt="Rockshill Camp" loading="lazy" />
          </div>
          <div className="bento-item wide" onClick={() => openLightbox('/area/6/IMG_0251.jpg')}>
            <img src="/area/6/IMG_0251.jpg" alt="Rockshill Camp" loading="lazy" />
          </div>
          <div className="bento-item" onClick={() => openLightbox('/area/4/92f2e601-c1e0-48a8-81c7-f75336f776bf.JPG')}>
            <img src="/area/4/92f2e601-c1e0-48a8-81c7-f75336f776bf.JPG" alt="Rockshill Camp" loading="lazy" />
          </div>
          <div className="bento-item" onClick={() => openLightbox('/area/8/d1857b26-14e2-4b77-b34d-72e4f37f36b1.JPG')}>
            <img src="/area/8/d1857b26-14e2-4b77-b34d-72e4f37f36b1.JPG" alt="Rockshill Camp" loading="lazy" />
          </div>
          <div className="bento-item large" onClick={() => openLightbox('/area/3/18628c04-a8cc-44b8-a818-d9a60b1c0c53.JPG')}>
            <img src="/area/3/18628c04-a8cc-44b8-a818-d9a60b1c0c53.JPG" alt="Rockshill Camp" loading="lazy" />
          </div>
          <div className="bento-item tall" onClick={() => openLightbox('/area/6/93132c8e-d70c-4bfc-baf4-fea3acbacde4.JPG')}>
            <img src="/area/6/93132c8e-d70c-4bfc-baf4-fea3acbacde4.JPG" alt="Rockshill Camp" loading="lazy" />
          </div>
          <div className="bento-item" onClick={() => openLightbox('/area/3/205de935-42fe-4270-b680-f9e6a704b588.JPG')}>
            <img src="/area/3/205de935-42fe-4270-b680-f9e6a704b588.JPG" alt="Rockshill Camp" loading="lazy" />
          </div>
        </div>

        {/* Instagram CTA */}
        <div className="ig-cta">
          <h3>Ingin melihat update terbaru?</h3>
          <p style={{ marginBottom: '20px', color: '#666' }}>Kunjungi Instagram kami untuk melihat lebih banyak foto, video, dan ulasan dari pengunjung Rockshill Campground.</p>
          <a href="https://www.instagram.com/rockshillcamp" target="_blank" rel="noopener noreferrer" className="btn-instagram">
            <i className='bx bxl-instagram' style={{ fontSize: '1.5rem' }}></i> Kunjungi Instagram Kami
          </a>
        </div>
      </div>

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
