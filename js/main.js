const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('#nav-menu');
const header = document.querySelector('[data-header]');

if (navToggle && navMenu) {
  navToggle.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  navMenu.addEventListener('click', (event) => {
    if (event.target.matches('a')) {
      navMenu.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });
}

const syncHeader = () => {
  header?.classList.toggle('is-scrolled', window.scrollY > 12);
};

syncHeader();
window.addEventListener('scroll', syncHeader, { passive: true });


document.querySelectorAll('.services-grid .reveal, .case-list .reveal, .reveal-group > *, .hero__grid span').forEach((element, index) => {
  element.style.setProperty('--item-index', index);
});

const revealElements = document.querySelectorAll('.reveal, .reveal-group');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (reduceMotion || !('IntersectionObserver' in window)) {
  revealElements.forEach((element) => element.classList.add('is-visible'));
} else {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14 });

  revealElements.forEach((element) => revealObserver.observe(element));
}

document.querySelector('#current-year').textContent = new Date().getFullYear();
