import { parseLocaleNumber } from '../public/src/utils/numberParsing.js';

describe('Number Parsing Module', () => {
  test('parses plain English-style decimals', () => {
    expect(parseLocaleNumber('15.5')).toBeCloseTo(15.5);
    expect(parseLocaleNumber('100')).toBe(100);
  });

  test('parses German-style comma decimals', () => {
    expect(parseLocaleNumber('15,5')).toBeCloseTo(15.5);
    expect(parseLocaleNumber('0,8')).toBeCloseTo(0.8);
    expect(parseLocaleNumber('1110,5')).toBeCloseTo(1110.5);
  });

  test('parses German-style thousands + comma decimal', () => {
    expect(parseLocaleNumber('1.110,50')).toBeCloseTo(1110.5);
  });

  test('parses English-style thousands + dot decimal', () => {
    expect(parseLocaleNumber('1,110.50')).toBeCloseTo(1110.5);
  });

  test('handles negative numbers with comma decimals', () => {
    expect(parseLocaleNumber('-20,5')).toBeCloseTo(-20.5);
  });

  test('returns NaN for empty or invalid values', () => {
    expect(parseLocaleNumber('')).toBeNaN();
    expect(parseLocaleNumber(null)).toBeNaN();
    expect(parseLocaleNumber(undefined)).toBeNaN();
    expect(parseLocaleNumber('abc')).toBeNaN();
  });

  test('handles numeric input directly', () => {
    expect(parseLocaleNumber(42)).toBe(42);
  });
});
