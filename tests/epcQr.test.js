import { buildEpcQrPayload } from '../public/src/reporting/epcQr.js';

describe('EPC QR Payload Module', () => {
  test('builds a valid EPC069-12 payload', () => {
    const payload = buildEpcQrPayload({
      name: 'Max Mustermann',
      iban: 'DE12 3456 7890 1234 5678 90',
      amount: 45.5,
      remittanceInfo: 'Costsplitter: Wochenendtrip',
    });

    const lines = payload.split('\n');
    expect(lines[0]).toBe('BCD');
    expect(lines[1]).toBe('002');
    expect(lines[2]).toBe('1');
    expect(lines[3]).toBe('SCT');
    expect(lines[4]).toBe('');
    expect(lines[5]).toBe('Max Mustermann');
    expect(lines[6]).toBe('DE123456789012345678 90'.replace(' ', ''));
    expect(lines[7]).toBe('EUR45.50');
    expect(lines[10]).toBe('Costsplitter: Wochenendtrip');
  });

  test('strips whitespace from the IBAN and uppercases it', () => {
    const payload = buildEpcQrPayload({
      name: 'Max Mustermann', iban: 'de12 3456 7890', amount: 10,
    });
    const lines = payload.split('\n');
    expect(lines[6]).toBe('DE1234567890');
  });

  test('truncates an overly long recipient name to 70 characters', () => {
    const longName = 'A'.repeat(100);
    const payload = buildEpcQrPayload({ name: longName, iban: 'DE123', amount: 1 });
    const lines = payload.split('\n');
    expect(lines[5]).toHaveLength(70);
  });

  test('formats the amount with exactly two decimals', () => {
    const payload = buildEpcQrPayload({ name: 'A', iban: 'DE1', amount: 7 });
    expect(payload).toContain('EUR7.00');
  });

  test('defaults remittance info to an empty line when omitted', () => {
    const payload = buildEpcQrPayload({ name: 'A', iban: 'DE1', amount: 1 });
    const lines = payload.split('\n');
    expect(lines[10]).toBe('');
  });
});
