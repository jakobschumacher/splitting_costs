import { processCsvData, costsplitterPipeline } from '../src/pipeline.js';

describe('Pipeline Orchestrator', () => {
  const validCsvData = [
    {
      name: 'John',
      group: 'Smith',
      age: 'adult',
      adjustment: 'more',
      cost_dinner: 'full',
      pay_dinner: '100',
      cost_hotel: '0.5',
      pay_hotel: '0',
    },
    {
      name: 'Jane',
      group: 'Johnson',
      age: 'kid',
      adjustment: 'less',
      cost_dinner: 'reduced',
      pay_dinner: '0',
      cost_hotel: 'full',
      pay_hotel: '200',
    },
  ];

  const validFile = { size: 1000 };
  const validCsvContent = 'name,pay_dinner\nJohn,100\nJane,50';

  describe('processCsvData', () => {
    test('processes valid CSV data successfully', () => {
      const result = processCsvData(validFile, validCsvContent, validCsvData, 'individual');

      expect(result.success).toBe(true);
      expect(result.report).toBeDefined();
      expect(result.report.paymentMatrix).toHaveLength(2);
      expect(result.report.transactions).toBeDefined();
      expect(result.report.instructions).toBeDefined();
      expect(result.report.summary).toBeDefined();
    });

    test('handles security validation failures', () => {
      const largeFile = { size: 20000000 }; // 20MB
      const result = processCsvData(largeFile, validCsvContent, validCsvData, 'individual');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Security validation failed');
      expect(result.details).toContain('File size exceeds 10MB limit');
    });

    test('handles data validation failures', () => {
      const invalidData = [{ pay_dinner: '100' }]; // missing name
      const result = processCsvData(validFile, validCsvContent, invalidData, 'individual');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Data validation failed');
      expect(result.validationErrors).toBeDefined();
      expect(result.validationErrors.length).toBeGreaterThan(0);
    });

    test('includes processing steps in successful result', () => {
      const result = processCsvData(validFile, validCsvContent, validCsvData, 'individual');

      expect(result.steps).toBeDefined();
      expect(result.steps.security).toBe('passed');
      expect(result.steps.validation).toBe('passed');
      expect(result.steps.transformation).toBe('completed');
      expect(result.steps.calculation).toBe('completed');
      expect(result.steps.reporting).toBe('completed');
    });

    test('includes transformation log', () => {
      const result = processCsvData(validFile, validCsvContent, validCsvData, 'individual');

      expect(result.transformationLog).toBeDefined();
      expect(result.transformationLog.length).toBeGreaterThan(0);
    });
  });

  describe('costsplitterPipeline', () => {
    test('processes complete pipeline from raw CSV', () => {
      const csvContent = `name,group,age,adjustment,cost_dinner,pay_dinner,cost_hotel,pay_hotel
John,Smith,adult,more,full,100,0.5,0
Jane,Johnson,kid,less,reduced,0,full,200`;

      const result = costsplitterPipeline(validFile, csvContent, 'individual');

      expect(result.success).toBe(true);
      expect(result.report).toBeDefined();
      expect(result.parsedData).toHaveLength(2);
    });

    test('handles CSV parsing errors', () => {
      const invalidCsv = 'name,pay\nJohn,"unterminated quote';
      const result = costsplitterPipeline(validFile, invalidCsv, 'individual');

      expect(result.success).toBe(false);
      expect(result.error).toBe('CSV parsing failed');
    });

    test('handles empty CSV', () => {
      const emptyCsv = '';
      const result = costsplitterPipeline(validFile, emptyCsv, 'individual');

      expect(result.success).toBe(false);
      expect(result.error).toBe('CSV parsing failed');
      expect(result.details).toContain('delimiting');
    });

    test('supports group-based calculations', () => {
      const csvContent = `name,group,pay_dinner
John,Smith,100
Jane,Smith,50
Bob,Johnson,75`;

      const result = costsplitterPipeline(validFile, csvContent, 'group');

      expect(result.success).toBe(true);
      expect(result.report.paymentMatrix.length).toBeLessThanOrEqual(2); // Max 2 groups
    });

    test('includes metadata in result', () => {
      const csvContent = 'name,pay_dinner\nJohn,100\nJane,50';
      const result = costsplitterPipeline(validFile, csvContent, 'individual');

      expect(result.metadata).toBeDefined();
      expect(result.metadata.processedAt).toBeDefined();
      expect(result.metadata.paymentMode).toBe('individual');
      expect(result.metadata.participantCount).toBe(2);
    });
  });
});