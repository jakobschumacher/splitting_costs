import { costsplitterPipeline } from '../src/pipeline.js';

describe('Integration Tests with R Package Examples', () => {
  // Test data based on R package examples (simplified for testing)
  const familyReunionCsv = `name,group,age,cost_dinner,pay_dinner,adjustment
James Smith,Smith,adult,full,0,
Olivia Johnson,Johnson,,0.8,100,less
Ethan Brown,Brown,3,full,0,
Amelia Taylor,Smith,adult,full,400,
Emma Davis,Smith,,full,800,`;

  const minimalCsv = `name,group,pay_dinner,cost_dinner
John,Group1,100,full
Jane,Group1,50,0.5
Bob,Group2,75,full`;

  const complexScenarioCsv = `name,group,age,adjustment,cost_dinner,pay_dinner,cost_hotel,pay_hotel
Alice,Family1,adult,more,full,120,0.8,0
Bob,Family1,kid,less,reduced,0,full,200
Charlie,Family2,25,1.5,0,,full,150
Diana,Family2,adult,,full,80,half,50`;

  describe('Family Reunion Scenario (R Package Example)', () => {
    test('processes family reunion data successfully', () => {
      const file = { size: 5000 };
      const result = costsplitterPipeline(file, familyReunionCsv, 'individual');

      expect(result.success).toBe(true);
      expect(result.report).toBeDefined();
      expect(result.report.paymentMatrix.length).toBeGreaterThan(0);
    });

    test('handles group-based calculation for families', () => {
      const file = { size: 5000 };
      const result = costsplitterPipeline(file, familyReunionCsv, 'group');

      expect(result.success).toBe(true);
      expect(result.report.paymentMatrix.length).toBeLessThanOrEqual(5); // Max unique groups
    });

    test('validates transformation of complex age and adjustment values', () => {
      const file = { size: 5000 };
      const result = costsplitterPipeline(file, familyReunionCsv, 'individual');

      expect(result.transformationLog.length).toBeGreaterThan(0);
      expect(result.transformationLog.some(log => log.includes('adult'))).toBe(true);
      expect(result.transformationLog.some(log => log.includes('less'))).toBe(true);
    });
  });

  describe('Minimal Scenario', () => {
    test('processes simple three-person scenario', () => {
      const file = { size: 1000 };
      const result = costsplitterPipeline(file, minimalCsv, 'individual');

      expect(result.success).toBe(true);
      expect(result.report.paymentMatrix).toHaveLength(3);
      expect(result.report.summary.totalPaid).toBe(225); // 100+50+75
    });

    test('generates minimal payment transactions', () => {
      const file = { size: 1000 };
      const result = costsplitterPipeline(file, minimalCsv, 'individual');

      expect(result.report.transactions).toBeDefined();
      expect(result.report.instructions.length).toBeLessThanOrEqual(2); // Minimal transactions
    });
  });

  describe('Complex Scenario with Mixed Values', () => {
    test('handles mixed age formats (numeric and categorical)', () => {
      const file = { size: 2000 };
      const result = costsplitterPipeline(file, complexScenarioCsv, 'individual');

      expect(result.success).toBe(true);
      expect(result.transformationLog.some(log => log.includes('adult'))).toBe(true);
      expect(result.transformationLog.some(log => log.includes('kid'))).toBe(true);
    });

    test('handles mixed adjustment formats (numeric and categorical)', () => {
      const file = { size: 2000 };
      const result = costsplitterPipeline(file, complexScenarioCsv, 'individual');

      expect(result.transformationLog.some(log => log.includes('more'))).toBe(true);
      expect(result.transformationLog.some(log => log.includes('less'))).toBe(true);
    });

    test('calculates weighted shares correctly', () => {
      const file = { size: 2000 };
      const result = costsplitterPipeline(file, complexScenarioCsv, 'individual');

      expect(result.success).toBe(true);
      const summary = result.report.summary;
      expect(summary.activities).toBeDefined();
      expect(summary.balanceCheck).toBe(true);
    });

    test('generates payment instructions with euro formatting', () => {
      const file = { size: 2000 };
      const result = costsplitterPipeline(file, complexScenarioCsv, 'individual');

      const instructions = result.report.instructions;
      instructions.forEach(instruction => {
        expect(instruction).toMatch(/€\d+\.\d{2}/); // Euro format with 2 decimals
        expect(instruction).toMatch(/\w+ pays \w+ €\d+\.\d{2}/); // Proper format
      });
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('handles CSV with only required columns', () => {
      const basicCsv = 'name,pay_activity\nAlice,100\nBob,50';
      const file = { size: 500 };
      const result = costsplitterPipeline(file, basicCsv, 'individual');

      expect(result.success).toBe(true);
      expect(result.transformationLog.some(log => log.includes('missing'))).toBe(true);
    });

    test('detects validation errors in malformed data', () => {
      const invalidCsv = 'pay_dinner\n100\n50'; // Missing name column
      const file = { size: 500 };
      const result = costsplitterPipeline(file, invalidCsv, 'individual');

      expect(result.success).toBe(false);
      expect(result.error).toBe('CSV parsing failed');
    });

    test('handles empty payment values gracefully', () => {
      const emptyPaymentsCsv = 'name,pay_dinner,cost_dinner\nAlice,,full\nBob,,0.5';
      const file = { size: 500 };
      const result = costsplitterPipeline(file, emptyPaymentsCsv, 'individual');

      expect(result.success).toBe(true);
      expect(result.report.summary.totalPaid).toBe(0);
    });

    test('validates security constraints', () => {
      const formulaCsv = 'name,pay_dinner\nAlice,=SUM(A1:A10)\nBob,50';
      const file = { size: 500 };
      const result = costsplitterPipeline(file, formulaCsv, 'individual');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Security validation failed');
      expect(result.details[0]).toContain('CSV injection detected');
    });

    test('enforces file size limits', () => {
      const largeCsv = 'name,pay_dinner\nAlice,100\nBob,50';
      const largeFile = { size: 15000000 }; // 15MB
      const result = costsplitterPipeline(largeFile, largeCsv, 'individual');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Security validation failed');
      expect(result.details[0]).toContain('File size exceeds');
    });
  });

  describe('Algorithm Correctness', () => {
    test('ensures total payments balance with obligations', () => {
      const file = { size: 2000 };
      const result = costsplitterPipeline(file, complexScenarioCsv, 'individual');

      const matrix = result.report.paymentMatrix;
      const totalObligations = matrix.reduce((sum, p) => sum + p.netObligation, 0);

      // Total net obligations should sum to approximately zero
      expect(Math.abs(totalObligations)).toBeLessThan(0.01);
    });

    test('verifies payment minimization algorithm works', () => {
      const file = { size: 2000 };
      const result = costsplitterPipeline(file, complexScenarioCsv, 'individual');

      expect(result.success).toBe(true);
      expect(result.report.transactions).toBeDefined();
      expect(Array.isArray(result.report.transactions)).toBe(true);
    });

    test('validates metadata completeness', () => {
      const file = { size: 1000 };
      const result = costsplitterPipeline(file, minimalCsv, 'individual');

      expect(result.metadata).toBeDefined();
      expect(result.metadata.processedAt).toBeDefined();
      expect(result.metadata.paymentMode).toBe('individual');
      expect(result.metadata.participantCount).toBe(3);
      expect(result.metadata.csvColumns).toContain('name');

      expect(result.report.metadata).toBeDefined();
      expect(result.report.metadata.generatedAt).toBeDefined();
      expect(result.report.metadata.algorithm).toBe('Minimized payment transactions');
    });
  });
});