import Papa from 'papaparse';
import { validateSecurityCheck } from './security/security';
import { validateDataIntegrity } from './validation/validation';
import { transformDataToNumeric } from './transform/transform';
import { calculatePaymentObligations } from './calculation/calculation';
import { generateCompleteReport } from './reporting/reporting';

export const processCsvData = (file, csvContent, parsedData, paymentMode = 'individual') => {
  const result = {
    success: false,
    steps: {},
    transformationLog: [],
    metadata: {
      processedAt: new Date().toISOString(),
      paymentMode,
      participantCount: parsedData.length,
    },
  };

  try {
    // Step 1: Security validation
    const securityCheck = validateSecurityCheck(file, csvContent);
    if (!securityCheck.secure) {
      return {
        ...result,
        error: 'Security validation failed',
        details: securityCheck.issues,
        steps: { security: 'failed' },
      };
    }
    result.steps.security = 'passed';

    // Step 2: Data validation
    const validation = validateDataIntegrity(parsedData);
    if (validation.errors.length > 0) {
      return {
        ...result,
        error: 'Data validation failed',
        validationErrors: validation.errors,
        validationWarnings: validation.warnings,
        steps: { ...result.steps, validation: 'failed' },
      };
    }
    result.steps.validation = 'passed';

    // Step 3: Data transformation
    const transformation = transformDataToNumeric(parsedData);
    result.transformationLog = transformation.transformationLog;
    result.steps.transformation = 'completed';

    // Step 4: Cost calculation
    const calculation = calculatePaymentObligations(transformation.transformedData, paymentMode);
    result.steps.calculation = 'completed';

    // Step 5: Report generation
    const report = generateCompleteReport(calculation);
    result.steps.reporting = 'completed';

    return {
      ...result,
      success: true,
      report,
    };
  } catch (error) {
    return {
      ...result,
      error: 'Pipeline processing failed',
      details: error.message,
    };
  }
};

export const costsplitterPipeline = (file, csvContent, paymentMode = 'individual') => {
  try {
    // Parse CSV content
    const parseResult = Papa.parse(csvContent, {
      header: true,
      skipEmptyLines: true,
      transform: (value) => value.trim(),
    });

    if (parseResult.errors.length > 0) {
      return {
        success: false,
        error: 'CSV parsing failed',
        details: parseResult.errors.map((e) => e.message).join('; '),
      };
    }

    if (!parseResult.data || parseResult.data.length === 0) {
      return {
        success: false,
        error: 'CSV parsing failed',
        details: 'No data found in CSV',
      };
    }

    // Process the parsed data through the pipeline
    const pipelineResult = processCsvData(file, csvContent, parseResult.data, paymentMode);

    return {
      ...pipelineResult,
      parsedData: parseResult.data,
      metadata: {
        ...pipelineResult.metadata,
        csvColumns: Object.keys(parseResult.data[0] || {}),
        originalRows: parseResult.data.length,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: 'Pipeline initialization failed',
      details: error.message,
    };
  }
};
