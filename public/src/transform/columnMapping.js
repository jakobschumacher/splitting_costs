import { HEADER_ALIASES, normalizeValues } from './csvAliases.js';

export const MAPPING_ROLES = [
  'name', 'group', 'age', 'adjustment', 'pay', 'cost', 'iban', 'iban_name', 'ignore',
];

export const detectColumnMapping = (columns) => columns.map((column) => {
  const lowerColumn = column.toLowerCase();

  if (lowerColumn.startsWith('pay_')) {
    return { column, role: 'pay', activity: column.slice(4) };
  }
  if (lowerColumn.startsWith('cost_')) {
    return { column, role: 'cost', activity: column.slice(5) };
  }

  const canonical = HEADER_ALIASES[lowerColumn];
  return { column, role: canonical || 'ignore', activity: '' };
});

export const applyColumnMapping = (data, mapping) => {
  const renamedData = data.map((row) => {
    const mappedRow = {};
    mapping.forEach(({ column, role, activity }) => {
      if (role === 'ignore') return;
      const key = (role === 'pay' || role === 'cost') ? `${role}_${activity}` : role;
      mappedRow[key] = row[column];
    });
    return mappedRow;
  });

  return normalizeValues(renamedData);
};
