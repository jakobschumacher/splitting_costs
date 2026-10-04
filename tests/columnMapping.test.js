import { detectColumnMapping, applyColumnMapping } from '../public/src/transform/columnMapping.js';

describe('Column Mapping Module', () => {
  describe('detectColumnMapping', () => {
    test('detects canonical and German header names', () => {
      const result = detectColumnMapping(['name', 'Familie', 'Alter', 'Adjustment']);
      expect(result).toEqual([
        { column: 'name', role: 'name', activity: '' },
        { column: 'Familie', role: 'group', activity: '' },
        { column: 'Alter', role: 'age', activity: '' },
        { column: 'Adjustment', role: 'adjustment', activity: '' },
      ]);
    });

    test('detects pay_/cost_ columns and extracts the activity name', () => {
      const result = detectColumnMapping(['pay_Freitag-Übernachtung', 'cost_Freitag-Übernachtung']);
      expect(result).toEqual([
        { column: 'pay_Freitag-Übernachtung', role: 'pay', activity: 'Freitag-Übernachtung' },
        { column: 'cost_Freitag-Übernachtung', role: 'cost', activity: 'Freitag-Übernachtung' },
      ]);
    });

    test('marks unrecognized columns as ignore', () => {
      const result = detectColumnMapping(['Zimmer', 'Geburtsdatum']);
      expect(result).toEqual([
        { column: 'Zimmer', role: 'ignore', activity: '' },
        { column: 'Geburtsdatum', role: 'ignore', activity: '' },
      ]);
    });
  });

  describe('applyColumnMapping', () => {
    test('renames columns to canonical keys based on the mapping', () => {
      const mapping = [
        { column: 'Vorname', role: 'name', activity: '' },
        { column: 'Familie', role: 'group', activity: '' },
        { column: 'Zimmer', role: 'ignore', activity: '' },
      ];
      const data = [{ Vorname: 'Franz', Familie: 'Familie_Klaus', Zimmer: 'A' }];

      expect(applyColumnMapping(data, mapping)).toEqual([
        { name: 'Franz', group: 'Familie_Klaus' },
      ]);
    });

    test('builds pay_/cost_ keys from the chosen activity name', () => {
      const mapping = [
        { column: 'Freitag Zahlung', role: 'pay', activity: 'Freitag' },
        { column: 'Freitag Anteil', role: 'cost', activity: 'Freitag' },
      ];
      const data = [{ 'Freitag Zahlung': '100', 'Freitag Anteil': 'full' }];

      expect(applyColumnMapping(data, mapping)).toEqual([
        { pay_Freitag: '100', cost_Freitag: 'full' },
      ]);
    });

    test('translates German values after applying the mapping', () => {
      const mapping = [{ column: 'Alter', role: 'age', activity: '' }];
      const data = [{ Alter: 'erwachsen' }];

      expect(applyColumnMapping(data, mapping)).toEqual([{ age: 'adult' }]);
    });
  });
});
