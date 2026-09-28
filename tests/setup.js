/**
 * Jest test setup file
 * Configures global test environment and polyfills
 */

import { TextEncoder, TextDecoder } from 'util';
import Papa from 'papaparse';

// Polyfills for JSDOM environment
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// public/src/pipeline.js expects Papa as a global (loaded via CDN script tag in production)
global.Papa = Papa;

// Mock URL.createObjectURL and revokeObjectURL for file handling tests
global.URL.createObjectURL = jest.fn(() => 'mock-object-url');
global.URL.revokeObjectURL = jest.fn();

// Mock console methods to reduce test noise
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
  log: jest.fn()
};

// Setup default timeout for async tests
jest.setTimeout(10000);