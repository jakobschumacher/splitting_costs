import { en } from './en.js';
import { de } from './de.js';

class I18n {
  constructor() {
    this.translations = {
      en,
      de
    };
    this.currentLanguage = this.getInitialLanguage();
    this.observers = [];
  }

  getInitialLanguage() {
    // Check localStorage first
    const stored = localStorage.getItem('costsplitter-language');
    if (stored && this.translations[stored]) {
      return stored;
    }

    // Check browser language
    const browserLang = navigator.language.split('-')[0];
    if (this.translations[browserLang]) {
      return browserLang;
    }

    // Default to English
    return 'en';
  }

  setLanguage(language) {
    if (this.translations[language]) {
      this.currentLanguage = language;
      localStorage.setItem('costsplitter-language', language);
      this.notifyObservers();
      return true;
    }
    return false;
  }

  getCurrentLanguage() {
    return this.currentLanguage;
  }

  getAvailableLanguages() {
    return Object.keys(this.translations);
  }

  translate(key, ...args) {
    const translation = this.translations[this.currentLanguage][key];

    if (!translation) {
      console.warn(`Translation missing for key: ${key} in language: ${this.currentLanguage}`);
      return key; // Return the key if translation is missing
    }

    // Simple placeholder replacement if args are provided
    if (args.length > 0) {
      return translation.replace(/\{(\d+)\}/g, (match, index) => {
        return args[index] !== undefined ? args[index] : match;
      });
    }

    return translation;
  }

  // Shorthand method
  t(key, ...args) {
    return this.translate(key, ...args);
  }

  // Observer pattern for UI updates
  subscribe(callback) {
    this.observers.push(callback);
  }

  unsubscribe(callback) {
    this.observers = this.observers.filter(obs => obs !== callback);
  }

  notifyObservers() {
    this.observers.forEach(callback => callback(this.currentLanguage));
  }

  // Get language-specific number formatting
  formatNumber(number, options = {}) {
    const locale = this.currentLanguage === 'de' ? 'de-DE' : 'en-US';
    return new Intl.NumberFormat(locale, options).format(number);
  }

  // Get language-specific currency formatting
  formatCurrency(amount, currency = 'EUR') {
    const locale = this.currentLanguage === 'de' ? 'de-DE' : 'en-US';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  // Get language-specific date formatting
  formatDate(date, options = {}) {
    const locale = this.currentLanguage === 'de' ? 'de-DE' : 'en-US';
    return new Intl.DateTimeFormat(locale, options).format(date);
  }
}

// Create singleton instance
export const i18n = new I18n();

// Helper function to translate elements with data-i18n attribute
export function translateElement(element) {
  const key = element.getAttribute('data-i18n');
  if (key) {
    const translation = i18n.translate(key);

    // Handle different element types
    if (element.tagName === 'INPUT' && (element.type === 'text' || element.type === 'email')) {
      element.placeholder = translation;
    } else if (element.hasAttribute('title')) {
      element.title = translation;
    } else {
      element.textContent = translation;
    }
  }
}

// Helper function to translate all elements in a container
export function translateContainer(container = document) {
  const elements = container.querySelectorAll('[data-i18n]');
  elements.forEach(translateElement);
}

// Auto-translate on language change
i18n.subscribe(() => {
  translateContainer();
});