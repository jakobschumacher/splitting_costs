const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const INJECTION_PATTERNS = [/^=/, /^@/, /^\+/, /^-/, /^\t/, /^\r/];

export const checkFileSize = (fileSize) => {
  const issues = [];

  if (fileSize === 0) {
    issues.push('File is empty');
  } else if (fileSize > MAX_FILE_SIZE) {
    issues.push('File size exceeds 10MB limit');
  }

  return { valid: issues.length === 0, issues };
};

export const checkCsvInjection = (csvContent) => {
  const issues = [];
  const lines = csvContent.split('\n');

  lines.forEach((line) => {
    const cells = line.split(',');
    cells.forEach((cell) => {
      const trimmedCell = cell.trim();

      // Skip empty cells and negative numbers
      if (!trimmedCell || (trimmedCell.startsWith('-') && /^-[\d.]+$/.test(trimmedCell))) {
        return;
      }

      INJECTION_PATTERNS.forEach((pattern) => {
        if (pattern.test(trimmedCell)) {
          const symbol = trimmedCell.charAt(0);
          issues.push(`CSV injection detected: formula starting with ${symbol}`);
        }
      });
    });
  });

  return { valid: issues.length === 0, issues };
};

export const validateSecurityCheck = (file, csvContent) => {
  const fileSizeCheck = checkFileSize(file.size);
  const injectionCheck = checkCsvInjection(csvContent);

  const allIssues = [...fileSizeCheck.issues, ...injectionCheck.issues];

  return {
    secure: allIssues.length === 0,
    issues: allIssues,
  };
};
