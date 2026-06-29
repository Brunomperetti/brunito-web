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
    if (number) number.textContent = value;
  };

  const settleMetric = (metric) => {
    setMetricValue(metric, metric.dataset.finalValue);
    metric.classList.add('is-settled');
  };

  const rollExperienceMetrics = () => {
    if (isRolling) return;

    isRolling = true;
    clearRollingTimers();
    metrics.forEach((metric) => metric.classList.remove('is-settled'));
    experienceMachine.classList.add('is-pulling', 'is-rolling');
    lever?.setAttribute('aria-pressed', 'true');

    if (reduceMotion) {
      metrics.forEach(settleMetric);
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
          isRolling = false;
        }
      }, 980 + (index * 260)));
    });
  };

  lever?.setAttribute('aria-pressed', 'false');
  lever?.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    rollExperienceMetrics();
  });

  lever?.addEventListener('click', (event) => {
    if (event.detail === 0) rollExperienceMetrics();
  });
}

const currentYear = document.querySelector('#current-year');

if (currentYear) {
  currentYear.textContent = new Date().getFullYear();
}
