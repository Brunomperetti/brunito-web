// Controla el menú mobile sin usar librerías externas.
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('#nav-menu');

navToggle.addEventListener('click', () => {
  const isOpen = navMenu.classList.toggle('is-open');
  navToggle.setAttribute('aria-expanded', String(isOpen));
});

// Cierra el menú cuando se elige un enlace de navegación.
navMenu.addEventListener('click', (event) => {
  if (event.target.matches('a')) {
    navMenu.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
  }
});

// Actualiza automáticamente el año del footer.
document.querySelector('#current-year').textContent = new Date().getFullYear();
