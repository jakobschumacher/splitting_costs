const VALID_AGE_CATEGORIES = ['adult', 'kid'];
const VALID_ADJUSTMENT_CATEGORIES = ['more', 'less'];
const VALID_COST_CATEGORIES = ['full', 'reduced', 'half'];

const isValidNumeric = (value) => {
  const num = parseFloat(value);
  return !Number.isNaN(num) && Number.isFinite(num);
};

const isValidAge = (value) => VALID_AGE_CATEGORIES.includes(value.toLowerCase())
         || (isValidNumeric(value) && parseFloat(value) >= 0 && parseFloat(value) <= 120);

const isValidAdjustment = (value) => VALID_ADJUSTMENT_CATEGORIES.includes(value.toLowerCase())
         || (isValidNumeric(value) && parseFloat(value) >= 0);

const isValidCost = (value) => VALID_COST_CATEGORIES.includes(value.toLowerCase())
         || (isValidNumeric(value) && parseFloat(value) >= 0 && parseFloat(value) <= 1);

export const validateNameColumn = (data) => {
  const errors = [];
  const warnings = [];

  if (!data.length || !Object.prototype.hasOwnProperty.call(data[0], 'name')) {
    errors.push({
      row: null,
      column: 'name',
      message: 'Required column "name" is missing',
    });
    return { errors, warnings };
  }

  const seenNames = new Set();
  data.forEach((row, index) => {
    const rowNum = index + 1;
    const name = row.name?.trim();

    if (!name) {
      errors.push({
        row: rowNum,
        column: 'name',
        message: 'Name is required',
      });
    } else if (seenNames.has(name)) {
      errors.push({
        row: rowNum,
        column: 'name',
        message: `Duplicate name "${name}"`,
      });
    } else {
      seenNames.add(name);
    }
  });

  return { errors, warnings };
};

export const validatePayColumns = (data) => {
  const errors = [];
  const warnings = [];

  if (!data.length) return { errors, warnings };

  const payColumns = Object.keys(data[0]).filter((key) => key.startsWith('pay_'));

  if (payColumns.length === 0) {
    errors.push({
      row: null,
      column: 'pay_',
      message: 'At least one "pay_" column is required',
    });
    return { errors, warnings };
  }

  data.forEach((row, index) => {
    const rowNum = index + 1;
    payColumns.forEach((col) => {
      const value = row[col]?.toString().trim();
      if (value && !isValidNumeric(value)) {
        errors.push({
          row: rowNum,
          column: col,
          message: 'Must be numeric or empty',
        });
      }
    });
  });

  return { errors, warnings };
};

export const validateDataTypes = (data) => {
  const errors = [];
  const warnings = [];

  data.forEach((row, index) => {
    const rowNum = index + 1;

    // Validate age column
    if (Object.prototype.hasOwnProperty.call(row, 'age')) {
      const age = row.age?.toString().trim();
      if (age && !isValidAge(age)) {
        errors.push({
          row: rowNum,
          column: 'age',
          message: 'Invalid age value',
        });
      }
    }

    // Validate adjustment column
    if (Object.prototype.hasOwnProperty.call(row, 'adjustment')) {
      const adj = row.adjustment?.toString().trim();
      if (adj && !isValidAdjustment(adj)) {
        errors.push({
          row: rowNum,
          column: 'adjustment',
          message: 'Invalid adjustment value',
        });
      }
    }

    // Validate cost columns
    Object.keys(row).forEach((col) => {
      if (col.startsWith('cost_')) {
        const value = row[col]?.toString().trim();
        if (value && !isValidCost(value)) {
          errors.push({
            row: rowNum,
            column: col,
            message: 'Invalid cost value',
          });
        }
      }
    });
  });

  return { errors, warnings };
};

export const validateDataIntegrity = (data) => {
  const nameValidation = validateNameColumn(data);
  const payValidation = validatePayColumns(data);
  const typeValidation = validateDataTypes(data);

  return {
    errors: [
      ...nameValidation.errors,
      ...payValidation.errors,
      ...typeValidation.errors,
    ],
    warnings: [
      ...nameValidation.warnings,
      ...payValidation.warnings,
      ...typeValidation.warnings,
    ],
  };
};
