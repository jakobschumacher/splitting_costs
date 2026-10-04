import {
  calculateWeightedShares,
  calculateCostPerUnit,
  calculateIndividualObligations,
  calculateGroupObligations,
  calculatePaymentObligations
} from '../public/src/calculation/calculation.js';

describe('Cost Calculation Module', () => {
  const sampleData = [
    {
      name: 'John',
      group: 'Smith',
      age: 18,
      adjustment: 1.2,
      cost_dinner: 1,
      pay_dinner: 100,
      cost_hotel: 0.5,
      pay_hotel: 0,
    },
    {
      name: 'Jane',
      group: 'Johnson',
      age: 9,
      adjustment: 0.8,
      cost_dinner: 0.7,
      pay_dinner: 0,
      cost_hotel: 1,
      pay_hotel: 200,
    },
    {
      name: 'Bob',
      group: 'Smith',
      age: 18,
      adjustment: 1,
      cost_dinner: 0,
      pay_dinner: 50,
      cost_hotel: 1,
      pay_hotel: 0,
    },
  ];

  describe('calculateWeightedShares', () => {
    test('applies age and adjustment factors correctly', () => {
      const result = calculateWeightedShares(sampleData);

      // John: cost_dinner=1, age=18, adjustment=1.2 → weighted=21.6
      expect(result[0].weighted_dinner).toBeCloseTo(21.6);
      // John: cost_hotel=0.5, age=18, adjustment=1.2 → weighted=10.8
      expect(result[0].weighted_hotel).toBeCloseTo(10.8);

      // Jane: cost_dinner=0.7, age=9, adjustment=0.8 → weighted=5.04
      expect(result[1].weighted_dinner).toBeCloseTo(5.04);
      // Jane: cost_hotel=1, age=9, adjustment=0.8 → weighted=7.2
      expect(result[1].weighted_hotel).toBeCloseTo(7.2);

      // Bob: cost_dinner=0, age=18, adjustment=1 → weighted=0
      expect(result[2].weighted_dinner).toBe(0);
      // Bob: cost_hotel=1, age=18, adjustment=1 → weighted=18
      expect(result[2].weighted_hotel).toBe(18);
    });

    test('handles missing cost columns gracefully', () => {
      const data = [{ name: 'Test', age: 18, adjustment: 1, pay_dinner: 100 }];
      const result = calculateWeightedShares(data);
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Test');
    });

    test('solidarity mode charges babies up to 2 nothing', () => {
      const data = [{ name: 'Baby', age: 2, adjustment: 1, cost_dinner: 1 }];
      const result = calculateWeightedShares(data, 'solidarity');
      expect(result[0].weighted_dinner).toBe(0);
    });

    test('solidarity mode charges ages 3-12 one quarter', () => {
      const data = [{ name: 'Kid', age: 12, adjustment: 1, cost_dinner: 1 }];
      const result = calculateWeightedShares(data, 'solidarity');
      expect(result[0].weighted_dinner).toBeCloseTo(4.5); // 0.25 * 18
    });

    test('solidarity mode charges ages 13-17 one half', () => {
      const data = [{ name: 'Teen', age: 17, adjustment: 1, cost_dinner: 1 }];
      const result = calculateWeightedShares(data, 'solidarity');
      expect(result[0].weighted_dinner).toBeCloseTo(9); // 0.5 * 18
    });

    test('solidarity mode charges ages 18-27 three quarters', () => {
      const data = [{ name: 'YoungAdult', age: 27, adjustment: 1, cost_dinner: 1 }];
      const result = calculateWeightedShares(data, 'solidarity');
      expect(result[0].weighted_dinner).toBeCloseTo(13.5); // 0.75 * 18
    });

    test('solidarity mode charges ages 28+ the full price', () => {
      const data = [{ name: 'Adult', age: 28, adjustment: 1, cost_dinner: 1 }];
      const result = calculateWeightedShares(data, 'solidarity');
      expect(result[0].weighted_dinner).toBeCloseTo(18);
    });
  });

  describe('calculateCostPerUnit', () => {
    test('calculates cost per unit for activities', () => {
      const weightedData = calculateWeightedShares(sampleData);
      const result = calculateCostPerUnit(weightedData);

      // Total paid for dinner: 100 + 0 + 50 = 150
      // Total weighted shares for dinner: 21.6 + 5.04 + 0 = 26.64
      // Cost per unit: 150 / 26.64 ≈ 5.63
      expect(result.dinner).toBeCloseTo(5.63, 1);

      // Total paid for hotel: 0 + 200 + 0 = 200
      // Total weighted shares for hotel: 10.8 + 7.2 + 18 = 36
      // Cost per unit: 200 / 36 ≈ 5.56
      expect(result.hotel).toBeCloseTo(5.56, 1);
    });

    test('handles zero total shares', () => {
      const data = [
        { name: 'Test', weighted_dinner: 0, pay_dinner: 100 },
      ];
      const result = calculateCostPerUnit(data);
      expect(result.dinner).toBe(0);
    });

    test('handles zero payments', () => {
      const data = [
        { name: 'Test', weighted_dinner: 10, pay_dinner: 0 },
      ];
      const result = calculateCostPerUnit(data);
      expect(result.dinner).toBe(0);
    });
  });

  describe('calculateIndividualObligations', () => {
    test('calculates individual payment obligations', () => {
      const weightedData = calculateWeightedShares(sampleData);
      const costPerUnit = calculateCostPerUnit(weightedData);
      const result = calculateIndividualObligations(weightedData, costPerUnit);

      expect(result).toHaveLength(3);

      // Just verify the structure and basic calculations work
      const john = result.find((p) => p.element === 'John');
      expect(john.alreadyPaid).toBe(100);
      expect(typeof john.shouldPay).toBe('number');
      expect(typeof john.netObligation).toBe('number');

      const jane = result.find((p) => p.element === 'Jane');
      expect(jane.alreadyPaid).toBe(200);
      expect(typeof jane.shouldPay).toBe('number');
      expect(typeof jane.netObligation).toBe('number');

      const bob = result.find((p) => p.element === 'Bob');
      expect(bob.alreadyPaid).toBe(50);
      expect(typeof bob.shouldPay).toBe('number');
      expect(typeof bob.netObligation).toBe('number');
    });

    test('carries the IBAN and defaults ibanName to the participant name', () => {
      const data = [{
        name: 'John', group: 'Smith', age: 18, adjustment: 1, cost_dinner: 1, pay_dinner: 100,
        iban: 'DE12 3456 7890',
      }];
      const weightedData = calculateWeightedShares(data);
      const costPerUnit = calculateCostPerUnit(weightedData);
      const result = calculateIndividualObligations(weightedData, costPerUnit);

      expect(result[0].iban).toBe('DE12 3456 7890');
      expect(result[0].ibanName).toBe('John');
    });

    test('uses iban_name as the account holder name when given', () => {
      const data = [{
        name: 'John', group: 'Smith', age: 18, adjustment: 1, cost_dinner: 1, pay_dinner: 100,
        iban: 'DE12', iban_name: 'John Doe GbR',
      }];
      const weightedData = calculateWeightedShares(data);
      const costPerUnit = calculateCostPerUnit(weightedData);
      const result = calculateIndividualObligations(weightedData, costPerUnit);

      expect(result[0].ibanName).toBe('John Doe GbR');
    });

    test('leaves iban empty when not provided', () => {
      const weightedData = calculateWeightedShares(sampleData);
      const costPerUnit = calculateCostPerUnit(weightedData);
      const result = calculateIndividualObligations(weightedData, costPerUnit);

      expect(result[0].iban).toBe('');
    });
  });

  describe('calculateGroupObligations', () => {
    test('aggregates obligations by group', () => {
      const weightedData = calculateWeightedShares(sampleData);
      const costPerUnit = calculateCostPerUnit(weightedData);
      const result = calculateGroupObligations(weightedData, costPerUnit);

      expect(result).toHaveLength(2);

      const smithGroup = result.find((g) => g.element === 'Smith');
      expect(smithGroup).toBeDefined();
      expect(smithGroup.alreadyPaid).toBe(150); // John: 100, Bob: 50

      const johnsonGroup = result.find((g) => g.element === 'Johnson');
      expect(johnsonGroup).toBeDefined();
      expect(johnsonGroup.alreadyPaid).toBe(200); // Jane: 200
    });

    test('uses the first IBAN found within the group', () => {
      const data = [
        {
          name: 'John', group: 'Smith', age: 18, adjustment: 1, cost_dinner: 1, pay_dinner: 100,
        },
        {
          name: 'Bob', group: 'Smith', age: 18, adjustment: 1, cost_dinner: 0, pay_dinner: 0,
          iban: 'DE12 3456 7890', iban_name: 'Bob Smith',
        },
      ];
      const weightedData = calculateWeightedShares(data);
      const costPerUnit = calculateCostPerUnit(weightedData);
      const result = calculateGroupObligations(weightedData, costPerUnit);

      expect(result[0].iban).toBe('DE12 3456 7890');
      expect(result[0].ibanName).toBe('Bob Smith');
    });
  });

  describe('calculatePaymentObligations', () => {
    test('calculates individual obligations by default', () => {
      const result = calculatePaymentObligations(sampleData, 'individual');
      expect(result.paymentMatrix).toHaveLength(3);
      expect(result.summary.totalPaid).toBe(350);
      expect(typeof result.summary.totalShould).toBe('number');
    });

    test('calculates group obligations when specified', () => {
      const result = calculatePaymentObligations(sampleData, 'group');
      expect(result.paymentMatrix).toHaveLength(2);
      expect(result.summary.totalPaid).toBe(350);
      expect(typeof result.summary.totalShould).toBe('number');
    });

    test('includes activity breakdown in summary', () => {
      const result = calculatePaymentObligations(sampleData, 'individual');
      expect(result.summary.activities.dinner).toBeDefined();
      expect(result.summary.activities.hotel).toBeDefined();
      expect(result.summary.activities.dinner.totalPaid).toBe(150);
      expect(result.summary.activities.hotel.totalPaid).toBe(200);
    });

    test('handles edge cases', () => {
      const emptyData = [];
      const result = calculatePaymentObligations(emptyData, 'individual');
      expect(result.paymentMatrix).toHaveLength(0);
      expect(result.summary.totalPaid).toBe(0);
      expect(result.summary.totalShould).toBe(0);
    });
  });
});