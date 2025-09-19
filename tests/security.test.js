import { checkFileSize, checkCsvInjection, validateSecurityCheck } from '../src/security/security.js';

describe('Security Module', () => {
  describe('checkFileSize', () => {
    test('accepts file under 10MB', () => {
      const result = checkFileSize(5000000); // 5MB
      expect(result.valid).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    test('rejects file over 10MB', () => {
      const result = checkFileSize(15000000); // 15MB
      expect(result.valid).toBe(false);
      expect(result.issues).toContain('File size exceeds 10MB limit');
    });

    test('rejects zero byte file', () => {
      const result = checkFileSize(0);
      expect(result.valid).toBe(false);
      expect(result.issues).toContain('File is empty');
    });
  });

  describe('checkCsvInjection', () => {
    test('detects formula injection with equals sign', () => {
      const csvContent = 'name,amount\nJohn,100\n=SUM(A1:A2),200';
      const result = checkCsvInjection(csvContent);
      expect(result.valid).toBe(false);
      expect(result.issues).toContain('CSV injection detected: formula starting with =');
    });

    test('detects formula injection with @ symbol', () => {
      const csvContent = 'name,amount\nJohn,100\n@INDIRECT("A1"),200';
      const result = checkCsvInjection(csvContent);
      expect(result.valid).toBe(false);
      expect(result.issues).toContain('CSV injection detected: formula starting with @');
    });

    test('accepts clean CSV content', () => {
      const csvContent = 'name,amount\nJohn,100\nJane,200';
      const result = checkCsvInjection(csvContent);
      expect(result.valid).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    test('accepts negative numbers', () => {
      const csvContent = 'name,amount\nJohn,-100\nJane,200';
      const result = checkCsvInjection(csvContent);
      expect(result.valid).toBe(true);
      expect(result.issues).toHaveLength(0);
    });
  });

  describe('validateSecurityCheck', () => {
    test('performs complete security validation', () => {
      const file = { size: 5000000 };
      const csvContent = 'name,amount\nJohn,100\nJane,200';
      const result = validateSecurityCheck(file, csvContent);
      expect(result.secure).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    test('fails on multiple security issues', () => {
      const file = { size: 15000000 };
      const csvContent = 'name,amount\nJohn,100\n=SUM(A1:A2),200';
      const result = validateSecurityCheck(file, csvContent);
      expect(result.secure).toBe(false);
      expect(result.issues.length).toBeGreaterThan(1);
    });
  });
});