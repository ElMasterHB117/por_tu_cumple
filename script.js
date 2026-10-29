const STORAGE_KEY = "universo-jennifer-progress-v1";
const TOTAL_STARS = 6;

const starMessages = {
  1: { kicker: "Primera luz", title: "Tu forma de iluminar", message: "Hay algo muy tuyo en la manera en que vuelves más cálidos los lugares y más ligeros los días. Esa luz merece ser celebrada." },
  2: { kicker: "Segunda luz", title: "Los pequeños momentos", message: "Guardo con cariño esas conversaciones, risas y silencios que quizá parecían sencillos, pero terminaron significando mucho." },
  3: { kicker: "Tercera luz", title: "Que este año te encuentre", message: "Ojalá la vida te sorprenda con calma, alegría y caminos bonitos; con todo aquello que te haga sentir tan especial como eres." },
  4: { kicker: "Cuarta luz", title: "Tu manera de ser", message: "Admiro la autenticidad con la que habitas el mundo. No necesitas esforzarte para destacar: hay una belleza serena en ser exactamente quien eres." },
  5: { kicker: "Quinta luz", title: "Todo lo que viene", message: "Deseo que encuentres motivos nuevos para sonreír, sueños que te entusiasmen y personas que sepan cuidar la confianza que les regalas." },
  6: { kicker: "Sexta luz", title: "Hoy celebro que existes", message: "En tu cumpleaños quiero recordarte algo sencillo: tu presencia importa, deja huella y hace más bonito el universo de quienes tenemos la fortuna de conocerte." },
  7: { kicker: "La séptima estrella", title: "La luz que faltaba", message: "Las otras estrellas guardaban deseos y recuerdos. Esta última guarda algo más sencillo: la alegría de que existas y de poder celebrar un año más de tu historia." },
};

const starPhotos = {
  1: {
    src: "assets/fotos/estrella-1.jpg",
    alt: "Jenifer con lentes transparentes y una blusa clara.",
    position: "62% 42%",
    accent: "76, 142, 194",
  },
  3: {
    src: "assets/fotos/estrella-3.jpg",
    alt: "Jenifer sonriendo con un suéter rosa.",
    position: "54% 38%",
    accent: "196, 117, 146",
  },
  6: {
    src: "assets/fotos/estrella-6.jpg",
    alt: "Retrato de Jenifer con una blusa blanca.",
    position: "50% 40%",
    accent: "151, 139, 186",
  },
};

const letterPhotoConfig = {
  src: "assets/fotos/carta-principal.jpg",
  alt: "Retrato de Jenifer elegido para la carta final.",
  position: "64% 44%",
  accent: "122, 92, 174",
};

const state = readProgress();
const dialog = document.querySelector("#messageDialog");
const dialogClose = document.querySelector("#dialogClose");
const dialogContinue = document.querySelector("#dialogContinue");
const dialogKicker = document.querySelector("#dialogKicker");
const dialogTitle = document.querySelector("#dialogTitle");
const dialogMessage = document.querySelector("#dialogMessage");
const dialogPhotoFrame = document.querySelector("#dialogPhotoFrame");
const dialogPhoto = document.querySelector("#dialogPhoto");
const letterDialog = document.querySelector("#letterDialog");
const letterClose = document.querySelector("#letterClose");
const letterPhotoFrame = document.querySelector("#letterPhotoFrame");
const letterPhoto = document.querySelector("#letterPhoto");
const letterButton = document.querySelector("#letterButton");
const letterButtonLabel = document.querySelector("#letterButtonLabel");
const progressLabel = document.querySelector("#progressLabel");
const progressBar = document.querySelector("#progressBar");
const progressTrack = document.querySelector(".progress-track");
const resetButton = document.querySelector("#resetButton");
const announcement = document.querySelector("#announcement");
const shootingStar = document.querySelector("#shootingStar");
const stageNote = document.querySelector("#stageNote");
const closingCopy = document.querySelector("#closingCopy");
const seventhStar = document.querySelector("#seventhStar");
const soundButton = document.querySelector("#soundButton");
const soundButtonLabel = document.querySelector("#soundButtonLabel");
const constellation = document.querySelector(".constellation");
const starButtons = [...document.querySelectorAll("[data-star]")];
let activeStarId = null;
let pendingFinalReveal = false;

function readProgress() {
  const emptyState = { discovered: [], shootingStarSeen: false, finalStarDiscovered: false, letterOpened: false, soundEnabled: true };
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (Array.isArray(parsed)) return { ...emptyState, discovered: sanitizeStars(parsed) };
    if (!parsed || !Array.isArray(parsed.discovered)) return emptyState;
    return {
      discovered: sanitizeStars(parsed.discovered),
      shootingStarSeen: Boolean(parsed.shootingStarSeen),
      finalStarDiscovered: Boolean(parsed.finalStarDiscovered),
      letterOpened: Boolean(parsed.letterOpened),
      soundEnabled: parsed.soundEnabled !== false,
    };
  } catch {
    return emptyState;
  }
}

function sanitizeStars(stars) {
  return [...new Set(stars)].filter((id) => Number.isInteger(id) && id >= 1 && id <= TOTAL_STARS);
}

function saveProgress() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

const AudioEngine = (() => {
  let audioContext = null;

  function context() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;
    if (!audioContext) audioContext = new AudioContextClass();
    if (audioContext.state === "suspended") audioContext.resume();
    return audioContext;
  }

  function tone(frequency, delay, duration, volume = 0.035, type = "sine", pan = 0) {
    if (!state.soundEnabled) return;
    const ctx = context();
    if (!ctx) return;
    const start = ctx.currentTime + delay;
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(gain);
    if (typeof ctx.createStereoPanner === "function") {
      const panner = ctx.createStereoPanner();
      panner.pan.value = pan;
      gain.connect(panner).connect(ctx.destination);
    } else {
      gain.connect(ctx.destination);
    }
    oscillator.start(start);
    oscillator.stop(start + duration + 0.04);
  }

  function star(id = 1) {
    const roots = [523.25, 587.33, 659.25, 698.46, 783.99, 880];
    const pans = [-0.72, -0.12, 0.72, 0.48, -0.48, 0];
    const root = roots[(id - 1) % roots.length];
    const pan = pans[(id - 1) % pans.length];
    tone(root, 0, 0.55, 0.032, "sine", pan);
    tone(root * 1.5, 0.09, 0.7, 0.022, "triangle", pan);
    tone(root * 2, 0.19, 0.8, 0.014, "sine", pan);
  }

  function shooting() {
    if (!state.soundEnabled) return;
    const ctx = context();
    if (!ctx) return;
    const duration = 1.15;
    const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * duration), ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let index = 0; index < data.length; index += 1) {
      const progress = index / data.length;
      data[index] = (Math.random() * 2 - 1) * Math.sin(Math.PI * progress) * 0.28;
    }
    const source = ctx.createBufferSource();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();
    const now = ctx.currentTime;
    source.buffer = buffer;
    filter.type = "bandpass";
    filter.Q.value = 0.8;
    filter.frequency.setValueAtTime(650, now);
    filter.frequency.exponentialRampToValueAtTime(4200, now + duration);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.025, now + 0.18);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    source.connect(filter).connect(gain).connect(ctx.destination);
    source.start(now);
    source.stop(now + duration);
  }

  function completion() {
    [523.25, 659.25, 783.99, 1046.5].forEach((note, index) => tone(note, index * 0.1, 1.15, 0.024, index % 2 ? "triangle" : "sine"));
  }

  function secret() {
    [392, 523.25, 659.25, 987.77].forEach((note, index) => tone(note, index * 0.13, 1.25, 0.026, "sine"));
  }

  function letter() {
    [659.25, 783.99, 1046.5].forEach((note, index) => tone(note, index * 0.14, 0.95, 0.021, "triangle"));
  }

  return { star, shooting, completion, secret, letter };
})();

function updateSoundButton() {
  const supported = Boolean(window.AudioContext || window.webkitAudioContext);
  soundButton.disabled = !supported;
  soundButton.setAttribute("aria-pressed", String(state.soundEnabled && supported));
  soundButtonLabel.textContent = supported ? (state.soundEnabled ? "Sonido activado" : "Sonido silenciado") : "Sonido no disponible";
}

function updateInterface() {
  const count = state.discovered.length;
  const complete = count === TOTAL_STARS;
  progressLabel.textContent = `${count} de ${TOTAL_STARS} estrellas descubiertas`;
  progressTrack.setAttribute("aria-valuenow", String(count));
  progressBar.style.width = `${(count / TOTAL_STARS) * 100}%`;
  constellation.dataset.progress = String(count);
  resetButton.hidden = count === 0 && !state.finalStarDiscovered;

  starButtons.forEach((button) => {
    const id = Number(button.dataset.star);
    const discovered = state.discovered.includes(id);
    button.classList.toggle("is-discovered", discovered);
    button.setAttribute("aria-pressed", String(discovered));
  });

  seventhStar.hidden = !complete || pendingFinalReveal;
  seventhStar.classList.toggle("is-revealed", complete);
  seventhStar.classList.toggle("is-discovered", state.finalStarDiscovered);
  seventhStar.setAttribute("aria-pressed", String(state.finalStarDiscovered));
  letterButton.hidden = !state.finalStarDiscovered;
  letterButtonLabel.textContent = state.letterOpened ? "Volver a leer la carta" : "Abrir la carta final";

  if (!complete) {
    stageNote.textContent = "Las seis luces están disponibles · Descúbrelas en el orden que quieras.";
    closingCopy.textContent = "Completa la constelación y encuentra la luz que no aparece en ningún mapa.";
  } else if (!state.finalStarDiscovered) {
    stageNote.textContent = "Constelación completa · Ha aparecido una séptima luz.";
    closingCopy.textContent = "La última estrella ya está esperando en la constelación.";
  } else {
    stageNote.textContent = "Las siete luces están reunidas · La carta final es tuya.";
    closingCopy.textContent = state.letterOpened ? "Esta carta seguirá aquí siempre que quieras volver a leerla." : "La séptima estrella ha revelado una carta para ti.";
  }
  updateSoundButton();
}

function fillMessage(id) {
  const content = starMessages[id];
  const photo = starPhotos[id];
  dialogKicker.textContent = content.kicker;
  dialogTitle.textContent = content.title;
  dialogMessage.textContent = content.message;
  dialogContinue.textContent = id === 7 ? "Encontrar la carta" : "Volver al cielo";

  applyPhoto(dialogPhotoFrame, dialogPhoto, photo);
}

function applyPhoto(frame, image, photo) {
  frame.hidden = true;
  image.removeAttribute("src");
  image.alt = "";
  if (!photo) return;

  frame.style.setProperty("--photo-position", photo.position || "50% 50%");
  frame.style.setProperty("--photo-accent-rgb", photo.accent || "169, 142, 232");
  frame.style.setProperty("--photo-shift-x", "0px");
  frame.style.setProperty("--photo-shift-y", "0px");
  image.alt = photo.alt;
  image.onload = () => { frame.hidden = false; };
  image.onerror = () => { frame.hidden = true; };
  image.src = photo.src;

  if (image.complete && image.naturalWidth > 0) frame.hidden = false;
}

function initializePhotoPreloading() {
  const photoSources = [...Object.values(starPhotos), letterPhotoConfig];
  let hasPreloaded = false;

  const preloadPhotos = () => {
    if (hasPreloaded) return;
    hasPreloaded = true;
    photoSources.forEach(({ src }) => {
      const preloadImage = new Image();
      preloadImage.decoding = "async";
      preloadImage.src = src;
    });
  };

  if (!("IntersectionObserver" in window)) {
    if ("requestIdleCallback" in window) window.requestIdleCallback(preloadPhotos, { timeout: 1800 });
    else window.setTimeout(preloadPhotos, 700);
    return;
  }

  const photoObserver = new IntersectionObserver(
    (entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      preloadPhotos();
      photoObserver.disconnect();
    },
    { rootMargin: "500px 0px" },
  );
  photoObserver.observe(constellation);
}

function initializePhotoParallax() {
  [dialogPhotoFrame, letterPhotoFrame].forEach((frame) => {
    frame.addEventListener(
      "pointermove",
      (event) => {
        const bounds = frame.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width - 0.5;
        const y = (event.clientY - bounds.top) / bounds.height - 0.5;
        frame.style.setProperty("--photo-shift-x", `${x * -9}px`);
        frame.style.setProperty("--photo-shift-y", `${y * -7}px`);
      },
      { passive: true },
    );
    frame.addEventListener("pointerleave", () => {
      frame.style.setProperty("--photo-shift-x", "0px");
      frame.style.setProperty("--photo-shift-y", "0px");
    });
  });
}

function openStar(id) {
  if (!starMessages[id]) return;
  const activeButton = starButtons.find((button) => Number(button.dataset.star) === id);
  const isNew = !state.discovered.includes(id);
  let reachedHalfway = false;
  let completedConstellation = false;

  if (isNew) {
    state.discovered.push(id);
    state.discovered.sort((a, b) => a - b);
    reachedHalfway = state.discovered.length === 3 && !state.shootingStarSeen;
    completedConstellation = state.discovered.length === TOTAL_STARS;
    if (completedConstellation) pendingFinalReveal = true;
    if (reachedHalfway) {
      state.shootingStarSeen = true;
      triggerShootingStar();
    }
    saveProgress();
    updateInterface();
    activeButton?.classList.add("just-discovered");
    setTimeout(() => activeButton?.classList.remove("just-discovered"), 900);
    announcement.textContent = reachedHalfway
      ? `Estrella ${id} descubierta. Una estrella fugaz cruzó el cielo. 3 de ${TOTAL_STARS}.`
      : completedConstellation
        ? "Constelación completa. El cielo guarda una última sorpresa."
        : `Estrella ${id} descubierta. ${state.discovered.length} de ${TOTAL_STARS}.`;
  }

  AudioEngine.star(id);
  if (reachedHalfway) setTimeout(() => AudioEngine.shooting(), 220);
  if (completedConstellation) setTimeout(() => AudioEngine.completion(), 300);
  activeButton?.classList.add("is-opening");
  constellation.classList.add("is-pulsing");
  setTimeout(() => activeButton?.classList.remove("is-opening"), 760);
  setTimeout(() => constellation.classList.remove("is-pulsing"), 1950);
  activeStarId = id;
  fillMessage(id);
  setTimeout(() => {
    if (!dialog.open) dialog.showModal();
  }, 420);
}

function openSeventhStar() {
  if (state.discovered.length !== TOTAL_STARS) return;
  if (!state.finalStarDiscovered) {
    state.finalStarDiscovered = true;
    saveProgress();
    updateInterface();
    announcement.textContent = "Séptima estrella descubierta. La carta final está disponible.";
  }
  AudioEngine.secret();
  seventhStar.classList.add("is-opening");
  constellation.classList.add("is-pulsing");
  setTimeout(() => seventhStar.classList.remove("is-opening"), 760);
  setTimeout(() => constellation.classList.remove("is-pulsing"), 1950);
  activeStarId = 7;
  fillMessage(7);
  setTimeout(() => {
    if (!dialog.open) dialog.showModal();
  }, 420);
}

function closeMessageDialog() {
  const shouldRevealLetter = activeStarId === 7;
  const shouldRevealFinalStar = activeStarId === 6 && pendingFinalReveal;
  dialog.close();
  activeStarId = null;
  if (shouldRevealFinalStar) {
    pendingFinalReveal = false;
    updateInterface();
    constellation.classList.add("is-completing");
    setTimeout(() => constellation.classList.remove("is-completing"), 2720);
    announcement.textContent = "El cielo ha cambiado. Una séptima estrella acaba de aparecer.";
  }
  if (shouldRevealLetter) letterButton.focus();
}

function openLetter() {
  state.letterOpened = true;
  saveProgress();
  updateInterface();
  AudioEngine.letter();
  applyPhoto(letterPhotoFrame, letterPhoto, letterPhotoConfig);
  letterDialog.showModal();
  announcement.textContent = "Carta final abierta.";
}

function closeLetter() {
  letterDialog.close();
  letterButton.focus();
}

function triggerShootingStar() {
  shootingStar.classList.remove("is-active");
  void shootingStar.offsetWidth;
  shootingStar.classList.add("is-active");
}

function resetProgress() {
  state.discovered = [];
  state.shootingStarSeen = false;
  state.finalStarDiscovered = false;
  state.letterOpened = false;
  pendingFinalReveal = false;
  saveProgress();
  shootingStar.classList.remove("is-active");
  updateInterface();
  announcement.textContent = "Recorrido reiniciado.";
  starButtons[0]?.focus();
}

function toggleSound() {
  state.soundEnabled = !state.soundEnabled;
  saveProgress();
  updateSoundButton();
  announcement.textContent = state.soundEnabled ? "Sonidos interactivos activados." : "Sonidos interactivos silenciados.";
  if (state.soundEnabled) AudioEngine.star(1);
}

function initializeVisualEffects() {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  initializePhotoPreloading();
  const revealTargets = document.querySelectorAll(
    ".section-heading, .progress-wrap, .constellation, .closing",
  );

  revealTargets.forEach((target) => target.classList.add("reveal"));

  if (reducedMotion || !("IntersectionObserver" in window)) {
    revealTargets.forEach((target) => target.classList.add("is-visible"));
  } else {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.14 },
    );
    revealTargets.forEach((target) => observer.observe(target));
  }

  if (reducedMotion) return;

  initializeAmbientShootingStars();

  if (!window.matchMedia("(pointer: fine)").matches) return;

  initializePhotoParallax();

  let frameRequested = false;
  let pointerX = window.innerWidth / 2;
  let pointerY = window.innerHeight / 3;

  const paintPointer = () => {
    const normalizedX = pointerX / window.innerWidth - 0.5;
    const normalizedY = pointerY / window.innerHeight - 0.5;
    document.documentElement.style.setProperty("--pointer-x", `${pointerX}px`);
    document.documentElement.style.setProperty("--pointer-y", `${pointerY}px`);
    document.documentElement.style.setProperty("--sky-x", `${normalizedX * -10}px`);
    document.documentElement.style.setProperty("--sky-y", `${normalizedY * -8}px`);
    frameRequested = false;
  };

  window.addEventListener(
    "pointermove",
    (event) => {
      pointerX = event.clientX;
      pointerY = event.clientY;
      if (frameRequested) return;
      frameRequested = true;
      requestAnimationFrame(paintPointer);
    },
    { passive: true },
  );

  constellation.addEventListener(
    "pointermove",
    (event) => {
      const bounds = constellation.getBoundingClientRect();
      const x = ((event.clientX - bounds.left) / bounds.width) * 100;
      const y = ((event.clientY - bounds.top) / bounds.height) * 100;
      constellation.style.setProperty("--constellation-x", `${x}%`);
      constellation.style.setProperty("--constellation-y", `${y}%`);
    },
    { passive: true },
  );
}

function initializeAmbientShootingStars() {
  if (typeof window.setTimeout !== "function" || typeof document.createElement !== "function") return;
  const sky = document.querySelector(".sky");
  if (!sky) return;

  let ambientTimer = null;

  const scheduleNext = (first = false) => {
    const minimum = first ? 5500 : 10000;
    const variation = first ? 5000 : 11000;
    ambientTimer = window.setTimeout(spawnStar, minimum + Math.random() * variation);
  };

  const spawnStar = () => {
    if (document.hidden) {
      scheduleNext();
      return;
    }

    const star = document.createElement("span");
    const duration = 3.2 + Math.random() * 1.25;
    const verticalTravel = 110 + Math.random() * 170;
    star.className = "ambient-shooting-star";
    star.setAttribute("aria-hidden", "true");
    star.style.setProperty("--ambient-top", `${5 + Math.random() * 48}%`);
    star.style.setProperty("--ambient-y", `${verticalTravel}px`);
    star.style.setProperty("--ambient-y-1", `${verticalTravel * 0.1}px`);
    star.style.setProperty("--ambient-y-2", `${verticalTravel * 0.34}px`);
    star.style.setProperty("--ambient-y-3", `${verticalTravel * 0.66}px`);
    star.style.setProperty("--ambient-angle", `${12 + Math.random() * 12}deg`);
    star.style.setProperty("--ambient-length", `${10 + Math.random() * 6}rem`);
    star.style.setProperty("--ambient-duration", `${duration}s`);
    sky.appendChild(star);
    star.addEventListener("animationend", () => star.remove(), { once: true });
    window.setTimeout(() => star.remove(), duration * 1000 + 500);
    scheduleNext();
  };

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && ambientTimer === null) scheduleNext(true);
  });

  scheduleNext(true);
}

starButtons.forEach((button) => button.addEventListener("click", () => openStar(Number(button.dataset.star))));
seventhStar.addEventListener("click", openSeventhStar);
soundButton.addEventListener("click", toggleSound);
dialogClose.addEventListener("click", closeMessageDialog);
dialogContinue.addEventListener("click", closeMessageDialog);
dialog.addEventListener("click", (event) => { if (event.target === dialog) closeMessageDialog(); });
letterButton.addEventListener("click", openLetter);
letterClose.addEventListener("click", closeLetter);
letterDialog.addEventListener("click", (event) => { if (event.target === letterDialog) closeLetter(); });
resetButton.addEventListener("click", resetProgress);
shootingStar.addEventListener("animationend", () => shootingStar.classList.remove("is-active"));

updateInterface();
initializeVisualEffects();

// Migra la Etapa 1 sin perder el evento visual, pero nunca reproduce audio al cargar.
if (state.discovered.length === 3 && !state.shootingStarSeen) {
  state.shootingStarSeen = true;
  saveProgress();
  triggerShootingStar();
  announcement.textContent = "Una estrella fugaz acaba de cruzar el cielo.";
}

window.UniversoJenifer = Object.freeze({ totalStars: TOTAL_STARS, hasGeneratedAudio: true });
