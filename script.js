/**
 * GładkaStronka - Skrypt interakcji, płynnego scrollowania i animacji
 */

// Globalna instancja płynnego scrolla (Lenis)
let lenis = null;

// Wczesna inicjalizacja motywu aby uniknąć mignięcia ekranu
initTheme();

document.addEventListener('DOMContentLoaded', () => {
  // Inicjalizacja ikon Lucide
  if (window.lucide) {
    lucide.createIcons();
  }

  // Inicjalizacja modułów
  initSmoothScroll();
  initCustomCursor();
  initHeroMascot();
  initScrollAnimations();
  initMobileMenu();
  initCounters();
  initCookieConsent();
  initModalListeners();
});

/* ==========================================================================
   1. PŁYNNE SCROLLOWANIE (Lenis Inertia Smooth Scroll)
   ========================================================================== */
function initSmoothScroll() {
  if (typeof Lenis !== 'undefined') {
    lenis = new Lenis({
      duration: 1.35,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.4,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Płynne przewijanie do kotwic w menu (Oferta, Portfolio, itp.)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const targetId = this.getAttribute('href');
        if (targetId && targetId !== '#') {
          const targetEl = document.querySelector(targetId);
          if (targetEl) {
            e.preventDefault();
            lenis.scrollTo(targetEl, { offset: -70, duration: 1.4 });
          }
        }
      });
    });
  }
}

/* ==========================================================================
   2. CUSTOMOWY KURSOR (Uśmieszek bez systemowego kursora)
   ========================================================================== */
let cursorEnabled = true;

function initCustomCursor() {
  const customCursor = document.getElementById('customCursor');
  const cursorInner = document.getElementById('cursorInner');
  const cursorAura = document.getElementById('cursorAura');
  const body = document.body;

  // Sprawdzamy czy to urządzenie ze wskaźnikiem myszy (nie dotyk)
  const isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (!isFinePointer) {
    if (customCursor) customCursor.style.display = 'none';
    if (cursorAura) cursorAura.style.display = 'none';
    return;
  }

  // Włączamy ukrywanie domyślnego kursora
  body.classList.add('custom-cursor-active');

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let cursorX = mouseX;
  let cursorY = mouseY;
  let auraX = mouseX;
  let auraY = mouseY;
  let isMouseInside = false;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    if (!isMouseInside) {
      isMouseInside = true;
      if (customCursor && cursorEnabled) customCursor.style.opacity = '1';
      if (cursorAura) cursorAura.style.opacity = '0.85';
    }
  });

  document.addEventListener('mouseleave', () => {
    isMouseInside = false;
    if (customCursor) customCursor.style.opacity = '0';
    if (cursorAura) cursorAura.style.opacity = '0';
  });

  document.addEventListener('mouseenter', () => {
    if (cursorEnabled) {
      isMouseInside = true;
      if (customCursor) customCursor.style.opacity = '1';
      if (cursorAura) cursorAura.style.opacity = '0.85';
    }
  });

  // Pętla renderowania z interpolacją (Lerp)
  function renderCursor() {
    if (cursorEnabled && isMouseInside) {
      cursorX += (mouseX - cursorX) * 0.35;
      cursorY += (mouseY - cursorY) * 0.35;

      if (customCursor) {
        customCursor.style.left = `${cursorX}px`;
        customCursor.style.top = `${cursorY}px`;
      }
    }

    auraX += (mouseX - auraX) * 0.08;
    auraY += (mouseY - auraY) * 0.08;
    if (cursorAura) {
      cursorAura.style.left = `${auraX}px`;
      cursorAura.style.top = `${auraY}px`;
    }

    requestAnimationFrame(renderCursor);
  }
  requestAnimationFrame(renderCursor);

  // Reakcja powiększenia nad klikalnymi elementami
  const attachHoverEffects = () => {
    const clickable = document.querySelectorAll('a, button, input, select, textarea, label, .cursor-pointer');
    clickable.forEach(el => {
      el.addEventListener('mouseenter', () => {
        if (cursorInner && cursorEnabled) {
          cursorInner.style.transform = 'scale(1.28) rotate(-6deg)';
        }
      });
      el.addEventListener('mouseleave', () => {
        if (cursorInner && cursorEnabled) {
          cursorInner.style.transform = 'scale(1) rotate(0deg)';
        }
      });
    });
  };
  attachHoverEffects();

  // Iskierki przy kliknięciu
  window.addEventListener('click', (e) => {
    if (cursorEnabled) {
      createSparkleBurst(e.clientX, e.clientY);
    }
  });
}

function toggleCustomCursor() {
  cursorEnabled = !cursorEnabled;
  const customCursor = document.getElementById('customCursor');
  const dot = document.getElementById('cursorToggleDot');
  const label = document.getElementById('cursorToggleLabel');
  const body = document.body;

  if (cursorEnabled) {
    body.classList.add('custom-cursor-active');
    if (customCursor) {
      customCursor.style.display = 'flex';
      customCursor.style.opacity = '1';
    }
    if (dot) dot.className = 'w-1.5 h-1.5 rounded-full bg-emerald-500';
    if (label) label.textContent = 'Kursor: WŁ.';
  } else {
    body.classList.remove('custom-cursor-active');
    if (customCursor) {
      customCursor.style.display = 'none';
      customCursor.style.opacity = '0';
    }
    if (dot) dot.className = 'w-1.5 h-1.5 rounded-full bg-stone-300';
    if (label) label.textContent = 'Kursor: WYŁ.';
  }
}

function createSparkleBurst(x, y) {
  for (let i = 0; i < 4; i++) {
    const sparkle = document.createElement('div');
    sparkle.className = 'click-sparkle text-caramel-500 text-lg font-bold select-none';
    sparkle.textContent = '✦';
    sparkle.style.left = `${x + (Math.random() * 28 - 14)}px`;
    sparkle.style.top = `${y + (Math.random() * 28 - 14)}px`;
    document.body.appendChild(sparkle);
    setTimeout(() => sparkle.remove(), 700);
  }
}

/* ==========================================================================
   3. MASKOTKA HERO (3D Tilt & Dymek)
   ========================================================================== */
function initHeroMascot() {
  const mascotCard = document.getElementById('mascotCard');
  const heroMascotImg = document.getElementById('heroMascotImg');
  const mascotSpeech = document.getElementById('mascotSpeech');

  if (!mascotCard) return;

  mascotCard.addEventListener('mousemove', (e) => {
    const rect = mascotCard.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    const rotateX = (-y / rect.height) * 12;
    const rotateY = (x / rect.width) * 12;

    mascotCard.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
  });

  mascotCard.addEventListener('mouseleave', () => {
    mascotCard.style.transform = 'rotateX(0deg) rotateY(0deg) scale(1)';
  });

  const phrases = [
    "Działa od ręki! ✨",
    "Zero abonamentów! 🚀",
    "Szybkie jak błyskawica ⚡",
    "Twoi klienci to pokochają! 🤍",
    "Gotowe w 7 dni! 📅"
  ];
  let phraseIdx = 0;

  mascotCard.addEventListener('click', (e) => {
    createSparkleBurst(e.clientX, e.clientY);

    if (heroMascotImg) {
      heroMascotImg.style.transform = 'scale(1.18) rotate(-7deg)';
      setTimeout(() => {
        heroMascotImg.style.transform = 'scale(1) rotate(0deg)';
      }, 300);
    }

    if (mascotSpeech) {
      phraseIdx = (phraseIdx + 1) % phrases.length;
      mascotSpeech.textContent = phrases[phraseIdx];
      mascotSpeech.classList.add('bg-caramel-50', 'text-caramel-800');
      setTimeout(() => {
        mascotSpeech.classList.remove('bg-caramel-50', 'text-caramel-800');
      }, 600);
    }
  });
}

/* ==========================================================================
   4. MAŚLANE, POWOLNE DWUKIERUNKOWE ANIMACJE PRZYPŁYWANIA
   Gdy scrollujesz w dół -> elementy z kinową powolnością i miękkością wchodzą na ekran
   Gdy wracasz do góry -> powoli oddalają się z powrotem na boki
   ========================================================================== */
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Element pojawia się w widoku -> powoli przypływa
        entry.target.classList.add('is-visible');
      } else {
        // Element opuszcza widok (np. przy scrollowaniu w górę) -> powoli oddala się
        entry.target.classList.remove('is-visible');
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  });

  document.querySelectorAll('.slide-from-left, .slide-from-right, .reveal-fade-up').forEach(el => {
    observer.observe(el);
  });
}

/* ==========================================================================
   5. PŁYNNA HARMONIJKA FAQ
   ========================================================================== */
function toggleFaq(btn) {
  const item = btn.closest('.faq-item');
  if (!item) return;
  const isOpen = item.classList.contains('is-open');

  // Zamknij pozostałe pytania
  document.querySelectorAll('.faq-item').forEach(other => {
    other.classList.remove('is-open');
  });

  // Przełącz bieżące
  if (!isOpen) {
    item.classList.add('is-open');
  }

  // Zaktualizuj wysokość scrolla w Lenis po animacji
  if (lenis) {
    setTimeout(() => lenis.resize(), 460);
  }
}

/* ==========================================================================
   6. MENU MOBILNE & NAWIGACJA
   ========================================================================== */
function initMobileMenu() {
  const toggleBtn = document.getElementById('mobileMenuToggle');
  const mobileMenu = document.getElementById('mobileMenu');

  if (toggleBtn && mobileMenu) {
    toggleBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });

    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
      });
    });
  }
}

/* ==========================================================================
   7. WYBÓR PAKIETU Z CENNIKA I PRZEJŚCIE DO FORMULARZA
   ========================================================================== */
function selectPackage(packageName) {
  const select = document.getElementById('serviceSelect');
  if (select) {
    select.value = packageName;
  }
  const formSection = document.getElementById('kontakt');
  if (formSection) {
    if (lenis) {
      lenis.scrollTo(formSection, { offset: -70, duration: 1.5 });
    } else {
      formSection.scrollIntoView({ behavior: 'smooth' });
    }
    const nameInput = document.getElementById('name');
    if (nameInput) setTimeout(() => nameInput.focus(), 600);
  }
}

/* ==========================================================================
   8. OBSŁUGA FORMULARZA KONTAKTOWEGO
   ========================================================================== */
function handleFormSubmit(e) {
  e.preventDefault();
  const form = document.getElementById('contactForm');
  const modal = document.getElementById('formSuccessModal');

  if (form) form.classList.add('hidden');
  if (modal) modal.classList.remove('hidden');
  createSparkleBurst(window.innerWidth / 2, window.innerHeight / 2);
}

function resetContactForm() {
  const form = document.getElementById('contactForm');
  const modal = document.getElementById('formSuccessModal');

  if (form) {
    form.reset();
    form.classList.remove('hidden');
  }
  if (modal) modal.classList.add('hidden');
}

/* ==========================================================================
   9. COZY ESPRESSO DARK MODE (Auto 19:00 - 06:00 + Manualny Switch & Storage)
   ========================================================================== */
function initTheme() {
  const savedTheme = localStorage.getItem('theme');
  const now = new Date();
  const currentHour = now.getHours();

  let isDark = false;
  if (savedTheme === 'dark') {
    isDark = true;
  } else if (savedTheme === 'light') {
    isDark = false;
  } else {
    // Automatycznie ciemny w godzinach wieczornych i nocnych (19:00 - 06:00)
    isDark = (currentHour >= 19 || currentHour < 6);
  }

  setTheme(isDark, false);
}

function setTheme(isDark, savePreference = true) {
  const html = document.documentElement;
  if (isDark) {
    html.classList.add('dark');
  } else {
    html.classList.remove('dark');
  }

  // Zaktualizuj meta theme-color dla przeglądarki na smartfonach
  const metaTheme = document.getElementById('metaThemeColor');
  if (metaTheme) {
    metaTheme.setAttribute('content', isDark ? '#181310' : '#FAF7EE');
  }

  if (savePreference) {
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }
}

function toggleTheme() {
  const isCurrentlyDark = document.documentElement.classList.contains('dark');
  setTheme(!isCurrentlyDark, true);
  
  // Iskra potwierdzenia
  createSparkleBurst(window.innerWidth / 2, 60);
}

/* ==========================================================================
   10. ANIMOWANE LICZNIKI LICZB (Kompaktowy pasek w Portfolio)
   ========================================================================== */
function initCounters() {
  const counterEls = document.querySelectorAll('.counter-number');
  if (!counterEls.length) return;

  let hasAnimated = false;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !hasAnimated) {
        hasAnimated = true;
        animateAllCounters(counterEls);
      }
    });
  }, {
    threshold: 0.25
  });

  const parentStrip = counterEls[0].closest('.grid') || counterEls[0];
  observer.observe(parentStrip);
}

function animateAllCounters(counterEls) {
  const duration = 1500; // ms
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // Płynna krzywa easeOutExpo
    const easeOut = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

    counterEls.forEach(el => {
      const target = parseInt(el.getAttribute('data-target') || '0', 10);
      const currentVal = Math.round(easeOut * target);
      el.textContent = currentVal.toString();
    });

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      counterEls.forEach(el => {
        el.textContent = el.getAttribute('data-target') || '0';
      });
    }
  }

  requestAnimationFrame(update);
}

/* ==========================================================================
   11. COOKIE CONSENT & BANER (Zgodność z RODO)
   ========================================================================== */
function initCookieConsent() {
  const isAccepted = localStorage.getItem('cookies_accepted');
  const banner = document.getElementById('cookieBanner');
  if (!isAccepted && banner) {
    setTimeout(() => {
      banner.classList.add('is-shown');
    }, 1200);
  }
}

function acceptCookies() {
  localStorage.setItem('cookies_accepted', 'true');
  const banner = document.getElementById('cookieBanner');
  if (banner) {
    banner.classList.remove('is-shown');
  }
}

/* ==========================================================================
   12. MODAL REGULAMINU I POLITYKI PRYWATNOŚCI
   ========================================================================== */
function openPrivacyModal() {
  const modal = document.getElementById('privacyModal');
  if (modal) {
    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }
}

function closePrivacyModal() {
  const modal = document.getElementById('privacyModal');
  if (modal) {
    modal.classList.remove('is-open');
    document.body.style.overflow = '';
  }
}

function initModalListeners() {
  const modal = document.getElementById('privacyModal');
  if (!modal) return;

  // Zamknij klikając w tło poza kartą
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closePrivacyModal();
    }
  });

  // Zamknij klawiszem ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) {
      closePrivacyModal();
    }
  });
}

