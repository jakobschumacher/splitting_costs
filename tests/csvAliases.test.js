import {
  normalizeHeaders,
  normalizeValues,
  normalizeCsvData,
} from '../public/src/transform/csvAliases.js';

describe('CSV Aliases Module', () => {
  describe('normalizeHeaders', () => {
    test('renames German group header', () => {
      const result = normalizeHeaders([{ name: 'Franz', Familie: 'Familie_Klaus' }]);
      expect(result[0]).toEqual({ name: 'Franz', group: 'Familie_Klaus' });
    });

    test('renames German age header', () => {
      const result = normalizeHeaders([{ name: 'Franz', Alter: 'erwachsen' }]);
      expect(result[0]).toEqual({ name: 'Franz', age: 'erwachsen' });
    });

    test('normalizes case of canonical headers', () => {
      const result = normalizeHeaders([{ name: 'Franz', Adjustment: '0.8' }]);
      expect(result[0]).toEqual({ name: 'Franz', adjustment: '0.8' });
    });

    test('leaves pay_/cost_ activity suffixes untouched', () => {
      const result = normalizeHeaders([{
        name: 'Felix',
        'cost_Freitag-Übernachtung': '1',
        'pay_Freitag-Übernachtung': '100',
      }]);
      expect(result[0]).toEqual({
        name: 'Felix',
        'cost_Freitag-Übernachtung': '1',
        'pay_Freitag-Übernachtung': '100',
      });
    });

    test('leaves unrecognized extra columns untouched', () => {
      const result = normalizeHeaders([{ name: 'Franz', Zimmer: 'A', Geburtsdatum: '' }]);
      expect(result[0]).toEqual({ name: 'Franz', Zimmer: 'A', Geburtsdatum: '' });
    });
  });

  describe('normalizeValues', () => {
    test('translates German age category', () => {
      const result = normalizeValues([{ age: 'erwachsen' }]);
      expect(result[0].age).toBe('adult');
    });

    test('translates German adjustment category', () => {
      const result = normalizeValues([{ adjustment: 'mehr' }]);
      expect(result[0].adjustment).toBe('more');
    });

    test('translates German cost category', () => {
      const result = normalizeValues([{ cost_dinner: 'voll' }]);
      expect(result[0].cost_dinner).toBe('full');
    });

    test('leaves numeric and already-English values unchanged', () => {
      const result = normalizeValues([{ age: '25', adjustment: 'less', cost_dinner: '0.5' }]);
      expect(result[0]).toEqual({ age: '25', adjustment: 'less', cost_dinner: '0.5' });
    });
  });

  describe('normalizeCsvData', () => {
    test('normalizes headers and values together', () => {
      const result = normalizeCsvData([{
        name: 'Tanja', Familie: 'Familie_Klaus', Alter: 'erwachsen', Adjustment: 'mehr',
      }]);
      expect(result[0]).toEqual({
        name: 'Tanja', group: 'Familie_Klaus', age: 'adult', adjustment: 'more',
      });
    });
  });
});
