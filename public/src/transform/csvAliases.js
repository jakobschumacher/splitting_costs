const HEADER_ALIASES = {
  name: 'name',
  group: 'group',
  gruppe: 'group',
  familie: 'group',
  age: 'age',
  alter: 'age',
  adjustment: 'adjustment',
  anpassung: 'adjustment',
};

const VALUE_ALIASES = {
  age: {
    erwachsen: 'adult',
    kind: 'kid',
  },
  adjustment: {
    mehr: 'more',
    weniger: 'less',
  },
  cost: {
    voll: 'full',
    reduziert: 'reduced',
    halb: 'half',
  },
};

const renameKey = (key) => {
  if (key.startsWith('pay_')) return `pay_${key.slice(4)}`;
  if (key.startsWith('cost_')) return `cost_${key.slice(5)}`;

  const canonical = HEADER_ALIASES[key.toLowerCase()];
  return canonical || key;
};

export const normalizeHeaders = (data) => data.map((row) => {
  const normalizedRow = {};
  Object.keys(row).forEach((key) => {
    normalizedRow[renameKey(key)] = row[key];
  });
  return normalizedRow;
});

const translateValue = (value, aliases) => {
  if (!value) return value;
  const translated = aliases[value.toString().trim().toLowerCase()];
  return translated || value;
};

export const normalizeValues = (data) => data.map((row) => {
  const normalizedRow = { ...row };

  if (Object.prototype.hasOwnProperty.call(row, 'age')) {
    normalizedRow.age = translateValue(row.age, VALUE_ALIASES.age);
  }

  if (Object.prototype.hasOwnProperty.call(row, 'adjustment')) {
    normalizedRow.adjustment = translateValue(row.adjustment, VALUE_ALIASES.adjustment);
  }

  Object.keys(row).forEach((key) => {
    if (key.startsWith('cost_')) {
      normalizedRow[key] = translateValue(row[key], VALUE_ALIASES.cost);
    }
  });

  return normalizedRow;
});

export const normalizeCsvData = (data) => normalizeValues(normalizeHeaders(data));
