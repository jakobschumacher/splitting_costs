import { buildPaymentCopyText } from '../public/src/reporting/paymentText.js';

describe('Payment Copy Text Module', () => {
  const labels = { recipient: 'Empfänger', amount: 'Betrag', reference: 'Verwendungszweck' };

  test('builds a paste-friendly text block with IBAN and reference', () => {
    const text = buildPaymentCopyText({
      ibanName: 'Max Mustermann',
      iban: 'DE12 3456 7890',
      amountText: '45,00 €',
      reference: 'Wochenendtrip',
      labels,
    });

    expect(text).toBe(
      'Empfänger: Max Mustermann\nIBAN: DE12 3456 7890\nBetrag: 45,00 €\nVerwendungszweck: Wochenendtrip',
    );
  });

  test('omits the reference line when no reference is given', () => {
    const text = buildPaymentCopyText({
      ibanName: 'Max Mustermann', iban: 'DE12', amountText: '10,00 €', reference: '', labels,
    });

    expect(text).toBe('Empfänger: Max Mustermann\nIBAN: DE12\nBetrag: 10,00 €');
  });
});
