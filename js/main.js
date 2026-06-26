document.documentElement.classList.add('js');
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

document.querySelectorAll('.services-grid, .case-list, .reveal-group, .hero__grid, .elevator-thought-bubbles').forEach((group) => {
  group.querySelectorAll('.reveal, .metric-item, span, circle').forEach((element, index) => {
    element.style.setProperty('--item-index', index);
    element.style.setProperty('--bubble-index', index);
  });
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
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.16 });

  revealElements.forEach((element) => revealObserver.observe(element));
}

const elevatorWord = document.querySelector('[data-elevator-word]');
const elevatorPassenger = document.querySelector('.elevator-passenger');
const elevatorWords = ['EMPRESAS', 'NEGOCIOS', 'EMPRENDEDORES', 'MARCAS'];

if (elevatorWord && elevatorPassenger && !reduceMotion) {
  let elevatorWordIndex = 0;

  elevatorPassenger.addEventListener('animationiteration', () => {
    elevatorWordIndex = (elevatorWordIndex + 1) % elevatorWords.length;
    elevatorWord.textContent = elevatorWords[elevatorWordIndex];
  });
}

const currentYear = document.querySelector('#current-year');

if (currentYear) {
  currentYear.textContent = new Date().getFullYear();
}
