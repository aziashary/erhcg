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
});
