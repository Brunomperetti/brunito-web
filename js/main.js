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
    const voucherTrigger = scene.querySelector('[data-contact-voucher-trigger]');
    const modal = scene.querySelector('[data-contact-benefit-modal]');
    const closeButtons = scene.querySelectorAll('[data-contact-benefit-close]');
    const copyButton = scene.querySelector('[data-contact-copy]');
    const focusableModalSelector = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
    let lastFocusedElement = null;

    const setModalOpen = (isOpen) => {
      scene.classList.toggle('is-voucher-open', isOpen);
      modal?.toggleAttribute('hidden', !isOpen);
      voucherTrigger?.setAttribute('aria-expanded', String(isOpen));

      if (isOpen) {
        lastFocusedElement = document.activeElement;
        window.setTimeout(() => {
          modal?.querySelector(focusableModalSelector)?.focus();
        }, 0);
        return;
      }

      if (lastFocusedElement instanceof HTMLElement) {
        lastFocusedElement.focus();
      }
    };

    const setContactLight = (isLit) => {
      scene.classList.toggle('is-lit', isLit);
      toggle?.setAttribute('aria-pressed', String(isLit));

      if (voucherTrigger) {
        voucherTrigger.tabIndex = isLit ? 0 : -1;
        voucherTrigger.setAttribute('aria-hidden', String(!isLit));
      }

      if (!isLit) {
        setModalOpen(false);
      }
    };

    setModalOpen(false);
    setContactLight(false);

    toggle?.addEventListener('click', () => {
      setContactLight(!scene.classList.contains('is-lit'));
    });

    voucherTrigger?.addEventListener('click', () => {
      if (!scene.classList.contains('is-lit')) return;

      setModalOpen(true);
    });

    closeButtons.forEach((button) => {
      button.addEventListener('click', () => setModalOpen(false));
    });

    modal?.addEventListener('click', (event) => {
      if (event.target === modal) {
        setModalOpen(false);
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && scene.classList.contains('is-voucher-open')) {
        setModalOpen(false);
      }
    });

    copyButton?.addEventListener('click', async () => {
      const code = copyButton.dataset.contactCopy || 'BRUNITO-DIAG';

      try {
        await navigator.clipboard.writeText(code);
        copyButton.textContent = 'Código copiado';
      } catch (error) {
        copyButton.textContent = code;
      }

      window.setTimeout(() => {
        copyButton.textContent = 'Copiar código';
      }, 2200);
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
    trigger.setAttribute('aria-expanded', 'true');
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
    const boardRect = aboutBoard?.getBoundingClientRect();
    const x = Math.min(Math.max(clientX - rect.left, 0), rect.width);
    const y = Math.min(Math.max(clientY - rect.top, 0), rect.height);
    const aimBounds = boardRect ? {
      left: boardRect.left - rect.left,
      top: boardRect.top - rect.top,
      width: boardRect.width,
      height: boardRect.height,
    } : { left: 0, top: 0, width: rect.width, height: rect.height };
    const aimX = Math.min(Math.max(x, aimBounds.left), aimBounds.left + aimBounds.width);
    const aimY = Math.min(Math.max(y, aimBounds.top), aimBounds.top + aimBounds.height);
    aboutTarget.style.setProperty('--aim-x', `${(aimX / rect.width) * 100}%`);
    aboutTarget.style.setProperty('--aim-y', `${(aimY / rect.height) * 100}%`);
    aboutTarget.style.setProperty('--align-x', `${((aimX / rect.width) - 0.5) * 6}px`);
    aboutTarget.style.setProperty('--align-y', `${((aimY / rect.height) - 0.5) * 6}px`);
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
    aboutTarget.querySelectorAll('.about-target__impact').forEach((previousImpact) => previousImpact.remove());
    impact.dataset.discount = `${discount}% OFF`;
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
    if (shotFeedback) shotFeedback.innerHTML = `Beneficio definido: <strong>${bestShot.discount}% OFF</strong>`;
    window.setTimeout(() => openPrizeModal(bestShot.discount), reduceMotion ? 80 : 520);
  };

  window.resetBrunitoPrize = () => {
    shots.splice(0, shots.length);
    aboutTarget.querySelectorAll('.about-target__impact').forEach((impact) => impact.remove());
    aboutTarget.classList.remove('is-complete');
    if (shotFeedback) shotFeedback.textContent = 'Beneficio por definir';
    updateShotCopy();
  };

  const fireAt = (clientX, clientY) => {
    if (shots.length >= maxShots) {
      if (shotFeedback) shotFeedback.textContent = 'Beneficio ya definido';
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
    if (shotFeedback) shotFeedback.innerHTML = `Beneficio definido: <strong>${discount}% OFF</strong>`;
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

const trajectoryItems = [
  { name: 'Betos San Carlos', wheelLabel: ['Betos'], category: 'Gastronomía local', work: 'Campañas Google Ads orientadas a llamadas, búsquedas locales y visibilidad en Google Maps.', services: 'Google Ads · Optimización local · Seguimiento de términos de búsqueda', closing: 'Estrategia aplicada a un objetivo concreto: generar más contacto local.' },
  { name: 'Pizza R', wheelLabel: ['Pizza R'], category: 'Gastronomía local', work: 'Campañas hiperlocales para llamadas, pedidos y presencia en Google Maps.', services: 'Google Ads · Estrategia local · Optimización de campañas', closing: 'Performance local pensada para convertir búsquedas cercanas en pedidos reales.' },
  { name: 'Rostock Autopartes', wheelLabel: ['Rostock'], category: 'Autopartes B2B', work: 'Campañas para distribuidores y casas de repuestos, con enfoque en generación de prospectos comerciales.', services: 'Meta Ads · Google Ads · Estrategia B2B', closing: 'Pauta y segmentación con lectura comercial para conversaciones de valor.' },
  { name: 'Millex', wheelLabel: ['Millex'], category: 'Mayorista de productos para mascotas', work: 'Comunicación comercial, segmentación, catálogo, automatizaciones y soporte a acciones B2B.', services: 'Estrategia · Datos · Automatización · Catálogo digital', closing: 'Orden digital para acompañar ventas mayoristas con más precisión.' },
  { name: 'Newrban', wheelLabel: ['Newrban'], category: 'Tecnología / notebooks', work: 'Campañas digitales para productos tecnológicos y acciones comerciales.', services: 'Meta Ads · Performance · Comunicación promocional', closing: 'Comunicación directa para mover productos tecnológicos en momentos comerciales.' },
  { name: 'Kiki', wheelLabel: ['Kiki'], category: 'Listas de precios / gestión comercial', work: 'Herramientas internas para gestión de precios, listas mayoristas/minoristas y exportaciones.', services: 'Desarrollo digital · Automatización · Datos', closing: 'Soluciones internas para reducir fricción operativa y ordenar información crítica.' },
  { name: 'Vicapa Campus', wheelLabel: ['Vicapa'], category: 'Educación digital', work: 'Desarrollo de campus virtual con roles, cursos, clases, alumnos y gestión administrativa.', services: 'Desarrollo web · Plataforma · UX · Backend', closing: 'Producto educativo estructurado para administrar contenidos, usuarios y operación.' },
  { name: 'Vocacion360', wheelLabel: ['Vocacion', '360'], category: 'Educación / orientación vocacional', work: 'Test vocacional online con resultados personalizados, dashboard admin y generación de informes.', services: 'Desarrollo web · Datos · Producto digital', closing: 'Una herramienta digital con lógica de datos para entregar resultados personalizados.' },
  { name: 'Hoyo 5', wheelLabel: ['Hoyo 5'], category: 'Inmobiliario / loteo', work: 'Estrategia de campaña, segmentación y anuncios orientados a consultas por WhatsApp.', services: 'Meta Ads · Estrategia · Pauta', closing: 'Campañas enfocadas en iniciar conversaciones calificadas sobre una oportunidad concreta.' },
  { name: 'Eco Coaching', wheelLabel: ['Eco', 'Coaching'], category: 'Formación / desarrollo personal', work: 'Estrategia de comunicación, segmentación y guiones para campaña.', services: 'Estrategia · Comunicación · Contenido', closing: 'Mensajes y segmentación alineados para presentar una propuesta formativa con claridad.' },
  { name: 'Azul Import', wheelLabel: ['Azul', 'Import'], category: 'Importación / accesorios para autos', work: 'Campañas Meta Ads para alfombras 3D orientadas a ventas por WhatsApp.', services: 'Meta Ads · Ecommerce social · Estrategia comercial', closing: 'Ecommerce social orientado a contacto directo y cierre por conversación.' },
  { name: 'MarcaData / brunito', wheelLabel: ['brunito'], category: 'Estudio digital propio', work: 'Sistema de posicionamiento, comunicación, web, automatizaciones y soluciones digitales.', services: 'Branding · Estrategia · Desarrollo · Datos', closing: 'La misma mirada integral aplicada al posicionamiento y la operación del estudio.' },
];

const trajectoryWheel = document.querySelector('[data-trajectory-wheel]');
const trajectorySpin = document.querySelector('[data-trajectory-spin]');
const trajectoryCard = document.querySelector('[data-trajectory-card]');

if (trajectoryWheel && trajectorySpin && trajectoryCard) {
  const fields = {
    name: trajectoryCard.querySelector('[data-trajectory-name]'),
    category: trajectoryCard.querySelector('[data-trajectory-category]'),
    work: trajectoryCard.querySelector('[data-trajectory-work]'),
    services: trajectoryCard.querySelector('[data-trajectory-services]'),
    closing: trajectoryCard.querySelector('[data-trajectory-closing]'),
  };
  const segmentAngle = 360 / trajectoryItems.length;
  let selectedIndex = -1;
  let currentRotation = 0;
  let isSpinning = false;

  const polarPoint = (radius, angle) => {
    const radians = (angle - 90) * Math.PI / 180;
    return [200 + radius * Math.cos(radians), 200 + radius * Math.sin(radians)];
  };

  const segmentPath = (startAngle, endAngle) => {
    const [x1, y1] = polarPoint(186, startAngle);
    const [x2, y2] = polarPoint(186, endAngle);
    const [x3, y3] = polarPoint(74, endAngle);
    const [x4, y4] = polarPoint(74, startAngle);
    return `M ${x1} ${y1} A 186 186 0 0 1 ${x2} ${y2} L ${x3} ${y3} A 74 74 0 0 0 ${x4} ${y4} Z`;
  };

  const drawTrajectoryWheel = () => {
    const segments = trajectoryItems.map((item, index) => {
      const start = index * segmentAngle;
      const end = start + segmentAngle;
      const middle = start + segmentAngle / 2;
      const [textX, textY] = polarPoint(132, middle);
      const [lineX1, lineY1] = polarPoint(190, start);
      const [lineX2, lineY2] = polarPoint(68, start);
      const lightSegment = index % 2 === 1;
      const segmentClass = lightSegment ? 'trajectory-segment--light' : 'trajectory-segment--dark';
      const labelClass = lightSegment ? 'trajectory-label--light' : 'trajectory-label--dark';
      const labelLines = item.wheelLabel || [item.name];
      const labelMarkup = labelLines.map((line) => `<span>${line}</span>`).join('');

      return `<path class="trajectory-segment ${segmentClass}" d="${segmentPath(start, end)}" />
        <line class="trajectory-dial-line" x1="${lineX1}" y1="${lineY1}" x2="${lineX2}" y2="${lineY2}" />
        <foreignObject class="trajectory-label-object" x="${textX - 39}" y="${textY - 17}" width="78" height="34">
          <div class="trajectory-label ${labelClass}" xmlns="http://www.w3.org/1999/xhtml">${labelMarkup}</div>
        </foreignObject>`;
    }).join('');

    trajectoryWheel.innerHTML = `<svg viewBox="0 0 400 400" role="img" aria-label="Rueda de trayectoria con clientes y proyectos" focusable="false">
      <circle class="trajectory-outer-ring" cx="200" cy="200" r="190" />
      ${segments}
      <circle class="trajectory-inner-ring" cx="200" cy="200" r="74" />
    </svg>`;
  };

  const updateTrajectoryCard = (item) => {
    fields.name.textContent = item.name;
    fields.category.textContent = item.category;
    fields.work.textContent = item.work;
    fields.services.textContent = item.services;
    fields.closing.textContent = item.closing;
    trajectoryCard.classList.remove('is-updating');
    void trajectoryCard.offsetWidth;
    trajectoryCard.classList.add('is-updating');
  };

  const getNextIndex = () => {
    if (trajectoryItems.length < 2) return 0;
    let nextIndex = selectedIndex;
    while (nextIndex === selectedIndex) {
      nextIndex = Math.floor(Math.random() * trajectoryItems.length);
    }
    return nextIndex;
  };

  const spinTrajectory = () => {
    if (isSpinning) return;
    isSpinning = true;
    trajectorySpin.disabled = true;
    trajectorySpin.textContent = 'Girando...';

    const nextIndex = getNextIndex();
    const targetMiddle = nextIndex * segmentAngle + segmentAngle / 2;
    const baseTurns = reduceMotion ? 0 : 4;
    currentRotation += (baseTurns * 360) + (360 - ((currentRotation + targetMiddle) % 360));
    trajectoryWheel.style.setProperty('--trajectory-rotation', `${currentRotation}deg`);

    window.setTimeout(() => {
      selectedIndex = nextIndex;
      updateTrajectoryCard(trajectoryItems[selectedIndex]);
      trajectorySpin.disabled = false;
      trajectorySpin.textContent = 'Ver otro trabajo';
      isSpinning = false;
    }, reduceMotion ? 80 : 2450);
  };

  drawTrajectoryWheel();
  trajectorySpin.addEventListener('click', spinTrajectory);
}
