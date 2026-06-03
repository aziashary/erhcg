import './style.css'

document.addEventListener('DOMContentLoaded', () => {
  // 1. Sticky Header
  const header = document.getElementById('header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // 2. FAQ Accordion
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    question.addEventListener('click', () => {
      // Close other items
      faqItems.forEach(otherItem => {
        if (otherItem !== item && otherItem.classList.contains('active')) {
          otherItem.classList.remove('active');
          const icon = otherItem.querySelector('.bx-chevron-up');
          if (icon) {
            icon.classList.replace('bx-chevron-up', 'bx-chevron-down');
          }
        }
      });

      // Toggle current item
      item.classList.toggle('active');
      const icon = question.querySelector('i');
      if (item.classList.contains('active')) {
        icon.classList.replace('bx-chevron-down', 'bx-chevron-up');
      } else {
        icon.classList.replace('bx-chevron-up', 'bx-chevron-down');
      }
    });
  });

  // 3. Smooth scrolling for anchor links (handled mostly by CSS, but good to add an offset for fixed header)
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        const headerOffset = 80;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.scrollY - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // 4. Interactive Hero Canvas Animation (Fireflies)
  const canvas = document.getElementById('hero-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    
    const mouse = {
      x: null,
      y: null,
      radius: 150 // Interaction radius
    };

    window.addEventListener('mousemove', (e) => {
      mouse.x = e.pageX;
      mouse.y = e.pageY;
    });



    window.addEventListener('mouseout', () => {
      mouse.x = null;
      mouse.y = null;
    });

    function resize() {
      const heroSection = document.getElementById('home');
      width = canvas.width = window.innerWidth;
      height = canvas.height = heroSection ? heroSection.offsetHeight : window.innerHeight;
    }

    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 2.0 + 0.5; // Size of star
        this.density = (Math.random() * 20) + 5;
        this.speedX = Math.random() * 0.8 - 0.4; // Natural drift
        this.speedY = Math.random() * 0.8 - 0.4;
        // White glowing colors like stars in space (brighter)
        this.color = `rgba(255, 255, 255, ${Math.random() * 0.5 + 0.5})`;
      }

      draw() {
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 18; // Increased for brighter glow
        ctx.shadowColor = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0; // Reset
      }

      update() {
        // Natural movement
        this.x += this.speedX;
        this.y += this.speedY;

        // Bounce off edges smoothly
        if (this.x < 0 || this.x > width) this.speedX *= -1;
        if (this.y < 0 || this.y > height) this.speedY *= -1;

        // Interactive mouse/touch repulsion
        if (mouse.x != null && mouse.y != null) {
          let dx = mouse.x - this.x;
          let dy = mouse.y - this.y;
          let distance = Math.sqrt(dx * dx + dy * dy);
          let forceDirectionX = dx / distance;
          let forceDirectionY = dy / distance;
          
          const maxDistance = mouse.radius;
          let force = (maxDistance - distance) / maxDistance;
          let directionX = forceDirectionX * force * this.density;
          let directionY = forceDirectionY * force * this.density;

          if (distance < mouse.radius) {
            this.x -= directionX;
            this.y -= directionY;
          }
        }
      }
    }

    function initParticles() {
      particles = [];
      const numberOfParticles = Math.min(Math.floor((width * height) / 8000), 120); // Responsive particle count
      for (let i = 0; i < numberOfParticles; i++) {
        particles.push(new Particle());
      }
    }

    function animate() {
      ctx.clearRect(0, 0, width, height);
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
      }
      requestAnimationFrame(animate);
    }

    let lastWidth = window.innerWidth;
    window.addEventListener('resize', () => {
      resize();
      // Hanya re-init partikel jika lebar layar berubah (seperti rotasi device)
      // agar bintang tidak berkedip/reset saat scroll di HP (karena address bar).
      if (window.innerWidth !== lastWidth) {
        lastWidth = window.innerWidth;
        initParticles();
      }
    });

    resize();
    initParticles();
    animate();
  }
});
