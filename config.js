/**
 * ============================================================================
 * GŁADKASTRONKA - KONFIGURACJA SUPABASE & EMAILJS
 * ============================================================================
 * 
 * Tutaj wklej swoje klucze po wykonaniu kroków z poradnika.
 * Jeśli klucze są puste, formularz i panel poinformują Cię o konieczności ich uzupełnienia.
 */

const APP_CONFIG = {
  // SUPABASE (Baza danych i Logowanie Administratora)
  supabase: {
    // Adres URL Twojego projektu z Supabase
    url: "https://vwksvhshnnsamkfdeyda.supabase.co",

    // Klucz publiczny anon / publishable
    anonKey: "sb_publishable_4j4QH8Eaj0P0oV45VXwssQ_kcKRjRZu"
  },

  // EMAILJS (Automatyczne wysyłanie e-maili do Ciebie i do Klienta)
  emailjs: {
    // Twój klucz publiczny (Account -> Public Key)
    publicKey: "Zdb3EviGAr7ZNTaeA",

    // ID Twojego serwisu pocztowego (Email Services -> Service ID)
    serviceId: "service_wgmzh06",

    // ID szablonu powiadomienia do CIEBIE o nowej wiadomości
    templateAdmin: "template_0tdgfvu",

    // ID szablonu automatycznego potwierdzenia do KLIENTA
    templateClient: "template_gws8s4f"
  }
};

window.APP_CONFIG = APP_CONFIG;
