import {
  validateNameColumn,
  validatePayColumns,
  validateDataTypes,
  validateDataIntegrity
} from '../src/validation/validation.js';

describe('Data Validation Module', () => {
  describe('validateNameColumn', () => {
    test('accepts valid name column', () => {
      const data = [
        { name: 'John', pay_dinner: '100' },
        { name: 'Jane', pay_dinner: '200' }
      ];
      const result = validateNameColumn(data);
      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
    });

    test('detects missing name column', () => {
      const data = [{ pay_dinner: '100' }];
      const result = validateNameColumn(data);
      expect(result.errors).toContainEqual({
        row: null, column: 'name', message: 'Required column "name" is missing'
      });
    });

    test('detects empty names', () => {
      const data = [
        { name: 'John', pay_dinner: '100' },
        { name: '', pay_dinner: '200' }
      ];
      const result = validateNameColumn(data);
      expect(result.errors).toContainEqual({
        row: 2, column: 'name', message: 'Name is required'
      });
    });

    test('detects duplicate names', () => {
      const data = [
        { name: 'John', pay_dinner: '100' },
        { name: 'John', pay_dinner: '200' }
      ];
      const result = validateNameColumn(data);
      expect(result.errors).toContainEqual({
        row: 2, column: 'name', message: 'Duplicate name "John"'
      });
    });
  });

  describe('validatePayColumns', () => {
    test('accepts valid pay columns', () => {
      const data = [{ name: 'John', pay_dinner: '100', pay_hotel: '200' }];
      const result = validatePayColumns(data);
      expect(result.errors).toHaveLength(0);
    });

    test('detects missing pay columns', () => {
      const data = [{ name: 'John', cost_dinner: '1' }];
      const result = validatePayColumns(data);
      expect(result.errors).toContainEqual({
        row: null, column: 'pay_', message: 'At least one "pay_" column is required'
      });
    });

    test('detects invalid numeric values', () => {
      const data = [{ name: 'John', pay_dinner: 'invalid' }];
      const result = validatePayColumns(data);
      expect(result.errors).toContainEqual({
        row: 1, column: 'pay_dinner', message: 'Must be numeric or empty'
      });
    });

    test('accepts empty pay values', () => {
      const data = [{ name: 'John', pay_dinner: '' }];
      const result = validatePayColumns(data);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('validateDataTypes', () => {
    test('validates age column', () => {
      const data = [
        { name: 'John', age: '25', pay_dinner: '100' },
        { name: 'Jane', age: 'adult', pay_dinner: '200' },
        { name: 'Kid', age: 'invalid', pay_dinner: '50' }
      ];
      const result = validateDataTypes(data);
      expect(result.errors).toContainEqual({
        row: 3, column: 'age', message: 'Invalid age value'
      });
    });

    test('validates adjustment column', () => {
      const data = [
        { name: 'John', adjustment: '1.2', pay_dinner: '100' },
        { name: 'Jane', adjustment: 'more', pay_dinner: '200' },
        { name: 'Bob', adjustment: 'invalid', pay_dinner: '150' }
      ];
      const result = validateDataTypes(data);
      expect(result.errors).toContainEqual({
        row: 3, column: 'adjustment', message: 'Invalid adjustment value'
      });
    });

    test('validates cost columns', () => {
      const data = [
        { name: 'John', cost_dinner: 'full', pay_dinner: '100' },
        { name: 'Jane', cost_dinner: '0.5', pay_dinner: '200' },
        { name: 'Bob', cost_dinner: 'invalid', pay_dinner: '150' }
      ];
      const result = validateDataTypes(data);
      expect(result.errors).toContainEqual({
        row: 3, column: 'cost_dinner', message: 'Invalid cost value'
      });
    });
  });

  describe('validateDataIntegrity', () => {
    test('performs complete validation', () => {
      const data = [
        { name: 'John', pay_dinner: '100', cost_dinner: 'full' },
        { name: 'Jane', pay_hotel: '200', cost_hotel: '0.8' }
      ];
      const result = validateDataIntegrity(data);
      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
    });

    test('collects all errors', () => {
      const data = [
        { pay_dinner: 'invalid' }, // missing name, invalid pay
        { name: 'John', cost_dinner: 'invalid' } // missing pay, invalid cost
      ];
      const result = validateDataIntegrity(data);
      expect(result.errors.length).toBeGreaterThan(2);
    });
  });
});