// Builds a human-readable, paste-friendly payment text block (for clipboard
// copy or native share), e.g. for sending via Signal or a banking app form.
export const buildPaymentCopyText = ({
  ibanName, iban, amountText, reference, labels,
}) => {
  const lines = [
    `${labels.recipient}: ${ibanName}`,
    `IBAN: ${iban}`,
    `${labels.amount}: ${amountText}`,
  ];

  if (reference) {
    lines.push(`${labels.reference}: ${reference}`);
  }

  return lines.join('\n');
};
