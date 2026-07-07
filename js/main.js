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

    if (modal && modal.parentElement !== document.body) {
      document.body.appendChild(modal);
    }

    const setModalOpen = (isOpen) => {
      scene.classList.toggle('is-voucher-open', isOpen);
      modal?.toggleAttribute('hidden', !isOpen);
      document.body.classList.toggle('is-contact-modal-open', isOpen);
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

    modal?.addEventListener('keydown', (event) => {
      if (event.key !== 'Tab') return;

      const focusableElements = Array.from(modal.querySelectorAll(focusableModalSelector))
        .filter((element) => element instanceof HTMLElement && !element.hasAttribute('disabled'));
      const firstElement = focusableElements[0];
      const lastElement = focusableElements.at(-1);

      if (!firstElement || !lastElement) return;

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }

      if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
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
  let servicesObserver;

  const setServicesRevealedState = () => {
    trigger.textContent = 'Servicios revelados';
    trigger.setAttribute('aria-label', 'Servicios revelados');
    trigger.setAttribute('aria-expanded', 'true');
    trigger.setAttribute('aria-pressed', 'true');
    cards.forEach((card) => card.setAttribute('aria-pressed', 'true'));
  };

  const revealServices = () => {
    if (servicesRevealed) {
      servicesDeck.classList.add('is-acknowledging');
      window.setTimeout(() => servicesDeck.classList.remove('is-acknowledging'), 260);
      return;
    }

    servicesRevealed = true;
    servicesObserver?.disconnect();
    setServicesRevealedState();
    servicesDeck.classList.add('is-revealed');
  };

  trigger?.addEventListener('click', revealServices);
  cards.forEach((card) => {
    card.setAttribute('aria-pressed', 'false');
    card.addEventListener('click', revealServices);
  });

  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealServices();
  } else {
    servicesObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) revealServices();
      });
    }, { threshold: 0.28, rootMargin: '0px 0px -8% 0px' });

    servicesObserver.observe(servicesDeck);
  }
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
  { shortName: 'Intel', title: 'Intel – Classmate PC', context: 'Campaña desarrollada en KP Alazraki', role: 'Creativo Senior', work: 'Planeamiento creativo, concepto de campaña, redacción publicitaria y presentación estratégica a cliente.', focus: 'Creatividad, planning y comunicación de producto.' },
  { shortName: 'MTV', title: 'MTV / Premios MTV México', context: 'Premios MTV Guadalajara 2008', role: 'Asistente de Producción', work: 'Asistencia operativa en producción del evento, organización de alfombra roja, soporte de coordinación y acompañamiento para el desarrollo general de la jornada.', focus: 'Producción de evento, coordinación operativa y soporte en campo.' },
  { shortName: 'Mis 15', title: 'Mis Dulces 15', context: 'Programa televisivo MTV', role: 'Producción audiovisual', work: 'Asistencia de producción para contenido televisivo.', focus: 'Contenido, producción y storytelling.' },
  { shortName: 'Fade In', title: 'Fade In', context: 'Productora audiovisual en Guadalajara, México', role: 'Área de Dirección y Guión', work: 'Desarrollo de guiones, asistencia de dirección y dirección puntual de producciones audiovisuales.', focus: 'Guion, dirección audiovisual y producción.' },
  { shortName: 'Karakola', title: 'Karakola / Canal Mexiquense', context: 'Programa infantil cultural', role: 'Guionista / Dirección', work: 'Dirección y redacción de 143 guiones para temporada completa.', focus: 'Contenido televisivo, narrativa y producción.' },
  { shortName: 'Gob. Tepic', title: 'Gobierno de Tepic / Nayarit', context: 'Campañas públicas', role: 'Dirección / Preproducción', work: 'Campañas PAR, Antitabaco y spots de TV para comunicación pública.', focus: 'Comunicación institucional, dirección audiovisual y campaña pública.' },
  { shortName: 'Ayto. GDL', title: 'Ayuntamiento de Guadalajara', context: 'Comunicación institucional', role: 'Dirección / Asistencia de Dirección', work: 'Campañas Logros y Tú eliges, radio spot y comercial audiovisual.', focus: 'Comunicación pública, producción y creatividad.' },
  { shortName: 'UAG', title: 'Universidad Autónoma de Guadalajara', context: 'Cliente en KP Alazraki', role: 'Creativo Senior', work: 'Planeamiento creativo, redacción y desarrollo de campaña publicitaria.', focus: 'Educación, creatividad y comunicación institucional.' },
  { shortName: 'Tajín', title: 'Tajín', context: 'Cliente en KP Alazraki', role: 'Creativo Senior', work: 'Creatividad publicitaria, desarrollo conceptual y comunicación de marca.', focus: 'Marca, mensaje y comunicación comercial.' },
  { shortName: 'Vicapa MKT', title: 'Vicapa MKT', context: 'Marketing digital / cuentas B2B y B2C', role: 'Paid Media Senior & Growth Automation Specialist', work: 'Gestión estratégica y operativa de campañas publicitarias, desarrollo de activos digitales y automatización de procesos comerciales.', focus: 'Meta Ads, performance, leads, WhatsApp, activos digitales y automatización comercial.' },
  { shortName: 'GW', title: 'GW Argentina', context: 'Telecomunicaciones B2B', role: 'Responsable de Marketing', work: 'Google Ads, atención de clientes, estrategia digital, piezas comerciales, email marketing, stands y gestión de medios.', focus: 'Adquisición, comunicación comercial y soporte a ventas.' },
  { shortName: 'Millex', title: 'Millex', context: 'Mayorista mascotas B2B/B2C', role: 'Responsable de Marketing y Datos', work: 'Campañas, CRM, segmentación, email marketing, catálogo digital y acciones comerciales.', focus: 'Growth, performance, datos y operación comercial.' },
  { shortName: 'Petsu', title: 'Petsu', context: 'Mascotas / B2C', role: 'Marketing / Paid Media', work: 'Meta Ads, estrategia comercial, email marketing y comunicación digital.', focus: 'Performance, marca y captación.' },
  { shortName: 'Rostock', title: 'Rostock', context: 'Autopartes B2B', role: 'Marketing / Paid Media', work: 'Google Ads, Meta Ads y generación de prospectos para distribuidores y casas de repuestos.', focus: 'Performance B2B y captación comercial.' },
  { shortName: 'Pizza R', title: 'Pizza R', context: 'Gastronomía local', role: 'Paid Media Specialist', work: 'Google Ads orientado a llamadas, pedidos, búsquedas locales y Google Maps.', focus: 'Captación hiperlocal y optimización.' },
  { shortName: 'Betos', title: 'Betos San Carlos', context: 'Gastronomía local', role: 'Paid Media Specialist', work: 'Google Ads para llamadas, búsquedas locales y visibilidad de sucursal.', focus: 'Performance local y contacto inmediato.' },
  { shortName: 'Kiki', title: 'Kiki Market', context: 'Retail / gestión comercial', role: 'Paid Media + Soluciones Digitales', work: 'Google Ads, Meta Ads y herramientas para listas de precios, promociones y gestión comercial.', focus: 'Performance y eficiencia operativa.' },
  { shortName: 'Azul', title: 'Azul Importación', context: 'Accesorios importados para autos', role: 'Paid Media Specialist', work: 'Meta Ads para alfombras 3D orientadas a ventas por WhatsApp.', focus: 'Campañas de conversión y venta directa.' },
  { shortName: 'Puerta Mundial', title: 'Puerta Mundial', context: 'Minería / construcción / maquinaria', role: 'Paid Media Specialist', work: 'Google Ads y Meta Ads para captación de consultas calificadas.', focus: 'Tráfico calificado y captación comercial.' },
  { shortName: 'Vocacion360', title: 'Vocacion360', context: 'Producto digital educativo', role: 'Estrategia + Desarrollo Digital', work: 'Test vocacional gratuito, experiencia web y resultados personalizados.', focus: 'Producto digital, datos y experiencia de usuario.' },
  { shortName: 'Metamorfosis', title: 'Metamorfosis 360', context: 'Agencia / comunicación 360', role: 'Director Creativo', work: 'Estrategia publicitaria, dirección creativa, coordinación de equipos y campañas digitales.', focus: 'Creatividad, planning y coherencia de marca.' },
  { shortName: 'Nutrixya', title: 'Nutrixya', context: 'Startup AgTech', role: 'Marketing / Branding', work: 'Identidad visual, WordPress, SEO técnico, contenidos y posicionamiento.', focus: 'Marca, adquisición y generación de demanda.' },
  { shortName: 'Sportcom', title: 'Sportcom', context: 'Marketing y comunicación', role: 'Responsable de Marketing', work: 'Estrategias de comunicación, campañas digitales y automatizaciones de marketing.', focus: 'Captación, retención y marketing operativo.' },
  { shortName: 'Eco C. Paz', title: 'Eco Coaching Carlos Paz', context: 'Formación / desarrollo personal', role: 'Paid Media Specialist', work: 'Campaña de Meta Ads orientada a difusión, alcance y captación de consultas para la propuesta de formación.', focus: 'Meta Ads, segmentación y pauta digital.' },
  { shortName: 'Eco V. María', title: 'Eco Coaching Villa María', context: 'Formación / desarrollo personal', role: 'Estrategia + Paid Media', work: 'Estrategia de comunicación, edición de video y campañas Meta Ads.', focus: 'Comunicación, contenido y pauta.' },
  { shortName: 'B. Minetti', title: 'Bartolomé Minetti & Asoc.', context: 'Inmobiliario / Proyecto Hoyo 5', role: 'Paid Media Specialist', work: 'Estrategia de campaña, segmentación y anuncios orientados a consultas por WhatsApp.', focus: 'Leads inmobiliarios y performance local.' },
];

const trajectoryWheel = document.querySelector('[data-trajectory-wheel]');
const trajectorySpin = document.querySelector('[data-trajectory-spin]');
const trajectoryCard = document.querySelector('[data-trajectory-card]');

if (trajectoryWheel && trajectorySpin && trajectoryCard) {
  const fields = {
    name: trajectoryCard.querySelector('[data-trajectory-name]'),
    context: trajectoryCard.querySelector('[data-trajectory-context]'),
    role: trajectoryCard.querySelector('[data-trajectory-role]'),
    work: trajectoryCard.querySelector('[data-trajectory-work]'),
    focus: trajectoryCard.querySelector('[data-trajectory-focus]'),
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
      const labelToneClass = lightSegment ? 'trajectory-label--light' : 'trajectory-label--dark';
      const labelSizeClass = item.shortName.length >= 12 ? 'trajectory-label--long' : item.shortName.length >= 9 ? 'trajectory-label--medium' : '';
      const textAngle = middle - 90;
      const normalizedAngle = (textAngle + 360) % 360;
      const readableAngle = normalizedAngle > 90 && normalizedAngle < 270 ? textAngle + 180 : textAngle;
      const labelLines = item.shortName.split(' ');
      const labelMarkup = labelLines.map((line) => `<span>${line}</span>`).join('');

      return `<path class="trajectory-segment ${segmentClass}" d="${segmentPath(start, end)}" />
        <line class="trajectory-dial-line" x1="${lineX1}" y1="${lineY1}" x2="${lineX2}" y2="${lineY2}" />
        <g class="trajectory-label-group" transform="translate(${textX} ${textY}) rotate(${readableAngle})">
          <foreignObject class="trajectory-label-object" x="-47" y="-15" width="94" height="30">
            <div class="trajectory-label ${labelToneClass} ${labelSizeClass}" xmlns="http://www.w3.org/1999/xhtml">${labelMarkup}</div>
          </foreignObject>
        </g>`;
    }).join('');

    trajectoryWheel.innerHTML = `<svg viewBox="0 0 400 400" role="img" aria-label="Rueda de trayectoria con clientes y proyectos" focusable="false">
      <circle class="trajectory-outer-ring" cx="200" cy="200" r="190" />
      ${segments}
      <circle class="trajectory-inner-ring" cx="200" cy="200" r="74" />
    </svg>`;
  };

  const updateTrajectoryCard = (item) => {
    fields.name.textContent = item.title;
    fields.context.textContent = item.context;
    fields.role.textContent = item.role;
    fields.work.textContent = item.work;
    fields.focus.textContent = item.focus;
    fields.closing.textContent = 'Cada giro revela una experiencia concreta.';
    trajectoryCard.classList.remove('is-updating');
    void trajectoryCard.offsetWidth;
    trajectoryCard.classList.add('is-updating');
  };

  let remainingTrajectoryIndexes = [];

  const shuffleArray = (array) => {
    for (let index = array.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [array[index], array[randomIndex]] = [array[randomIndex], array[index]];
    }
    return array;
  };

  const refillTrajectoryBag = () => {
    remainingTrajectoryIndexes = trajectoryItems.map((_, index) => index);
    shuffleArray(remainingTrajectoryIndexes);
  };

  const getNextIndex = () => {
    if (!remainingTrajectoryIndexes.length) {
      refillTrajectoryBag();
    }

    return remainingTrajectoryIndexes.pop();
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

  refillTrajectoryBag();
  drawTrajectoryWheel();
  trajectorySpin.addEventListener('click', spinTrajectory);
}
