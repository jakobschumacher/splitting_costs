/**
 * @jest-environment jsdom
 */

import { i18n, translateContainer } from '../public/src/i18n/i18n.js';

describe('Internationalization (i18n) Tests', () => {
  beforeEach(() => {
    // Reset to English before each test
    i18n.setLanguage('en');
  });

  afterEach(() => {
    // Clean up localStorage
    localStorage.removeItem('costsplitter-language');
  });

  describe('Core i18n functionality', () => {
    test('returns English translation by default', () => {
      expect(i18n.t('header.title')).toBe('Costsplitter');
      expect(i18n.t('step1.title')).toBe('Get Started');
    });

    test('switches to German translation', () => {
      expect(i18n.setLanguage('de')).toBe(true);
      expect(i18n.getCurrentLanguage()).toBe('de');
      expect(i18n.t('header.title')).toBe('Costsplitter'); // Brand name stays the same
      expect(i18n.t('step1.title')).toBe('Loslegen');
    });

    test('falls back to key when translation is missing', () => {
      expect(i18n.t('nonexistent.key')).toBe('nonexistent.key');
    });

    test('persists language choice in localStorage', () => {
      i18n.setLanguage('de');
      expect(localStorage.getItem('costsplitter-language')).toBe('de');
    });

    test('rejects invalid language', () => {
      expect(i18n.setLanguage('fr')).toBe(false);
      expect(i18n.getCurrentLanguage()).toBe('en'); // Should stay English
    });
  });

  describe('Number and currency formatting', () => {
    test('formats currency correctly in English', () => {
      i18n.setLanguage('en');
      expect(i18n.formatCurrency(123.45)).toBe('€123.45');
    });

    test('formats currency correctly in German', () => {
      i18n.setLanguage('de');
      const result = i18n.formatCurrency(123.45);
      expect(result).toContain('123,45');
      expect(result).toContain('€');
    });

    test('formats numbers correctly by locale', () => {
      i18n.setLanguage('en');
      expect(i18n.formatNumber(1234.56)).toBe('1,234.56');

      i18n.setLanguage('de');
      expect(i18n.formatNumber(1234.56)).toBe('1.234,56');
    });
  });

  describe('DOM translation', () => {
    test('translates elements with data-i18n attribute', () => {
      document.body.innerHTML = `
        <div data-i18n="header.title">Costsplitter</div>
        <h2 data-i18n="step1.title">Configure Options</h2>
      `;

      i18n.setLanguage('de');
      translateContainer();

      expect(document.querySelector('[data-i18n="header.title"]').textContent).toBe('Costsplitter');
      expect(document.querySelector('[data-i18n="step1.title"]').textContent).toBe('Loslegen');
    });

    test('handles missing elements gracefully', () => {
      document.body.innerHTML = '<div data-i18n="nonexistent.key">Original</div>';

      // Should not throw and should show the key as fallback
      expect(() => translateContainer()).not.toThrow();
      expect(document.querySelector('[data-i18n="nonexistent.key"]').textContent).toBe('nonexistent.key');
    });
  });

  describe('Observer pattern', () => {
    test('notifies observers when language changes', () => {
      const mockCallback = jest.fn();
      i18n.subscribe(mockCallback);

      i18n.setLanguage('de');
      expect(mockCallback).toHaveBeenCalledWith('de');

      i18n.unsubscribe(mockCallback);
      i18n.setLanguage('en');
      expect(mockCallback).toHaveBeenCalledTimes(1); // Should not be called again
    });
  });

  describe('Available languages', () => {
    test('returns correct list of available languages', () => {
      const languages = i18n.getAvailableLanguages();
      expect(languages).toContain('en');
      expect(languages).toContain('de');
      expect(languages.length).toBe(2);
    });
  });
});