// Builds the EPC QR Code payload (aka "GiroCode"), the European standard that
// banking apps scan to pre-fill a SEPA credit transfer. Spec: EPC069-12.
export const buildEpcQrPayload = ({
  name, iban, amount, remittanceInfo = '',
}) => [
  'BCD',
  '002',
  '1',
  'SCT',
  '',
  name.toString().trim().slice(0, 70),
  iban.toString().replace(/\s+/g, '').toUpperCase(),
  `EUR${amount.toFixed(2)}`,
  '',
  '',
  remittanceInfo.toString().trim().slice(0, 140),
].join('\n');
