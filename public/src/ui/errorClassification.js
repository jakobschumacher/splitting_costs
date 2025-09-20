// Error Classification System - Based on User Agency & Actionability
// Implements Ursula's 3-tier error response strategy

export const ERROR_TYPES = {
  USER_FIXABLE: 'user-fixable', // 🟢 Max technical detail - user can fix
  USER_ACTIONABLE: 'user-actionable', // 🟡 Medium detail - user can take action
  SYSTEM_ERROR: 'system-error', // 🔴 Minimal detail - system/network issue
};

export const ERROR_CLASSIFICATIONS = {
  // 🟢 USER-FIXABLE ERRORS (Show maximum technical detail)
  'Data validation failed': {
    type: ERROR_TYPES.USER_FIXABLE,
    primaryMessage: 'We found problems in your CSV file',
    helpText: 'Fix these issues in your CSV file and try again',
    showTechnicalDetails: true,
    showValidationErrors: true,
    showCsvColumns: true,
    actionable: true,
    tone: 'empowering', // "YOUR file" language
  },

  'CSV parsing failed': {
    type: ERROR_TYPES.USER_FIXABLE,
    primaryMessage: 'Your CSV file format has issues',
    helpText: 'Check your file format and try again',
    showTechnicalDetails: true,
    showValidationErrors: false,
    showCsvColumns: true,
    actionable: true,
    tone: 'empowering',
  },

  // 🟡 USER-ACTIONABLE ERRORS (Medium detail level)
  'Security validation failed': {
    type: ERROR_TYPES.USER_ACTIONABLE,
    primaryMessage: 'Security check detected potential issues',
    helpText: 'Remove any formulas or suspicious content from your CSV',
    showTechnicalDetails: false,
    showValidationErrors: false,
    showCsvColumns: false,
    actionable: true,
    tone: 'helpful',
  },

  // 🔴 SYSTEM ERRORS (Minimal technical detail)
  'Pipeline processing failed': {
    type: ERROR_TYPES.SYSTEM_ERROR,
    primaryMessage: 'Something went wrong on our end',
    helpText: 'Please try again or contact support if the problem persists',
    showTechnicalDetails: false,
    showValidationErrors: false,
    showCsvColumns: false,
    actionable: false,
    tone: 'apologetic', // "OUR end" language
  },

  'Pipeline initialization failed': {
    type: ERROR_TYPES.SYSTEM_ERROR,
    primaryMessage: 'System error occurred',
    helpText: 'Please refresh the page and try again',
    showTechnicalDetails: false,
    showValidationErrors: false,
    showCsvColumns: false,
    actionable: false,
    tone: 'apologetic',
  },

  'File processing failed': {
    type: ERROR_TYPES.SYSTEM_ERROR,
    primaryMessage: 'Unable to process your file',
    helpText: 'Please try again or use a different file',
    showTechnicalDetails: false,
    showValidationErrors: false,
    showCsvColumns: false,
    actionable: false,
    tone: 'apologetic',
  },
};

// Get error classification with intelligent defaults
export function classifyError(errorType, errorDetails = {}) {
  const classification = ERROR_CLASSIFICATIONS[errorType] || {
    // Default fallback for unknown errors
    type: ERROR_TYPES.SYSTEM_ERROR,
    primaryMessage: 'An unexpected error occurred',
    helpText: 'Please try again or contact support',
    showTechnicalDetails: false,
    showValidationErrors: false,
    showCsvColumns: false,
    actionable: false,
    tone: 'apologetic',
  };

  // Enhance classification based on context
  const enhanced = { ...classification };

  // Auto-upgrade to show more detail if validation errors exist
  if (errorDetails.validationErrors && errorDetails.validationErrors.length > 0) {
    enhanced.showValidationErrors = true;
    enhanced.showTechnicalDetails = true;
  }

  // Auto-show CSV columns for parsing/validation issues
  if (errorDetails.metadata && errorDetails.metadata.csvColumns) {
    enhanced.showCsvColumns = true;
  }

  return enhanced;
}

// Generate user-friendly error suggestions based on error type
export function generateErrorSuggestions(errorType) {
  const suggestions = [];

  switch (errorType) {
    case 'Data validation failed':
      suggestions.push('Check that all required columns are present');
      suggestions.push('Ensure numeric values don\'t contain text');
      suggestions.push('Verify column names match the expected format');
      break;

    case 'CSV parsing failed':
      suggestions.push('Save your file as CSV format (not Excel)');
      suggestions.push('Check for missing commas or extra quotation marks');
      suggestions.push('Ensure all rows have the same number of columns');
      break;

    case 'Security validation failed':
      suggestions.push('Remove any formulas starting with = or @');
      suggestions.push('Check file size is under 10MB');
      suggestions.push('Use plain text values only');
      break;

    default:
      suggestions.push('Try refreshing the page and uploading again');
      break;
  }

  return suggestions;
}

// Generate context-aware help links
export function generateHelpResources(errorType) {
  const resources = [];

  switch (errorType) {
    case 'Data validation failed':
    case 'CSV parsing failed':
      resources.push({
        title: 'CSV Format Guide',
        description: 'Learn about proper CSV file structure',
        action: 'View Guide',
      });
      resources.push({
        title: 'Example Files',
        description: 'Download working CSV examples',
        action: 'Download Examples',
      });
      break;

    case 'Security validation failed':
      resources.push({
        title: 'Security Guidelines',
        description: 'Understand file security requirements',
        action: 'Learn More',
      });
      break;

    default:
      // No default help resources needed
      break;
  }

  return resources;
}
