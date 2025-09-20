export const en = {
  // Header
  'header.title': 'Costsplitter',
  'header.subtitle': 'Fair cost division for group travel',
  'header.description': 'Upload your expense CSV file to automatically calculate who owes what to whom. Supports individual payments and shared expenses with customizable split ratios.',

  // Step 1: Configure Options
  'step1.title': 'Configure Options',
  'step1.paymentMode.label': 'Payment Mode',
  'step1.paymentMode.individual': 'Individual',
  'step1.paymentMode.group': 'Group',
  'step1.paymentMode.description.individual': 'Individual: Each person\'s expenses are tracked separately',
  'step1.paymentMode.description.group': 'Group: Expenses are tracked by family or group units',
  'step1.rounding.label': 'Amount Rounding',
  'step1.rounding.exact': 'Exact',
  'step1.rounding.roundToFive': 'Round to 5€',
  'step1.rounding.description.exact': 'Exact: Keep precise amounts down to cents',
  'step1.rounding.description.roundToFive': 'Round to 5€: Round all amounts to nearest 5 Euro',

  // Step 2: Upload & Process
  'step2.title': 'Upload & Process Your CSV File',
  'step2.upload.title': 'Drop your CSV file here or click to browse',
  'step2.upload.subtitle': 'Supports files up to 10MB',
  'step2.upload.success': 'File uploaded successfully!',
  'step2.upload.ready': 'Ready to process',
  'step2.progress.title': 'Processing Your File',
  'step2.progress.parsing': 'Parsing',
  'step2.progress.security': 'Security',
  'step2.progress.validation': 'Validation',
  'step2.progress.transformation': 'Transform',
  'step2.progress.calculation': 'Calculate',
  'step2.progress.reporting': 'Report',

  // CSV Help
  'csvHelp.title': 'CSV File Format',
  'csvHelp.description': 'Your CSV should contain the following columns:',
  'csvHelp.columns.activity': 'activity - name of the expense/activity',
  'csvHelp.columns.paidBy': 'paidBy - person who paid for this expense',
  'csvHelp.columns.amount': 'amount - total amount paid (e.g., 25.50)',
  'csvHelp.columns.participants': 'participants - comma-separated list of people',
  'csvHelp.columns.shares': 'shares (optional) - custom shares per person (e.g., "2,1,1")',
  'csvHelp.example': 'Example:',

  // Step 3: Results
  'step3.title': 'Results',
  'step3.paymentInstructions': 'Payment Instructions',
  'step3.paymentMatrix': 'Payment Matrix',
  'step3.activityBreakdown': 'Activity Breakdown',
  'step3.downloadPdf': 'Download PDF Report',

  // Summary Cards
  'summary.participants': 'Participants',
  'summary.totalPaid': 'Total Paid',
  'summary.activities': 'Activities',
  'summary.totalExpenses': 'Total Expenses',
  'summary.totalPeople': 'Total People',
  'summary.averagePerPerson': 'Average per Person',
  'summary.transactions': 'Transactions',

  // Payment Instructions
  'payment.instructions.empty': 'Everyone is settled up! No payments needed.',
  'payment.instructions.single': 'Only one transaction needed:',
  'payment.instructions.multiple': 'transactions needed:',
  'payment.pays': 'pays',
  'payment.to': 'to',

  // Matrix Headers
  'matrix.owes': 'Owes',
  'matrix.receives': 'Receives',

  // Activity Details
  'activity.totalPaid': 'Total Paid',
  'activity.paidBy': 'Paid by',
  'activity.costPerUnit': 'Cost per unit',
  'activity.shares': 'shares',

  // Errors
  'error.title': 'An error occurred',
  'error.subtitle': 'Please try again',
  'error.tryThis': 'Try This:',
  'error.checkFormat': 'Check your file format',
  'error.needHelp': 'Need More Help?',
  'error.fileProcessingFailed': 'File processing failed',
  'error.invalidFileType': 'Invalid file type',
  'error.fileTooLarge': 'File too large',
  'error.invalidFileTypeDetails': 'Please select a CSV file',
  'error.fileTooLargeDetails': 'File size must be less than 10MB',
  'error.securityValidationFailed': 'Security validation failed',
  'error.dataValidationFailed': 'Data validation failed',
  'error.csvParsingFailed': 'CSV parsing failed',
  'error.processingFailed': 'Processing Failed',

  // Buttons
  'button.reset': 'Reset',
  'button.help': 'Help',

  // Language
  'language.current': 'English',
  'language.switch': 'Switch Language'
};