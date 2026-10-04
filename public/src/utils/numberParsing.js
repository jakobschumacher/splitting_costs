// Parses numbers that may use a German-style comma decimal separator
// (e.g. "15,5" or "1.110,50"), as well as plain English-style numbers.
export const parseLocaleNumber = (value) => {
  if (value === null || value === undefined) return NaN;

  const str = value.toString().trim();
  if (str === '') return NaN;

  const hasComma = str.includes(',');
  const hasDot = str.includes('.');

  let normalized = str;

  if (hasComma && hasDot) {
    // Whichever separator appears last is the decimal separator;
    // the other is treated as a thousands separator and stripped.
    const isCommaDecimal = str.lastIndexOf(',') > str.lastIndexOf('.');
    normalized = isCommaDecimal
      ? str.replace(/\./g, '').replace(',', '.')
      : str.replace(/,/g, '');
  } else if (hasComma) {
    normalized = str.replace(',', '.');
  }

  return parseFloat(normalized);
};
