import {
  minimizePayments,
  generateTransactionList,
  generateSummaryReport,
  generateCompleteReport
} from '../src/reporting/reporting.js';

describe('Report Generation Module', () => {
  const samplePaymentMatrix = [
    { element: 'John', shouldPay: 120, alreadyPaid: 100, netObligation: 20 },
    { element: 'Jane', shouldPay: 80, alreadyPaid: 150, netObligation: -70 },
    { element: 'Bob', shouldPay: 100, alreadyPaid: 50, netObligation: 50 },
  ];

  const sampleSummary = {
    totalPaid: 300,
    totalShould: 300,
    activities: {
      dinner: { totalPaid: 150, totalWeightedShares: 26.64, costPerUnit: 5.63 },
      hotel: { totalPaid: 150, totalWeightedShares: 27, costPerUnit: 5.56 },
    },
  };

  describe('minimizePayments', () => {
    test('minimizes payment transactions', () => {
      const result = minimizePayments(samplePaymentMatrix);

      expect(result).toHaveLength(2);
      expect(result.every(t => t.amount > 0)).toBe(true);
      expect(result.every(t => t.from && t.to)).toBe(true);

      // Total amount transferred should equal total positive obligations
      const totalTransferred = result.reduce((sum, t) => sum + t.amount, 0);
      expect(totalTransferred).toBe(70); // John owes 20 + Bob owes 50 = 70
    });

    test('handles exact matches first', () => {
      const data = [
        { element: 'Alice', netObligation: 50 },
        { element: 'Bob', netObligation: -50 },
        { element: 'Charlie', netObligation: 30 },
        { element: 'Dave', netObligation: -30 },
      ];

      const result = minimizePayments(data);
      expect(result).toHaveLength(2);

      // Should have exact matches
      const exactMatches = result.filter(t => t.amount === 50 || t.amount === 30);
      expect(exactMatches).toHaveLength(2);
    });

    test('handles empty obligations', () => {
      const result = minimizePayments([]);
      expect(result).toHaveLength(0);
    });

    test('handles balanced payments', () => {
      const data = [
        { element: 'Alice', netObligation: 0 },
        { element: 'Bob', netObligation: 0 },
      ];

      const result = minimizePayments(data);
      expect(result).toHaveLength(0);
    });
  });

  describe('generateTransactionList', () => {
    test('creates readable transaction instructions', () => {
      const transactions = [
        { from: 'John', to: 'Jane', amount: 20 },
        { from: 'Bob', to: 'Jane', amount: 50 },
      ];

      const result = generateTransactionList(transactions);

      expect(result).toHaveLength(2);
      expect(result[0]).toContain('John pays Jane €20.00');
      expect(result[1]).toContain('Bob pays Jane €50.00');
    });

    test('handles empty transactions', () => {
      const result = generateTransactionList([]);
      expect(result).toHaveLength(0);
    });

    test('formats amounts correctly', () => {
      const transactions = [
        { from: 'Alice', to: 'Bob', amount: 123.456 },
      ];

      const result = generateTransactionList(transactions);
      expect(result[0]).toContain('€123.46');
    });
  });

  describe('generateSummaryReport', () => {
    test('creates comprehensive summary', () => {
      const result = generateSummaryReport(samplePaymentMatrix, sampleSummary);

      expect(result.totalParticipants).toBe(3);
      expect(result.totalPaid).toBe(300);
      expect(result.totalOwed).toBe(300);
      expect(result.balanceCheck).toBe(true);
      expect(result.activities).toHaveLength(2);

      expect(result.paymentStatus.overpaid).toHaveLength(1);
      expect(result.paymentStatus.underpaid).toHaveLength(2);
      expect(result.paymentStatus.balanced).toHaveLength(0);
    });

    test('handles single participant', () => {
      const singleMatrix = [{ element: 'Solo', shouldPay: 100, alreadyPaid: 100, netObligation: 0 }];
      const singleSummary = { totalPaid: 100, totalShould: 100, activities: {} };

      const result = generateSummaryReport(singleMatrix, singleSummary);

      expect(result.totalParticipants).toBe(1);
      expect(result.paymentStatus.balanced).toHaveLength(1);
      expect(result.balanceCheck).toBe(true);
    });
  });

  describe('generateCompleteReport', () => {
    test('generates complete settlement report', () => {
      const calculationResult = {
        paymentMatrix: samplePaymentMatrix,
        summary: sampleSummary,
      };

      const result = generateCompleteReport(calculationResult);

      expect(result.summary).toBeDefined();
      expect(result.transactions).toBeDefined();
      expect(result.instructions).toBeDefined();
      expect(result.paymentMatrix).toEqual(samplePaymentMatrix);

      expect(result.transactions).toHaveLength(2);
      expect(result.instructions).toHaveLength(2);

      expect(result.summary.balanceCheck).toBe(true);
    });

    test('handles zero obligations', () => {
      const balancedMatrix = [
        { element: 'Alice', shouldPay: 50, alreadyPaid: 50, netObligation: 0 },
        { element: 'Bob', shouldPay: 50, alreadyPaid: 50, netObligation: 0 },
      ];

      const calculationResult = {
        paymentMatrix: balancedMatrix,
        summary: { totalPaid: 100, totalShould: 100, activities: {} },
      };

      const result = generateCompleteReport(calculationResult);

      expect(result.transactions).toHaveLength(0);
      expect(result.instructions).toHaveLength(0);
      expect(result.summary.paymentStatus.balanced).toHaveLength(2);
    });

    test('includes metadata', () => {
      const calculationResult = {
        paymentMatrix: samplePaymentMatrix,
        summary: sampleSummary,
      };

      const result = generateCompleteReport(calculationResult);

      expect(result.metadata).toBeDefined();
      expect(result.metadata.generatedAt).toBeDefined();
      expect(result.metadata.totalTransactions).toBe(2);
      expect(result.metadata.algorithm).toBe('Minimized payment transactions');
    });
  });
});