import {
  transformAge,
  transformAdjustment,
  transformCostValues,
  addMissingColumns,
  transformDataToNumeric
} from '../src/transform/transform.js';

describe('Data Transformation Module', () => {
  describe('transformAge', () => {
    test('converts adult to numeric', () => {
      const result = transformAge('adult');
      expect(result.value).toBe(18);
      expect(result.log).toBe('Transformed "adult" to 18');
    });

    test('converts kid to numeric', () => {
      const result = transformAge('kid');
      expect(result.value).toBe(9);
      expect(result.log).toBe('Transformed "kid" to 9');
    });

    test('keeps numeric values unchanged', () => {
      const result = transformAge('25');
      expect(result.value).toBe(25);
      expect(result.log).toBe('');
    });

    test('defaults empty values to 18', () => {
      const result = transformAge('');
      expect(result.value).toBe(18);
      expect(result.log).toBe('Empty age defaulted to 18');
    });

    test('defaults undefined values to 18', () => {
      const result = transformAge(undefined);
      expect(result.value).toBe(18);
      expect(result.log).toBe('Empty age defaulted to 18');
    });
  });

  describe('transformAdjustment', () => {
    test('converts "more" to 1.2', () => {
      const result = transformAdjustment('more');
      expect(result.value).toBe(1.2);
      expect(result.log).toBe('Transformed "more" to 1.2');
    });

    test('converts "less" to 0.8', () => {
      const result = transformAdjustment('less');
      expect(result.value).toBe(0.8);
      expect(result.log).toBe('Transformed "less" to 0.8');
    });

    test('keeps numeric values unchanged', () => {
      const result = transformAdjustment('1.5');
      expect(result.value).toBe(1.5);
      expect(result.log).toBe('');
    });

    test('defaults empty values to 1', () => {
      const result = transformAdjustment('');
      expect(result.value).toBe(1);
      expect(result.log).toBe('Empty adjustment defaulted to 1');
    });
  });

  describe('transformCostValues', () => {
    test('converts "full" to 1', () => {
      const result = transformCostValues('full');
      expect(result.value).toBe(1);
      expect(result.log).toBe('Transformed "full" to 1');
    });

    test('converts "reduced" to 0.7', () => {
      const result = transformCostValues('reduced');
      expect(result.value).toBe(0.7);
      expect(result.log).toBe('Transformed "reduced" to 0.7');
    });

    test('converts "half" to 0.5', () => {
      const result = transformCostValues('half');
      expect(result.value).toBe(0.5);
      expect(result.log).toBe('Transformed "half" to 0.5');
    });

    test('keeps numeric values unchanged', () => {
      const result = transformCostValues('0.8');
      expect(result.value).toBe(0.8);
      expect(result.log).toBe('');
    });

    test('defaults empty values to 0', () => {
      const result = transformCostValues('');
      expect(result.value).toBe(0);
      expect(result.log).toBe('Empty cost defaulted to 0');
    });
  });

  describe('addMissingColumns', () => {
    test('adds missing group column', () => {
      const data = [{ name: 'John', pay_dinner: '100' }];
      const result = addMissingColumns(data);
      expect(result.data[0].group).toBe('Individual');
      expect(result.log).toContain('Added missing group column with default "Individual"');
    });

    test('adds missing age column', () => {
      const data = [{ name: 'John', pay_dinner: '100' }];
      const result = addMissingColumns(data);
      expect(result.data[0].age).toBe('adult');
      expect(result.log).toContain('Added missing age column with default "adult"');
    });

    test('adds missing adjustment column', () => {
      const data = [{ name: 'John', pay_dinner: '100' }];
      const result = addMissingColumns(data);
      expect(result.data[0].adjustment).toBe(1);
      expect(result.log).toContain('Added missing adjustment column with default 1');
    });

    test('adds corresponding cost columns for pay columns', () => {
      const data = [{ name: 'John', pay_dinner: '100', pay_hotel: '200' }];
      const result = addMissingColumns(data);
      expect(result.data[0].cost_dinner).toBe(1);
      expect(result.data[0].cost_hotel).toBe(1);
      expect(result.log).toContain('Added missing cost_dinner column with default 1');
      expect(result.log).toContain('Added missing cost_hotel column with default 1');
    });

    test('preserves existing columns', () => {
      const data = [{
        name: 'John',
        group: 'Smith',
        age: 25,
        adjustment: 1.2,
        pay_dinner: '100'
      }];
      const result = addMissingColumns(data);
      expect(result.data[0].group).toBe('Smith');
      expect(result.data[0].age).toBe(25);
      expect(result.data[0].adjustment).toBe(1.2);
    });
  });

  describe('transformDataToNumeric', () => {
    test('transforms complete dataset', () => {
      const data = [
        {
          name: 'John',
          age: 'adult',
          adjustment: 'more',
          pay_dinner: '100',
          cost_dinner: 'full'
        },
        {
          name: 'Jane',
          age: 'kid',
          adjustment: 'less',
          pay_hotel: '200',
          cost_hotel: '0.8'
        }
      ];

      const result = transformDataToNumeric(data);

      expect(result.transformedData[0].age).toBe(18);
      expect(result.transformedData[0].adjustment).toBe(1.2);
      expect(result.transformedData[0].cost_dinner).toBe(1);
      expect(result.transformedData[0].pay_dinner).toBe(100);

      expect(result.transformedData[1].age).toBe(9);
      expect(result.transformedData[1].adjustment).toBe(0.8);
      expect(result.transformedData[1].cost_hotel).toBe(0.8);
      expect(result.transformedData[1].pay_hotel).toBe(200);

      expect(result.transformationLog.length).toBeGreaterThan(0);
    });

    test('handles missing columns and values', () => {
      const data = [{ name: 'John', pay_dinner: '' }];
      const result = transformDataToNumeric(data);

      expect(result.transformedData[0].group).toBe('Individual');
      expect(result.transformedData[0].age).toBe(18);
      expect(result.transformedData[0].adjustment).toBe(1);
      expect(result.transformedData[0].pay_dinner).toBe(0);
      expect(result.transformedData[0].cost_dinner).toBe(1);
    });
  });
});