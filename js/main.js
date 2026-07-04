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
  group.querySelectorAll('.reveal, .metric-item, .service-card, span, circle').forEach((element, index) => {
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


const contactLightScenes = document.querySelectorAll('[data-contact-light]');

if (contactLightScenes.length) {
  contactLightScenes.forEach((scene) => {
    const toggle = scene.querySelector('[data-contact-light-toggle]');

    const setContactLight = (isLit) => {
      scene.classList.toggle('is-lit', isLit);
      toggle?.setAttribute('aria-pressed', String(isLit));
    };

    setContactLight(false);

    toggle?.addEventListener('click', () => {
      setContactLight(!scene.classList.contains('is-lit'));
    });
  });
}

const elevatorWord = document.querySelector('[data-elevator-word]');
const elevatorScene = document.querySelector('[data-elevator-interaction]');
const heroPanel = document.querySelector('.hero__panel');
const whatsappUrl = heroPanel?.dataset.whatsappUrl;
const elevatorCtaMessage = 'Hacé click acá';
const elevatorSequences = [
  ['¿Estás listo?', 'Llevemos tu negocio', 'al siguiente nivel.', elevatorCtaMessage],
  ['Sigo acá.', 'Esperando tu mensaje.', elevatorCtaMessage],
  ['Tu negocio puede crecer.', 'Con estrategia, datos', 'y ejecución.', elevatorCtaMessage],
];

const getElevatorMessageLines = (message) => (
  message.length > 21 && message.includes(' ')
    ? message.replace(', ', ',|').split('|')
    : [message]
);

const setElevatorMessage = (message, { showCursor = false } = {}) => {
  if (!elevatorWord) return;

  if (elevatorScene) {
    elevatorScene.setAttribute('aria-label', `Mensaje del ascensor: ${message}`);
    elevatorScene.setAttribute('title', message);
  }

  elevatorWord.textContent = '';
  elevatorWord.classList.toggle('is-cta', message === elevatorCtaMessage);
  const lines = getElevatorMessageLines(message);

  lines.forEach((line, index) => {
    const tspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
    tspan.setAttribute('x', '70');
    tspan.setAttribute('dy', index === 0 ? (lines.length > 1 ? '-0.45em' : '0') : '1.16em');
    tspan.textContent = line;
    elevatorWord.appendChild(tspan);
  });

  if (showCursor) {
    const cursor = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
    cursor.classList.add('elevator-thought__cursor');
    cursor.textContent = '│';
    elevatorWord.appendChild(cursor);
  }
};

const setElevatorTypedMessage = (message, characterCount, { showCursor = true } = {}) => {
  if (!elevatorWord) return;

  const visibleMessage = message.slice(0, characterCount);
  const lines = getElevatorMessageLines(message);
  let remainingCharacters = visibleMessage.length;

  elevatorWord.textContent = '';
  elevatorWord.classList.toggle('is-cta', message === elevatorCtaMessage);

  lines.forEach((line, index) => {
    if (remainingCharacters <= 0 && index > 0) return;

    const tspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
    const lineText = line.slice(0, Math.max(0, Math.min(line.length, remainingCharacters)));

    tspan.setAttribute('x', '70');
    tspan.setAttribute('dy', index === 0 ? (lines.length > 1 ? '-0.45em' : '0') : '1.16em');
    tspan.textContent = lineText;
    elevatorWord.appendChild(tspan);

    remainingCharacters -= line.length;
  });

  if (elevatorScene) {
    elevatorScene.setAttribute('aria-label', `Mensaje del ascensor: ${visibleMessage || message}`);
    elevatorScene.setAttribute('title', visibleMessage || message);
  }

  if (showCursor) {
    const cursor = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
    cursor.classList.add('elevator-thought__cursor');
    cursor.textContent = '│';
    elevatorWord.appendChild(cursor);
  }
};

if (elevatorWord) {
  setElevatorMessage('¿Subimos?');
}

if (elevatorWord && elevatorScene) {
  let sequenceIndex = 0;
  let isPlaying = false;
  let isCtaReady = false;
  let activeTimeout;

  const openWhatsapp = () => {
    if (whatsappUrl) {
      window.open(whatsappUrl, '_blank', 'noopener');
    }
  };

  const waitElevator = (delay) => new Promise((resolve) => {
    activeTimeout = window.setTimeout(resolve, delay);
  });

  const typeElevatorMessage = async (message) => {
    if (reduceMotion) {
      setElevatorMessage(message);
      return;
    }

    setElevatorTypedMessage(message, 0);

    for (let characterCount = 1; characterCount <= message.length; characterCount += 1) {
      await waitElevator(34);
      setElevatorTypedMessage(message, characterCount);
    }
  };

  const playElevatorSequence = async () => {
    if (isCtaReady) {
      openWhatsapp();
      return;
    }

    if (isPlaying) return;

    isPlaying = true;
    isCtaReady = false;
    elevatorScene.classList.add('is-paused');
    elevatorScene.classList.remove('is-cta-ready');
    window.clearTimeout(activeTimeout);

    if (reduceMotion) {
      setElevatorMessage(elevatorCtaMessage);
      elevatorScene.classList.add('is-cta-ready');
      isCtaReady = true;
      isPlaying = false;
      sequenceIndex = (sequenceIndex + 1) % elevatorSequences.length;
      return;
    }

    const sequence = elevatorSequences[sequenceIndex];
    sequenceIndex = (sequenceIndex + 1) % elevatorSequences.length;

    for (const message of sequence) {
      await typeElevatorMessage(message);
      if (message === elevatorCtaMessage) {
        elevatorScene.classList.add('is-cta-ready');
        isCtaReady = true;
      }
      await waitElevator(message === elevatorCtaMessage ? 1700 : 760);
    }

    isPlaying = false;
    isCtaReady = false;
    elevatorScene.classList.remove('is-paused', 'is-cta-ready');
    setElevatorMessage('¿Subimos?');
  };

  elevatorScene.addEventListener('click', playElevatorSequence);
  elevatorScene.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      playElevatorSequence();
    }
  });
}


const servicesDeck = document.querySelector('[data-services-deck]');

if (servicesDeck) {
  const trigger = servicesDeck.querySelector('[data-services-trigger]');
  const cards = Array.from(servicesDeck.querySelectorAll('[data-service-card]'));
  let servicesRevealed = false;
  let isShuffling = false;

  const revealServices = () => {
    if (isShuffling) return;

    if (servicesRevealed) {
      servicesDeck.classList.add('is-acknowledging');
      window.setTimeout(() => servicesDeck.classList.remove('is-acknowledging'), 260);
      return;
    }

    servicesRevealed = true;
    trigger.textContent = 'Capacidades reveladas';
    trigger.setAttribute('aria-label', 'Capacidades reveladas');
    cards.forEach((card) => card.setAttribute('aria-pressed', 'true'));

    if (reduceMotion) {
      servicesDeck.classList.add('is-revealed');
      return;
    }

    isShuffling = true;
    servicesDeck.classList.add('is-shuffling');

    window.setTimeout(() => {
      servicesDeck.classList.remove('is-shuffling');
      servicesDeck.classList.add('is-revealed');
      isShuffling = false;
    }, 1040);
  };

  trigger?.addEventListener('click', revealServices);
  cards.forEach((card) => {
    card.setAttribute('aria-pressed', 'false');
    card.addEventListener('click', revealServices);
  });
}

const experienceMachine = document.querySelector('[data-experience-machine]');

if (experienceMachine) {
  const lever = experienceMachine.querySelector('[data-experience-lever]');
  const metrics = Array.from(experienceMachine.querySelectorAll('[data-final-value]'));
  let isRolling = false;
  let rollingTimers = [];

  const clearRollingTimers = () => {
    rollingTimers.forEach((timer) => window.clearTimeout(timer));
    rollingTimers = [];
  };

  const setMetricValue = (metric, value) => {
    const number = metric.querySelector('[data-rolling-number]');
    const accessibleValue = metric.querySelector('[data-metric-accessible]');
    if (number) number.textContent = value;
    if (accessibleValue) accessibleValue.textContent = value === '—' ? 'valor oculto' : `+${value}`;
  };

  const settleMetric = (metric) => {
    setMetricValue(metric, metric.dataset.finalValue);
    metric.classList.add('is-settled');
  };

  const rollExperienceMetrics = () => {
    if (isRolling || experienceMachine.classList.contains('is-revealed')) return;

    isRolling = true;
    clearRollingTimers();
    if (!experienceMachine.classList.contains('is-revealed')) {
      metrics.forEach((metric) => metric.classList.remove('is-settled'));
    }
    experienceMachine.classList.add('is-pulling', 'is-rolling');
    lever?.setAttribute('aria-pressed', 'true');

    if (reduceMotion) {
      metrics.forEach(settleMetric);
      experienceMachine.classList.add('is-revealed');
      experienceMachine.classList.remove('is-pulling', 'is-rolling');
      lever?.setAttribute('aria-pressed', 'false');
      isRolling = false;
      return;
    }

    const spinIntervals = metrics.map((metric, metricIndex) => window.setInterval(() => {
      const finalValue = Number(metric.dataset.finalValue || 0);
      const ceiling = Math.max(finalValue + 9, 24);
      const value = (Math.floor(Math.random() * ceiling) + metricIndex) % ceiling;
      setMetricValue(metric, value);
    }, 70));

    rollingTimers.push(window.setTimeout(() => {
      experienceMachine.classList.remove('is-pulling');
      lever?.setAttribute('aria-pressed', 'false');
    }, 520));

    metrics.forEach((metric, index) => {
      rollingTimers.push(window.setTimeout(() => {
        window.clearInterval(spinIntervals[index]);
        settleMetric(metric);

        if (index === metrics.length - 1) {
          experienceMachine.classList.remove('is-rolling');
          experienceMachine.classList.add('is-revealed');
          isRolling = false;
        }
      }, 980 + (index * 260)));
    });
  };

  lever?.setAttribute('aria-pressed', 'false');
  lever?.addEventListener('click', rollExperienceMetrics);
}

const currentYear = document.querySelector('#current-year');

if (currentYear) {
  currentYear.textContent = new Date().getFullYear();
}

const aboutTarget = document.querySelector('[data-about-target]');
const prizeModal = document.querySelector('[data-prize-modal]');
const prizeCloseButtons = document.querySelectorAll('[data-prize-close]');
const copyCodeButton = document.querySelector('[data-copy-code]');
const copyFeedback = document.querySelector('[data-copy-feedback]');
const prizeTitle = document.querySelector('[data-prize-title]');
const prizeDescription = document.querySelector('[data-prize-description]');
const prizeDiscount = document.querySelector('[data-prize-discount]');
const shotStatus = document.querySelector('[data-shot-status]');
const shotFeedback = document.querySelector('[data-shot-feedback]');
const aboutBoard = aboutTarget?.querySelector('.about-target__board');
const prizeCode = 'brunito007';
const maxShots = 1;
let lastFocusedElement = null;

if (aboutTarget && prizeModal) {
  const shots = [];

  const updateAim = (clientX, clientY) => {
    const rect = aboutTarget.getBoundingClientRect();
    const x = Math.min(Math.max(clientX - rect.left, 0), rect.width);
    const y = Math.min(Math.max(clientY - rect.top, 0), rect.height);
    aboutTarget.style.setProperty('--aim-x', `${(x / rect.width) * 100}%`);
    aboutTarget.style.setProperty('--aim-y', `${(y / rect.height) * 100}%`);
    aboutTarget.style.setProperty('--align-x', `${((x / rect.width) - 0.5) * 8}px`);
    aboutTarget.style.setProperty('--align-y', `${((y / rect.height) - 0.5) * 8}px`);
    return { x, y, rect };
  };

  const getBoardMetrics = (rect) => {
    const boardRect = aboutBoard?.getBoundingClientRect();

    if (!boardRect) {
      const boardSize = rect.width * 0.72;
      return { centerX: rect.width / 2, centerY: rect.height * 0.43, radius: boardSize / 2 };
    }

    return {
      centerX: boardRect.left - rect.left + boardRect.width / 2,
      centerY: boardRect.top - rect.top + boardRect.height / 2,
      radius: boardRect.width / 2,
    };
  };

  const getDiscountFromDistance = (distance, radius) => {
    const ratio = distance / radius;
    if (ratio <= 0.13) return 10;
    if (ratio <= 0.33) return 7;
    if (ratio <= 0.56) return 5;
    if (ratio <= 0.80) return 3;
    return 1;
  };

  const updateShotCopy = () => {
    if (shotStatus) shotStatus.textContent = shots.length >= maxShots ? 'Beneficio definido' : 'Intento único';
  };

  const openPrizeModal = (discount) => {
    lastFocusedElement = document.activeElement;
    if (prizeTitle) prizeTitle.textContent = 'Beneficio desbloqueado';
    if (prizeDiscount) prizeDiscount.textContent = `${discount}% OFF`;
    if (prizeDescription) prizeDescription.textContent = `Ganaste un ${discount}% de descuento en todos los servicios.`;
    prizeModal.hidden = false;
    document.body.style.overflow = 'hidden';
    prizeModal.querySelector('[data-copy-code]')?.focus();
  };

  const closePrizeModal = () => {
    prizeModal.hidden = true;
    document.body.style.overflow = '';
    if (copyFeedback) copyFeedback.textContent = '';
    lastFocusedElement?.focus?.();
  };

  const addImpact = (x, y, discount) => {
    const impact = document.createElement('span');
    impact.className = 'about-target__impact';
    impact.dataset.discount = `+${discount}%`;
    impact.style.left = `${x}px`;
    impact.style.top = `${y}px`;
    impact.setAttribute('aria-hidden', 'true');
    aboutTarget.appendChild(impact);
    return impact;
  };

  const completeGame = () => {
    const bestShot = shots.reduce((best, shot) => (shot.discount > best.discount ? shot : best), shots[0]);
    bestShot.impact.classList.add('is-best');
    aboutTarget.classList.add('is-complete');
    if (shotFeedback) shotFeedback.textContent = `Beneficio definido: ${bestShot.discount}% off`;
    window.setTimeout(() => openPrizeModal(bestShot.discount), reduceMotion ? 80 : 520);
  };

  window.resetBrunitoPrize = () => {
    shots.splice(0, shots.length);
    aboutTarget.querySelectorAll('.about-target__impact').forEach((impact) => impact.remove());
    aboutTarget.classList.remove('is-complete');
    if (shotFeedback) shotFeedback.textContent = 'Elegí tu tiro';
    updateShotCopy();
  };

  const fireAt = (clientX, clientY) => {
    if (shots.length >= maxShots) {
      if (shotFeedback) shotFeedback.textContent = 'Beneficio definido';
      return;
    }

    const { x, y, rect } = updateAim(clientX, clientY);
    const { centerX, centerY, radius } = getBoardMetrics(rect);
    const distance = Math.hypot(x - centerX, y - centerY);

    if (distance > radius) {
      if (shotFeedback) shotFeedback.textContent = 'Apuntá dentro del tablero';
      return;
    }

    const discount = getDiscountFromDistance(distance, radius);
    const impact = addImpact(x, y, discount);
    shots.push({ discount, impact });
    if (shotFeedback) shotFeedback.textContent = `Beneficio: ${discount}% off`;
    updateShotCopy();

    if (shots.length === maxShots) completeGame();
  };

  updateShotCopy();
  aboutTarget.addEventListener('pointerenter', () => aboutTarget.classList.add('is-aiming'));
  aboutTarget.addEventListener('pointerleave', () => aboutTarget.classList.remove('is-aiming'));
  aboutTarget.addEventListener('pointermove', (event) => updateAim(event.clientX, event.clientY));
  aboutTarget.addEventListener('click', (event) => fireAt(event.clientX, event.clientY));
  aboutTarget.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      const rect = aboutTarget.getBoundingClientRect();
      fireAt(rect.left + rect.width / 2, rect.top + rect.height * 0.43);
    }
  });

  prizeCloseButtons.forEach((button) => button.addEventListener('click', closePrizeModal));
  document.addEventListener('keydown', (event) => {
    if (prizeModal.hidden) return;
    if (event.key === 'Escape') {
      closePrizeModal();
      return;
    }
    if (event.key === 'Tab') {
      const focusableElements = Array.from(prizeModal.querySelectorAll('a[href], button:not([disabled])'));
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement?.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement?.focus();
      }
    }
  });

  copyCodeButton?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(prizeCode);
      if (copyFeedback) copyFeedback.textContent = 'Código copiado';
    } catch (error) {
      if (copyFeedback) copyFeedback.textContent = `Código: ${prizeCode}`;
    }
  });
}
