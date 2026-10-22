/**
 * ============================================================================
 * GŁADKASTRONKA - PANEL ADMINISTRATORA (Supabase Auth & Baza Wiadomości)
 * ============================================================================
 * Dostępny tylko po wejściu na adres z hashem: /#adminpanel
 */

let supabaseClient = null;
let currentAdminUser = null;
let adminMessages = [];
let activeAdminFilter = 'all';

// Inicjalizacja Supabase
function initSupabase() {
  if (typeof window.supabase !== 'undefined' && window.APP_CONFIG && window.APP_CONFIG.supabase) {
    const { url, anonKey } = window.APP_CONFIG.supabase;
    if (url && url !== 'TUTAJ_WKLEJ_SUPABASE_PROJECT_URL' && anonKey && anonKey !== 'TUTAJ_WKLEJ_SUPABASE_ANON_KEY') {
      try {
        supabaseClient = window.supabase.createClient(url, anonKey);
        window.supabaseClient = supabaseClient;
      } catch (err) {
        console.error('Błąd inicjalizacji Supabase:', err);
      }
    }
  }
}

// Sprawdzanie hasha URL (#adminpanel)
function checkAdminHash() {
  const overlay = document.getElementById('adminPanelOverlay');
  if (!overlay) return;

  const isAdminRoute = window.location.hash.toLowerCase() === '#adminpanel';

  if (isAdminRoute) {
    overlay.classList.remove('hidden');
    document.body.classList.add('overflow-hidden');
    
    // Sprawdź czy Supabase jest skonfigurowany
    if (!supabaseClient) {
      initSupabase();
    }

    if (!supabaseClient) {
      showAdminConfigNotice();
      return;
    }

    // Sprawdź sesję użytkownika
    checkAdminSession();
  } else {
    overlay.classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
  }
}

// Komunikat o braku kluczy w config.js
function showAdminConfigNotice() {
  const loginView = document.getElementById('adminLoginView');
  const dashView = document.getElementById('adminDashboardView');
  const errorBox = document.getElementById('adminLoginError');

  if (dashView) dashView.classList.add('hidden');
  if (loginView) loginView.classList.remove('hidden');
  if (errorBox) {
    errorBox.innerHTML = `
      <div class="flex items-start gap-2">
        <i data-lucide="alert-circle" class="w-4 h-4 text-amber-500 shrink-0 mt-0.5"></i>
        <div>
          <strong class="block text-amber-600 dark:text-amber-400">Brak konfiguracji Supabase!</strong>
          <span class="text-[11px] text-ink-muted">Otwórz plik <code>config.js</code> i wklej swój <strong>Project URL</strong> oraz <strong>Anon Key</strong> według instrukcji na czacie.</span>
        </div>
      </div>
    `;
    errorBox.classList.remove('hidden');
    if (window.lucide) lucide.createIcons({ root: errorBox });
  }
}

// Sprawdzenie sesji Supabase Auth
async function checkAdminSession() {
  if (!supabaseClient) return;

  try {
    const { data: { session }, error } = await supabaseClient.auth.getSession();
    
    if (error) throw error;

    if (session && session.user) {
      currentAdminUser = session.user;
      showAdminDashboard();
    } else {
      currentAdminUser = null;
      showAdminLogin();
    }
  } catch (err) {
    console.error('Błąd sprawdzania sesji:', err);
    showAdminLogin();
  }
}

// Pokazanie formularza logowania
function showAdminLogin() {
  const loginView = document.getElementById('adminLoginView');
  const dashView = document.getElementById('adminDashboardView');
  const errorBox = document.getElementById('adminLoginError');

  if (loginView) loginView.classList.remove('hidden');
  if (dashView) dashView.classList.add('hidden');
  if (errorBox) {
    errorBox.classList.add('hidden');
    errorBox.innerHTML = '';
  }
  if (window.lucide) lucide.createIcons();
}

// Pokazanie panelu głównego
function showAdminDashboard() {
  const loginView = document.getElementById('adminLoginView');
  const dashView = document.getElementById('adminDashboardView');
  const userEmailEl = document.getElementById('adminUserEmail');

  if (loginView) loginView.classList.add('hidden');
  if (dashView) dashView.classList.remove('hidden');

  if (userEmailEl && currentAdminUser) {
    userEmailEl.textContent = currentAdminUser.email;
  }

  loadAdminMessages();
}

// Logowanie administratora
async function handleAdminLogin(e) {
  e.preventDefault();
  if (!supabaseClient) {
    showAdminConfigNotice();
    return;
  }

  const emailInput = document.getElementById('adminEmail');
  const passwordInput = document.getElementById('adminPassword');
  const submitBtn = document.getElementById('adminLoginSubmitBtn');
  const errorBox = document.getElementById('adminLoginError');

  const email = emailInput ? emailInput.value.trim() : '';
  const password = passwordInput ? passwordInput.value : '';

  if (!email || !password) {
    if (errorBox) {
      errorBox.textContent = 'Wprowadź adres e-mail i hasło.';
      errorBox.classList.remove('hidden');
    }
    return;
  }

  try {
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg> Logowanie...
      `;
    }
    if (errorBox) errorBox.classList.add('hidden');

    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    currentAdminUser = data.user;
    if (passwordInput) passwordInput.value = '';
    showAdminDashboard();
  } catch (err) {
    console.error('Błąd logowania:', err);
    if (errorBox) {
      let msg = 'Błędny e-mail lub hasło.';
      if (err.message && err.message.includes('Invalid login credentials')) {
        msg = 'Nieprawidłowy adres e-mail lub hasło administratora.';
      } else if (err.message) {
        msg = err.message;
      }
      errorBox.textContent = msg;
      errorBox.classList.remove('hidden');
    }
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `<span>Zaloguj się do panelu</span> <i data-lucide="arrow-right" class="w-4 h-4"></i>`;
      if (window.lucide) lucide.createIcons({ root: submitBtn });
    }
  }
}

// Wylogowanie
async function handleAdminLogout() {
  if (supabaseClient) {
    await supabaseClient.auth.signOut();
  }
  currentAdminUser = null;
  adminMessages = [];
  showAdminLogin();
}

// Zamknięcie panelu (powrót na stronę)
function closeAdminPanel() {
  window.location.hash = '';
}

// Pobieranie wiadomości z bazy Supabase
async function loadAdminMessages() {
  if (!supabaseClient) return;

  const listContainer = document.getElementById('adminMessagesList');
  const refreshIcon = document.getElementById('adminRefreshIcon');
  if (refreshIcon) refreshIcon.classList.add('animate-spin');

  try {
    const { data, error } = await supabaseClient
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    adminMessages = data || [];
    updateMessageCounters();
    renderFilteredMessages();
  } catch (err) {
    console.error('Błąd pobierania wiadomości:', err);
    if (listContainer) {
      listContainer.innerHTML = `
        <div class="p-8 text-center text-rose-600 dark:text-rose-400 bg-rose-50/50 dark:bg-rose-950/20 rounded-2xl border border-rose-500/20">
          <p class="font-bold mb-1">Nie udało się pobrać wiadomości.</p>
          <p class="text-xs text-ink-muted">${err.message || 'Sprawdź połączenie z bazą Supabase oraz uprawnienia tabeli.'}</p>
        </div>
      `;
    }
  } finally {
    if (refreshIcon) refreshIcon.classList.remove('animate-spin');
  }
}

// Aktualizacja liczników na zakładkach
function updateMessageCounters() {
  const countAll = adminMessages.length;
  const countNew = adminMessages.filter(m => m.status === 'new').length;
  const countInProgress = adminMessages.filter(m => m.status === 'in_progress').length;
  const countCompleted = adminMessages.filter(m => m.status === 'completed').length;

  const elAll = document.getElementById('countAllBadge');
  const elNew = document.getElementById('countNewBadge');
  const elInProgress = document.getElementById('countInProgressBadge');
  const elCompleted = document.getElementById('countCompletedBadge');

  if (elAll) elAll.textContent = countAll;
  if (elNew) elNew.textContent = countNew;
  if (elInProgress) elInProgress.textContent = countInProgress;
  if (elCompleted) elCompleted.textContent = countCompleted;
}

// Zmiana aktywnego filtra
function setAdminFilter(filterName) {
  activeAdminFilter = filterName;

  // Stylowanie przycisków zakładek
  const tabs = document.querySelectorAll('.admin-filter-tab');
  tabs.forEach(tab => {
    const tabFilter = tab.getAttribute('data-filter');
    if (tabFilter === filterName) {
      tab.classList.add('bg-caramel-500', 'text-white', 'shadow-xs');
      tab.classList.remove('bg-cream-100', 'text-ink-muted', 'dark:bg-[#2A201A]');
    } else {
      tab.classList.remove('bg-caramel-500', 'text-white', 'shadow-xs');
      tab.classList.add('bg-cream-100', 'text-ink-muted', 'dark:bg-[#2A201A]');
    }
  });

  renderFilteredMessages();
}

// Renderowanie listy wiadomości
function renderFilteredMessages() {
  const listContainer = document.getElementById('adminMessagesList');
  if (!listContainer) return;

  let filtered = adminMessages;
  if (activeAdminFilter !== 'all') {
    filtered = adminMessages.filter(m => m.status === activeAdminFilter);
  }

  if (filtered.length === 0) {
    let emptyMsg = 'Brak wiadomości w tej kategorii.';
    if (activeAdminFilter === 'new') emptyMsg = 'Brak nowych wiadomości. Dobra robota! ✨';
    if (activeAdminFilter === 'in_progress') emptyMsg = 'Żadne zlecenie nie jest aktualnie w trakcie realizacji.';
    if (activeAdminFilter === 'completed') emptyMsg = 'Brak zrealizowanych wiadomości.';

    listContainer.innerHTML = `
      <div class="py-12 text-center text-ink-muted">
        <div class="w-12 h-12 rounded-2xl bg-cream-100 dark:bg-[#2A201A] border border-caramel-500/20 text-caramel-600 dark:text-[#D4A373] flex items-center justify-center mx-auto mb-3">
          <i data-lucide="inbox" class="w-6 h-6"></i>
        </div>
        <p class="font-bold text-ink mb-1">${emptyMsg}</p>
        <p class="text-xs text-ink-muted">Gdy ktoś wyśle formularz na stronie, zgłoszenie natychmiast pojawi się tutaj.</p>
      </div>
    `;
    if (window.lucide) lucide.createIcons({ root: listContainer });
    return;
  }

  listContainer.innerHTML = filtered.map(msg => {
    const formattedDate = new Date(msg.created_at).toLocaleString('pl-PL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    let statusBadge = '';
    let actionButtons = '';

    if (msg.status === 'new') {
      statusBadge = `<span class="px-2.5 py-0.5 rounded-full text-[10.5px] font-extrabold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-500/30 flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span> Nowe zgłoszenie</span>`;
      actionButtons = `
        <button onclick="updateAdminMessageStatus('${msg.id}', 'in_progress')" class="px-3 py-1.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs">
          <i data-lucide="play" class="w-3.5 h-3.5"></i> Oznacz: W realizacji
        </button>
        <button onclick="updateAdminMessageStatus('${msg.id}', 'completed')" class="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs">
          <i data-lucide="check" class="w-3.5 h-3.5"></i> Zrealizowane
        </button>
      `;
    } else if (msg.status === 'in_progress') {
      statusBadge = `<span class="px-2.5 py-0.5 rounded-full text-[10.5px] font-extrabold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-500/30 flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span> W realizacji</span>`;
      actionButtons = `
        <button onclick="updateAdminMessageStatus('${msg.id}', 'completed')" class="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs">
          <i data-lucide="check-check" class="w-3.5 h-3.5"></i> Oznacz: Zrealizowane
        </button>
        <button onclick="updateAdminMessageStatus('${msg.id}', 'new')" class="px-3 py-1.5 rounded-xl bg-cream-200 dark:bg-[#382B23] text-ink hover:bg-cream-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer">
          <i data-lucide="rotate-ccw" class="w-3.5 h-3.5"></i> Cofnij do nowych
        </button>
      `;
    } else if (msg.status === 'completed') {
      statusBadge = `<span class="px-2.5 py-0.5 rounded-full text-[10.5px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-500/30 flex items-center gap-1"><i data-lucide="check" class="w-3 h-3"></i> Zrealizowane</span>`;
      actionButtons = `
        <button onclick="updateAdminMessageStatus('${msg.id}', 'in_progress')" class="px-3 py-1.5 rounded-xl bg-cream-200 dark:bg-[#382B23] text-ink hover:bg-cream-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer">
          <i data-lucide="rotate-ccw" class="w-3.5 h-3.5"></i> Przywróć w realizacji
        </button>
      `;
    }

    return `
      <div class="bg-white/95 dark:bg-[#221A15] border border-caramel-500/20 rounded-3xl p-4 sm:p-5 shadow-soft transition-all hover:border-caramel-500/40">
        
        <!-- Górny nagłówek karty -->
        <div class="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-caramel-500/10">
          <div class="flex items-center gap-2">
            ${statusBadge}
            <span class="text-[11px] font-semibold text-ink-muted">${formattedDate}</span>
          </div>
          <div class="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-cream-100 dark:bg-[#2A201A] border border-caramel-500/20 text-caramel-800 dark:text-[#D4A373] text-[11px] font-bold">
            <i data-lucide="package" class="w-3 h-3"></i>
            <span>${msg.service || 'Brak wybranego pakietu'}</span>
          </div>
        </div>

        <!-- Główna zawartość -->
        <div class="py-3.5 grid grid-cols-1 md:grid-cols-12 gap-3">
          
          <!-- Dane klienta -->
          <div class="md:col-span-5 space-y-2">
            <div>
              <span class="text-[10px] font-bold uppercase tracking-wider text-ink-muted block">Klient / Firma:</span>
              <span class="text-sm sm:text-base font-extrabold text-ink">${msg.name || 'Brak nazwy'}</span>
            </div>

            <div class="flex flex-col gap-1 text-xs">
              <a href="tel:${msg.phone}" class="inline-flex items-center gap-2 text-caramel-700 dark:text-[#D4A373] font-bold hover:underline">
                <i data-lucide="phone" class="w-3.5 h-3.5"></i>
                <span>${msg.phone || 'Brak telefonu'}</span>
              </a>
              <a href="mailto:${msg.email}" class="inline-flex items-center gap-2 text-caramel-700 dark:text-[#D4A373] font-bold hover:underline break-all">
                <i data-lucide="mail" class="w-3.5 h-3.5"></i>
                <span>${msg.email || 'Brak maila'}</span>
              </a>
            </div>
          </div>

          <!-- Treść wiadomości -->
          <div class="md:col-span-7 bg-cream-50/80 dark:bg-[#1A1310] rounded-2xl p-3 border border-caramel-500/15">
            <span class="text-[10px] font-bold uppercase tracking-wider text-ink-muted block mb-1">Treść wiadomości:</span>
            <p class="text-xs sm:text-[13px] text-ink leading-relaxed whitespace-pre-wrap">${msg.message ? msg.message : '<em class="text-ink-muted">Klient nie dopisał dodatkowej wiadomości.</em>'}</p>
          </div>

        </div>

        <!-- Przyciski akcji na dole karty -->
        <div class="pt-3 border-t border-caramel-500/10 flex flex-wrap items-center justify-between gap-2">
          <div class="flex flex-wrap items-center gap-2">
            ${actionButtons}
          </div>
          <button onclick="deleteAdminMessage('${msg.id}')" class="px-2.5 py-1.5 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer">
            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i> Usuń
          </button>
        </div>

      </div>
    `;
  }).join('');

  if (window.lucide) lucide.createIcons({ root: listContainer });
}

// Zmiana statusu wiadomości
async function updateAdminMessageStatus(id, newStatus) {
  if (!supabaseClient) return;

  try {
    const { error } = await supabaseClient
      .from('contact_messages')
      .update({ status: newStatus })
      .eq('id', id);

    if (error) throw error;

    // Zaktualizuj lokalnie
    const item = adminMessages.find(m => m.id === id);
    if (item) item.status = newStatus;

    updateMessageCounters();
    renderFilteredMessages();
  } catch (err) {
    console.error('Błąd aktualizacji statusu:', err);
    alert('Błąd aktualizacji statusu: ' + (err.message || err));
  }
}

// Usuwanie wiadomości
async function deleteAdminMessage(id) {
  if (!supabaseClient) return;

  const confirmed = confirm('Czy na pewno chcesz bezpowrotnie usunąć to zgłoszenie z bazy danych?');
  if (!confirmed) return;

  try {
    const { error } = await supabaseClient
      .from('contact_messages')
      .delete()
      .eq('id', id);

    if (error) throw error;

    adminMessages = adminMessages.filter(m => m.id !== id);
    updateMessageCounters();
    renderFilteredMessages();
  } catch (err) {
    console.error('Błąd usuwania wiadomości:', err);
    alert('Błąd usuwania: ' + (err.message || err));
  }
}

// Nasłuchiwanie zmiany hasha
window.addEventListener('hashchange', checkAdminHash);
document.addEventListener('DOMContentLoaded', () => {
  initSupabase();
  checkAdminHash();
});

// Eksport globalny funkcji do użycia w HTML
window.checkAdminHash = checkAdminHash;
window.handleAdminLogin = handleAdminLogin;
window.handleAdminLogout = handleAdminLogout;
window.closeAdminPanel = closeAdminPanel;
window.loadAdminMessages = loadAdminMessages;
window.setAdminFilter = setAdminFilter;
window.updateAdminMessageStatus = updateAdminMessageStatus;
window.deleteAdminMessage = deleteAdminMessage;
