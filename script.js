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
  initNavSlimeIndicator();
  initHeroNotificationStream();
  initCustomServiceSelect();
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

  // Pętla renderowania z interpolacją i akceleracją sprzętową translate3d (zero Reflow)
  function renderCursor() {
    if (cursorEnabled && isMouseInside) {
      cursorX += (mouseX - cursorX) * 0.85;
      cursorY += (mouseY - cursorY) * 0.85;

      if (customCursor) {
        customCursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-38%, -24.5%)`;
      }
    }

    auraX += (mouseX - auraX) * 0.08;
    auraY += (mouseY - auraY) * 0.08;
    if (cursorAura) {
      cursorAura.style.transform = `translate3d(${auraX - 180}px, ${auraY - 180}px, 0)`;
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
    "Gotowe w < 7 dni! ⚡"
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
  const mainHeader = document.getElementById('mainHeader');

  if (toggleBtn && mobileMenu) {
    toggleBtn.addEventListener('click', () => {
      const isHidden = mobileMenu.classList.toggle('hidden');
      if (mainHeader) {
        if (!isHidden) {
          mainHeader.classList.add('menu-open');
        } else {
          mainHeader.classList.remove('menu-open');
        }
      }
    });

    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
        if (mainHeader) mainHeader.classList.remove('menu-open');
      });
    });
  }
}

/* ==========================================================================
   7. WYBÓR PAKIETU Z CENNIKA I CUSTOMOWE OKIENKO WYBORU OFERTY
   ========================================================================== */
function initCustomServiceSelect() {
  const container = document.getElementById('customServiceSelect');
  const trigger = document.getElementById('customSelectTrigger');
  const dropdown = document.getElementById('customSelectDropdown');
  const chevron = document.getElementById('customSelectChevron');
  const hiddenInput = document.getElementById('serviceSelect');

  if (!container || !trigger || !dropdown) return;

  function toggleDropdown(forceState) {
    const isCurrentlyOpen = !dropdown.classList.contains('hidden');
    const nextState = typeof forceState === 'boolean' ? forceState : !isCurrentlyOpen;

    if (nextState) {
      dropdown.classList.remove('hidden');
      trigger.setAttribute('aria-expanded', 'true');
      if (chevron) chevron.style.transform = 'rotate(180deg)';
    } else {
      dropdown.classList.add('hidden');
      trigger.setAttribute('aria-expanded', 'false');
      if (chevron) chevron.style.transform = 'rotate(0deg)';
    }
  }

  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleDropdown();
  });

  dropdown.querySelectorAll('.custom-select-option').forEach(option => {
    option.addEventListener('click', (e) => {
      e.stopPropagation();
      const val = option.getAttribute('data-value');
      if (val && hiddenInput) {
        hiddenInput.value = val;
        updateCustomSelectUI(val);
      }
      toggleDropdown(false);
    });
  });

  // Zamknij okienko przy kliknięciu w dowolne inne miejsce na stronie
  document.addEventListener('click', (e) => {
    if (!container.contains(e.target)) {
      toggleDropdown(false);
    }
  });

  // Klawisz Escape zamyka okienko
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') toggleDropdown(false);
  });
}

function updateCustomSelectUI(value) {
  const dropdown = document.getElementById('customSelectDropdown');
  const titleEl = document.getElementById('selectedServiceTitle');
  const badgeEl = document.getElementById('selectedServiceBadge');
  const iconContainer = document.getElementById('selectedServiceIcon');
  if (!dropdown) return;

  dropdown.querySelectorAll('.custom-select-option').forEach(opt => {
    const optVal = opt.getAttribute('data-value');
    const isSelected = optVal === value;
    const checkIcon = opt.querySelector('.option-check-icon');

    if (isSelected) {
      opt.classList.add('bg-cream-50/90', 'dark:bg-[#2A201A]/80');
      if (checkIcon) checkIcon.classList.remove('hidden');

      if (titleEl) titleEl.textContent = opt.getAttribute('data-title');
      if (badgeEl) badgeEl.textContent = opt.getAttribute('data-badge');
      if (iconContainer) {
        const iconName = opt.getAttribute('data-icon') || 'calendar';
        iconContainer.innerHTML = `<i data-lucide="${iconName}" class="w-3.5 h-3.5"></i>`;
        if (window.lucide) lucide.createIcons({ root: iconContainer });
      }
    } else {
      opt.classList.remove('bg-cream-50/90', 'dark:bg-[#2A201A]/80');
      if (checkIcon) checkIcon.classList.add('hidden');
    }
  });
}

function selectPackage(packageName) {
  const select = document.getElementById('serviceSelect');
  if (select) {
    select.value = packageName;
  }
  updateCustomSelectUI(packageName);

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
   8. OBSŁUGA FORMULARZA KONTAKTOWEGO (Supabase & EmailJS)
   ========================================================================== */
async function handleFormSubmit(e) {
  e.preventDefault();
  const form = document.getElementById('contactForm');
  const modal = document.getElementById('formSuccessModal');
  const submitBtn = form ? form.querySelector('button[type="submit"]') : null;

  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const phoneInput = document.getElementById('phone');
  const serviceInput = document.getElementById('serviceSelect');
  const messageInput = document.getElementById('message');

  const name = nameInput ? nameInput.value.trim() : '';
  const email = emailInput ? emailInput.value.trim() : '';
  const phone = phoneInput ? phoneInput.value.trim() : '';
  const service = serviceInput ? serviceInput.value : 'Strona + Rezerwacje (od 800 zł)';
  const message = messageInput ? messageInput.value.trim() : '';

  // Stan ładowania na przycisku
  let originalBtnHtml = '';
  if (submitBtn) {
    originalBtnHtml = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <span>Wysyłanie zgłoszenia...</span>
    `;
  }

  // 1. Zapis do bazy danych Supabase (jeśli zainicjalizowano)
  if (window.supabaseClient) {
    try {
      const { error: dbError } = await window.supabaseClient
        .from('contact_messages')
        .insert([{
          name,
          email,
          phone,
          service,
          message,
          status: 'new'
        }]);

      if (dbError) {
        console.warn('Uwaga podczas zapisu do bazy Supabase:', dbError);
      }
    } catch (dbErr) {
      console.error('Błąd zapisu do Supabase:', dbErr);
    }
  } else {
    console.info('Supabase: Brak konfiguracji kluczy w config.js - pomijam zapis do bazy.');
  }

  // 2. Wysłanie powiadomień przez EmailJS (jeśli skonfigurowano)
  if (typeof window.emailjs !== 'undefined' && window.APP_CONFIG && window.APP_CONFIG.emailjs) {
    const { publicKey, serviceId, templateAdmin, templateClient } = window.APP_CONFIG.emailjs;
    
    if (publicKey && publicKey !== 'TUTAJ_WKLEJ_EMAILJS_PUBLIC_KEY' && serviceId && serviceId !== 'TUTAJ_WKLEJ_EMAILJS_SERVICE_ID') {
      try {
        emailjs.init({ publicKey });

        const emailParams = {
          client_name: name,
          client_email: email,
          client_phone: phone,
          service: service,
          message: message || '(Brak dodatkowej wiadomości)',
          date: new Date().toLocaleString('pl-PL')
        };

        // Mail 1: Do CIEBIE (Nowe zapytanie ze strony)
        if (templateAdmin && templateAdmin !== 'TUTAJ_WKLEJ_TEMPLATE_ID_ADMIN') {
          await emailjs.send(serviceId, templateAdmin, emailParams);
        }

        // Mail 2: Do KLIENTA (Potwierdzenie wysłania formularza)
        if (templateClient && templateClient !== 'TUTAJ_WKLEJ_TEMPLATE_ID_KLIENT' && email) {
          await emailjs.send(serviceId, templateClient, {
            ...emailParams,
            to_email: email,
            to_name: name
          });
        }
      } catch (mailErr) {
        console.error('Błąd wysyłki e-maili przez EmailJS:', mailErr);
      }
    } else {
      console.info('EmailJS: Brak konfiguracji kluczy w config.js - pomijam wysyłkę e-maili.');
    }
  }

  // Przywrócenie przycisku i pokazanie ekranu sukcesu
  if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalBtnHtml;
  }
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
    const select = document.getElementById('serviceSelect');
    if (select) {
      select.value = 'Strona + Rezerwacje (od 800 zł)';
      updateCustomSelectUI('Strona + Rezerwacje (od 800 zł)');
    }
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
  const badge = document.getElementById('cookieFloatingBtn');

  if (!isAccepted) {
    if (badge) badge.classList.add('is-hidden');
    if (banner) {
      setTimeout(() => {
        banner.classList.add('is-shown');
      }, 1200);
    }
  } else {
    if (banner) banner.classList.remove('is-shown');
    if (badge) badge.classList.remove('is-hidden');
  }
}

function acceptCookies() {
  localStorage.setItem('cookies_accepted', 'true');
  const banner = document.getElementById('cookieBanner');
  const badge = document.getElementById('cookieFloatingBtn');

  if (banner) {
    banner.classList.remove('is-shown');
  }
  if (badge) {
    badge.classList.remove('is-hidden');
    createSparkleBurst(36, window.innerHeight - 36);
  }
}

function closeCookieBanner() {
  const banner = document.getElementById('cookieBanner');
  const badge = document.getElementById('cookieFloatingBtn');

  if (banner) {
    banner.classList.remove('is-shown');
  }
  if (badge) {
    badge.classList.remove('is-hidden');
  }
}

function openCookieSettings() {
  const banner = document.getElementById('cookieBanner');
  const badge = document.getElementById('cookieFloatingBtn');

  if (badge) {
    badge.classList.add('is-hidden');
  }
  if (banner) {
    banner.classList.add('is-shown');
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

/* ==========================================================================
   13. SLIME NAV INDICATOR (Sprężysty paseczek przeskakujący pod aktywną sekcję)
   ========================================================================== */
function initNavSlimeIndicator() {
  const nav = document.getElementById('desktopNav');
  const indicator = document.getElementById('navSlimeIndicator');
  if (!nav || !indicator) return;

  const links = nav.querySelectorAll('a.nav-link');
  if (!links.length) return;

  let activeLink = null;
  let stretchTimeout = null;

  function moveTo(targetLink, isStretching = true) {
    if (!targetLink) {
      indicator.style.opacity = '0';
      links.forEach(l => {
        l.classList.remove('text-caramel-600', 'dark:text-[#D4A373]', 'font-bold');
        l.classList.add('text-ink-soft');
      });
      return;
    }

    const navRect = nav.getBoundingClientRect();
    const linkRect = targetLink.getBoundingClientRect();

    const left = linkRect.left - navRect.left;
    const width = linkRect.width;

    // Efekt elastycznego rozciągania slime podczas przeskoku
    if (isStretching) {
      indicator.classList.add('is-stretching');
      clearTimeout(stretchTimeout);
      stretchTimeout = setTimeout(() => {
        indicator.classList.remove('is-stretching');
      }, 280);
    }

    indicator.style.left = `${left}px`;
    indicator.style.width = `${width}px`;
    indicator.style.opacity = '1';

    // Wyróżnienie aktywnego napisu
    links.forEach(l => {
      if (l === targetLink) {
        l.classList.add('text-caramel-600', 'dark:text-[#D4A373]', 'font-bold');
        l.classList.remove('text-ink-soft');
      } else {
        l.classList.remove('text-caramel-600', 'dark:text-[#D4A373]', 'font-bold');
        l.classList.add('text-ink-soft');
      }
    });
  }

  // Obsługa najechania myszką
  links.forEach(link => {
    link.addEventListener('mouseenter', () => {
      moveTo(link, true);
    });

    link.addEventListener('click', () => {
      activeLink = link;
      moveTo(link, true);
    });
  });

  nav.addEventListener('mouseleave', () => {
    if (activeLink) {
      moveTo(activeLink, true);
    } else {
      moveTo(null, false);
    }
  });

  // Rejestracja sekcji do śledzenia scrolla (Scrollspy)
  const tracked = Array.from(links).map(link => {
    const id = link.getAttribute('href');
    return {
      link: link,
      el: id && id !== '#' ? document.querySelector(id) : null
    };
  }).filter(item => item.el !== null);

  function checkScroll() {
    const mainHeader = document.getElementById('mainHeader');
    const heroThreshold = Math.max(240, window.innerHeight * 0.55);
    const scrollPos = window.scrollY || window.pageYOffset || 0;

    if (mainHeader) {
      // 100% przezroczyste na samej górze, po przescrollowaniu > 10px (~1mm) płynny fade-in tła
      if (scrollPos > 10) {
        mainHeader.classList.add('has-scrolled');
      } else {
        mainHeader.classList.remove('has-scrolled');
      }

      // Dynamiczne wsuwanie napisu pod logo poniżej sekcji Hero
      if (scrollPos > heroThreshold) {
        mainHeader.classList.add('is-scrolled');
      } else {
        mainHeader.classList.remove('is-scrolled');
      }
    }

    // Jeśli użytkownik jest na samej górze (Hero)
    if (window.scrollY < 200) {
      if (activeLink !== null) {
        activeLink = null;
        moveTo(null, false);
      }
      return;
    }

    let current = null;
    const viewportThreshold = window.innerHeight * 0.38;

    for (let i = tracked.length - 1; i >= 0; i--) {
      const item = tracked[i];
      const rect = item.el.getBoundingClientRect();
      if (rect.top <= viewportThreshold && rect.bottom >= 120) {
        current = item.link;
        break;
      }
    }

    if (current && current !== activeLink) {
      activeLink = current;
      moveTo(activeLink, true);
    } else if (!current && activeLink) {
      activeLink = null;
      moveTo(null, false);
    }
  }

  // Nasłuchiwanie przewijania (zarówno z Lenis jak i natywne)
  window.addEventListener('scroll', checkScroll, { passive: true });
  if (typeof lenis !== 'undefined' && lenis) {
    lenis.on('scroll', checkScroll);
  }

  // Przeliczenie przy zmianie wielkości okna
  window.addEventListener('resize', () => {
    if (activeLink) moveTo(activeLink, false);
  }, { passive: true });

  // Inicjalne sprawdzenie pozycji natychmiast oraz po załadowaniu zasobów
  checkScroll();
  setTimeout(checkScroll, 100);
  setTimeout(checkScroll, 250);
}

/* ==========================================================================
   14. LIVE STREAM POWIADOMIEŃ REZERWACJI W HERO (Push Notification Feed)
   ========================================================================== */
function initHeroNotificationStream() {
  const listEl = document.getElementById('heroNotificationList');
  const mockupEl = document.getElementById('heroPhoneMockup');
  const clockEl = document.getElementById('heroPhoneClock');
  const bigClockEl = document.getElementById('heroPhoneBigClock');
  const dateEl = document.getElementById('heroPhoneDate');
  if (!listEl) return;

  // Realna, aktualna godzina oraz data na ekranie telefonu
  function updatePhoneClockAndDate() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const timeStr = `${hours}:${minutes}`;

    if (clockEl) clockEl.textContent = timeStr;
    if (bigClockEl) bigClockEl.textContent = timeStr;

    if (dateEl) {
      const days = ['Ndz.', 'Pon.', 'Wt.', 'Śr.', 'Czw.', 'Pt.', 'Sob.'];
      const months = ['stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca', 'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia'];
      const dayName = days[now.getDay()];
      const dayNum = now.getDate();
      const monthName = months[now.getMonth()];
      dateEl.textContent = `${dayName}, ${dayNum} ${monthName}`;
    }
  }
  updatePhoneClockAndDate();
  setInterval(updatePhoneClockAndDate, 10000);

  const bookingsData = [
    { icon: 'mail-check', type: 'Addict Tattoo • Nowy Sącz', badge: 'przed chwilą', title: 'Michał P. • Mroczny realizm (Sesja)', detail: 'Sobota 11:00 • Zadatek 300 zł • E-mail wysłany' },
    { icon: 'calendar-check', type: 'Me Dead Art • Limanowa', badge: '2 min temu', title: 'Aleksandra B. • Mikrotatuaż floral', detail: 'Czwartek 14:00 • Zapis online 24/7' },
    { icon: 'sparkles', type: 'Ceguaink • Tarnów', badge: '4 min temu', title: 'Natalia Z. • Precyzyjny Fineline', detail: 'Piątek 16:30 • Stały cennik • Potwierdzono' },
    { icon: 'mail-check', type: 'Addict Tattoo • Nowy Sącz', badge: '6 min temu', title: 'Kacper R. • Piercing industrial', detail: 'Środa 17:00 • 120 zł • E-mail do Ciebie' },
    { icon: 'calendar-check', type: 'Me Dead Art • Limanowa', badge: '9 min temu', title: 'Patryk W. • Konsultacja autorska', detail: 'Poniedziałek 18:00 • Bezpłatna • Zapis WWW' },
    { icon: 'check-circle-2', type: 'Ceguaink • Tarnów', badge: '12 min temu', title: 'Julia K. • Motyw botaniczny', detail: 'Wtorek 13:30 • Zapis online 24/7' },
    { icon: 'mail-check', type: 'Addict Tattoo • Nowy Sącz', badge: '15 min temu', title: 'Artur S. • Dotwork na przedramieniu', detail: 'Jutro 12:00 • Zadatek 200 zł • E-mail wysłany' },
    { icon: 'calendar-check', type: 'Me Dead Art • Limanowa', badge: '19 min temu', title: 'Karolina D. • Kompozycja florystyczna', detail: 'Piątek 11:00 • Potwierdzenie z kalendarza' },
    { icon: 'sparkles', type: 'Ceguaink • Tarnów', badge: '24 min temu', title: 'Magdalena S. • Cienkoliniowy tatuaż', detail: 'Sobota 15:00 • Rezerwacja ze strony' },
    { icon: 'mail-check', type: 'Addict Tattoo • Nowy Sącz', badge: '28 min temu', title: 'Bartek M. • Rękaw biomechanika', detail: 'Czwartek 10:00 • Sesja całodzienna' }
  ];

  let bookingIdx = 3;
  let isPaused = false;
  let isAnimating = false;

  if (mockupEl) {
    mockupEl.addEventListener('mouseenter', () => { isPaused = true; });
    mockupEl.addEventListener('mouseleave', () => { isPaused = false; });
  }

  function createCardElement(data) {
    const card = document.createElement('div');
    card.className = 'notification-card rounded-2xl p-2.5 bg-white/90 dark:bg-[#2A201A]/90 backdrop-blur-md border border-caramel-500/20 dark:border-caramel-500/25 shadow-xs flex items-center gap-2.5 transition-all cursor-default';
    
    const iconHtml = data.icon === 'mail-check'
      ? `<i data-lucide="mail-check" class="phone-icon-light w-4 h-4"></i><i data-lucide="mail-open" class="phone-icon-dark w-4 h-4"></i>`
      : `<i data-lucide="${data.icon}" class="w-4 h-4"></i>`;

    card.innerHTML = `
      <div class="notification-icon-box">
        ${iconHtml}
      </div>
      <div class="min-w-0 flex-1">
        <div class="flex items-center justify-between gap-1 mb-0.5">
          <span class="text-[8.5px] font-bold uppercase tracking-wider text-caramel-600 dark:text-[#D4A373]">${data.type}</span>
          <span class="notification-badge-time text-[8.5px] font-bold text-emerald-600 dark:text-emerald-400">właśnie teraz</span>
        </div>
        <p class="text-[11px] font-bold text-ink truncate leading-tight">${data.title}</p>
        <p class="text-[9.5px] text-ink-muted truncate">${data.detail}</p>
      </div>
    `;
    return card;
  }

  function slideNext() {
    if (isPaused || isAnimating || document.hidden) return;
    if (listEl.children.length < 3) return;

    isAnimating = true;

    // Aktualizuj czasy powiadomień, które przesuwają się w górę
    const cardMovingToMiddle = listEl.children[2]; // przechodzi z dołu do środka (2-3 min temu)
    const cardMovingToTop = listEl.children[1];    // przechodzi ze środka na górę (6-9 min temu)

    if (cardMovingToMiddle) {
      const badge = cardMovingToMiddle.querySelector('.notification-badge-time');
      if (badge) {
        const mins = Math.random() > 0.5 ? 2 : 3;
        badge.textContent = `${mins} min temu`;
        badge.className = 'notification-badge-time text-[8.5px] font-semibold text-ink-muted';
      }
    }

    if (cardMovingToTop) {
      const badge = cardMovingToTop.querySelector('.notification-badge-time');
      if (badge) {
        const mins = Math.floor(Math.random() * 4) + 6; // 6, 7, 8 lub 9 min temu
        badge.textContent = `${mins} min temu`;
        badge.className = 'notification-badge-time text-[8.5px] font-semibold text-ink-muted';
      }
    }

    const nextData = bookingsData[bookingIdx % bookingsData.length];
    bookingIdx++;

    // 1. Stwórz nowy element i dodaj na dół listy ze statusem "właśnie teraz"
    const newCard = createCardElement(nextData);
    newCard.classList.add('slide-in-down');
    listEl.appendChild(newCard);

    if (window.lucide) {
      lucide.createIcons({ root: newCard });
    }

    // 2. Najwyższy element przesuwa się w górę i znika (pociągając pozostałe za sobą)
    const topCard = listEl.children[0];
    requestAnimationFrame(() => {
      topCard.classList.add('slide-out-up');
    });

    // 3. Po zakończeniu płynnej animacji (650ms), usuń górny element z DOM
    setTimeout(() => {
      if (topCard.parentNode === listEl) {
        listEl.removeChild(topCard);
      }
      newCard.classList.remove('slide-in-down');
      isAnimating = false;
    }, 660);
  }

  // Pętla powiadomień co 3.6 sekundy
  setInterval(slideNext, 3600);
}

/* ==========================================================================
   19. PŁYWAJĄCY PRZYCISK KONTAKTU NA TELEFONACH (Mobile Quick Contact)
   ========================================================================== */
function toggleMobileContactMenu(e) {
  if (e) e.stopPropagation();
  const menu = document.getElementById('mobileContactMenu');
  const iconPhone = document.getElementById('mobileContactIconPhone');
  const iconClose = document.getElementById('mobileContactIconClose');
  if (!menu) return;

  const isOpen = !menu.classList.contains('pointer-events-none');
  if (isOpen) {
    closeMobileContactMenu();
  } else {
    menu.classList.remove('pointer-events-none', 'opacity-0', 'translate-y-4');
    menu.classList.add('opacity-100', 'translate-y-0');
    if (iconPhone) iconPhone.classList.add('hidden');
    if (iconClose) iconClose.classList.remove('hidden');
  }
}

function closeMobileContactMenu() {
  const menu = document.getElementById('mobileContactMenu');
  const iconPhone = document.getElementById('mobileContactIconPhone');
  const iconClose = document.getElementById('mobileContactIconClose');
  if (!menu) return;

  menu.classList.add('pointer-events-none', 'opacity-0', 'translate-y-4');
  menu.classList.remove('opacity-100', 'translate-y-0');
  if (iconPhone) iconPhone.classList.remove('hidden');
  if (iconClose) iconClose.classList.add('hidden');
}

// Zamknięcie po kliknięciu poza menu kontaktowe
document.addEventListener('click', (e) => {
  const menu = document.getElementById('mobileContactMenu');
  const btn = document.getElementById('mobileContactFloatingBtn');
  if (menu && btn && !menu.contains(e.target) && !btn.contains(e.target)) {
    closeMobileContactMenu();
  }
});



