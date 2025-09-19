const AGE_MAPPINGS = {
  adult: 18,
  kid: 9,
};

const ADJUSTMENT_MAPPINGS = {
  more: 1.2,
  less: 0.8,
};

const COST_MAPPINGS = {
  full: 1,
  reduced: 0.7,
  half: 0.5,
};

export const transformAge = (value) => {
  if (!value || value === '' || value === 'undefined') {
    return { value: 18, log: 'Empty age defaulted to 18' };
  }

  const lowerValue = value.toString().toLowerCase();
  if (AGE_MAPPINGS[lowerValue] !== undefined) {
    return {
      value: AGE_MAPPINGS[lowerValue],
      log: `Transformed "${value}" to ${AGE_MAPPINGS[lowerValue]}`,
    };
  }

  const numericValue = parseFloat(value);
  if (!Number.isNaN(numericValue)) {
    return { value: numericValue, log: '' };
  }

  return { value: 18, log: `Invalid age "${value}" defaulted to 18` };
};

export const transformAdjustment = (value) => {
  if (!value || value === '' || value === 'undefined') {
    return { value: 1, log: 'Empty adjustment defaulted to 1' };
  }

  const lowerValue = value.toString().toLowerCase();
  if (ADJUSTMENT_MAPPINGS[lowerValue] !== undefined) {
    return {
      value: ADJUSTMENT_MAPPINGS[lowerValue],
      log: `Transformed "${value}" to ${ADJUSTMENT_MAPPINGS[lowerValue]}`,
    };
  }

  const numericValue = parseFloat(value);
  if (!Number.isNaN(numericValue)) {
    return { value: numericValue, log: '' };
  }

  return { value: 1, log: `Invalid adjustment "${value}" defaulted to 1` };
};

export const transformCostValues = (value) => {
  if (!value || value === '' || value === 'undefined') {
    return { value: 0, log: 'Empty cost defaulted to 0' };
  }

  const lowerValue = value.toString().toLowerCase();
  if (COST_MAPPINGS[lowerValue] !== undefined) {
    return {
      value: COST_MAPPINGS[lowerValue],
      log: `Transformed "${value}" to ${COST_MAPPINGS[lowerValue]}`,
    };
  }

  const numericValue = parseFloat(value);
  if (!Number.isNaN(numericValue)) {
    return { value: numericValue, log: '' };
  }

  return { value: 0, log: `Invalid cost "${value}" defaulted to 0` };
};

export const addMissingColumns = (data) => {
  if (!data.length) return { data: [], log: [] };

  const log = [];
  const processedData = data.map((row) => ({ ...row }));

  // Add group column if missing
  if (!Object.prototype.hasOwnProperty.call(processedData[0], 'group')) {
    processedData.forEach((row, index) => {
      processedData[index] = { ...row, group: 'Individual' };
    });
    log.push('Added missing group column with default "Individual"');
  }

  // Add age column if missing
  if (!Object.prototype.hasOwnProperty.call(processedData[0], 'age')) {
    processedData.forEach((row, index) => {
      processedData[index] = { ...row, age: 'adult' };
    });
    log.push('Added missing age column with default "adult"');
  }

  // Add adjustment column if missing
  if (!Object.prototype.hasOwnProperty.call(processedData[0], 'adjustment')) {
    processedData.forEach((row, index) => {
      processedData[index] = { ...row, adjustment: 1 };
    });
    log.push('Added missing adjustment column with default 1');
  }

  // Add corresponding cost columns for pay columns
  const payColumns = Object.keys(processedData[0]).filter((key) => key.startsWith('pay_'));
  payColumns.forEach((payCol) => {
    const costCol = payCol.replace('pay_', 'cost_');
    if (!Object.prototype.hasOwnProperty.call(processedData[0], costCol)) {
      processedData.forEach((row, index) => {
        processedData[index] = { ...row, [costCol]: 1 };
      });
      log.push(`Added missing ${costCol} column with default 1`);
    }
  });

  return { data: processedData, log };
};

export const transformDataToNumeric = (data) => {
  const transformationLog = [];

  // First add missing columns
  const { data: dataWithColumns, log: columnLog } = addMissingColumns(data);
  transformationLog.push(...columnLog);

  // Transform each row
  const transformedData = dataWithColumns.map((row, rowIndex) => {
    const transformedRow = { ...row };

    // Transform age
    if (Object.prototype.hasOwnProperty.call(row, 'age')) {
      const ageResult = transformAge(row.age);
      transformedRow.age = ageResult.value;
      if (ageResult.log) {
        transformationLog.push(`Row ${rowIndex + 1}: ${ageResult.log}`);
      }
    }

    // Transform adjustment
    if (Object.prototype.hasOwnProperty.call(row, 'adjustment')) {
      const adjResult = transformAdjustment(row.adjustment);
      transformedRow.adjustment = adjResult.value;
      if (adjResult.log) {
        transformationLog.push(`Row ${rowIndex + 1}: ${adjResult.log}`);
      }
    }

    // Transform pay columns to numeric
    Object.keys(row).forEach((key) => {
      if (key.startsWith('pay_')) {
        const value = row[key];
        const numericValue = (!value || value === '') ? 0 : parseFloat(value);
        transformedRow[key] = Number.isNaN(numericValue) ? 0 : numericValue;
      }
    });

    // Transform cost columns
    Object.keys(row).forEach((key) => {
      if (key.startsWith('cost_')) {
        const costResult = transformCostValues(row[key]);
        transformedRow[key] = costResult.value;
        if (costResult.log) {
          transformationLog.push(`Row ${rowIndex + 1}, ${key}: ${costResult.log}`);
        }
      }
    });

    return transformedRow;
  });

  return { transformedData, transformationLog };
};
