export const en = {
  // Header
  'header.title': 'Costsplitter',
  'header.subtitle': 'Fair cost division for group travel',
  'header.description': 'Group travel is great. But the billing can be difficult. This tool helps you with that. Create an expense CSV file. Upload the file here. The app then calculates who owes what to whom. The app offers the possibility to adjust costs: per activity, by age and based on a solidarity range.',

  // Step 1: Upload Your Data
  'step1.title': 'Upload Your Data',
  'step1.csvFormatHelp': 'Click here to see how the file should be structured',
  'step1.upload.title': 'Drop your CSV file here or click to browse',
  'step1.upload.subtitle': 'Supports files up to 10MB',
  'step1.upload.success': 'File uploaded successfully!',
  'step1.upload.ready': 'Ready to configure processing options',
  'step1.welcome.exampleText': 'Need an example? Try one of our sample files:',
  'step1.welcome.examples.simple': 'Simple Dinner',
  'step1.welcome.examples.family': 'Family Trip',
  'step1.welcome.examples.business': 'Business Travel',

  // Step 2: Configure & Process
  'step2.title': 'Configure & Process',
  'step2.disabled.title': 'Processing Options',
  'step2.disabled.message': 'Upload a CSV file to configure processing options',
  'step2.options.title': 'Processing Options',
  'step2.paymentMode.label': 'Payment Mode',
  'step2.paymentMode.individual': 'Individual',
  'step2.paymentMode.group': 'Group',
  'step2.paymentMode.description.individual': 'Individual: Each person\'s expenses are tracked separately',
  'step2.paymentMode.description.group': 'Group: Expenses are tracked by family or group units',
  'step2.rounding.label': 'Amount Rounding',
  'step2.rounding.exact': 'Exact',
  'step2.rounding.roundToFive': 'Round to 5€',
  'step2.rounding.description.exact': 'Exact: Keep precise amounts down to cents',
  'step2.rounding.description.roundToFive': 'Round to 5€: Round all amounts to nearest 5 Euro',
  'step2.processButton': 'Process File',
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
  'csvHelp.columns.name': 'name - participant name (required)',
  'csvHelp.columns.group': 'group - optional grouping (e.g., family name)',
  'csvHelp.columns.pay': 'pay_[activity] - amount already paid for activity',
  'csvHelp.columns.cost': 'cost_[activity] - participation level (full, half, 0.5, etc.)',
  'csvHelp.columns.age': 'age - optional age or category (adult, kid, numeric)',
  'csvHelp.columns.adjustment': 'adjustment - optional payment modifier (more, less, 1.2)',
  'csvHelp.example': 'Example:',
  'csvHelp.commonIssues': 'Common Issues:',
  'csvHelp.issue1': '• Missing "name" column - this is required for all participants',
  'csvHelp.issue2': '• Mixing text and numbers in payment columns (use numbers only)',
  'csvHelp.issue3': '• File saved as Excel (.xlsx) instead of CSV format',
  'csvHelp.issue4': '• Extra commas or quotes causing parsing errors',
  'csvHelp.examples': 'Need an example? Try:',
  'csvHelp.closeHelp': 'Close Help',

  // Step-specific Help
  'help.step1.title': 'Getting Started',
  'help.step1.description': 'Upload your CSV file with expense data to begin cost splitting calculations.',
  'help.step2.title': 'Processing Options',
  'help.step2.description': 'Choose how to handle payments and rounding before processing your data.',
  'help.step2.paymentModes': 'Payment Modes: Individual tracks each person separately, Group combines family/team units.',
  'help.step2.rounding': 'Rounding: Exact keeps precise amounts, Round to 5€ simplifies final payments.',
  'help.step3.title': 'Understanding Results',
  'help.step3.description': 'Review who owes what to whom and download a detailed payment report.',
  'help.step3.matrix': 'Payment Matrix shows each person\'s obligations and the actions needed.',
  'help.step3.pdf': 'Download the PDF report for detailed activity breakdown and comprehensive analysis.',

  // Step 3: Results
  'step3.title': 'Results',
  'step3.disabled.title': 'Payment Results',
  'step3.disabled.message': 'Process your file to see payment calculations and reports',
  'step3.paymentInstructions': 'Payment Instructions',
  'step3.paymentMatrix': 'Payment Overview',
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
  'payment.receives': 'Receives',
  'payment.from': 'from',

  // Matrix Headers
  'matrix.name': 'Name',
  'matrix.shouldPay': 'Should Pay',
  'matrix.alreadyPaid': 'Already Paid',
  'matrix.netAmount': 'Net Amount',
  'matrix.action': 'Action',
  'matrix.settled': 'Settled',
  'matrix.owes': 'Owes money',
  'matrix.receives': 'Receives money',
  'matrix.noPaymentsNeeded': 'No payments needed - everyone is settled!',

  // Activity Details
  'activity.totalPaid': 'Total Paid',
  'activity.paidBy': 'Paid by',
  'activity.costPerUnit': 'Cost per unit',
  'activity.shares': 'shares',
  'activity.charges': 'Charges',

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

  // Language
  'language.current': 'English',
  'language.switch': 'Switch Language'
};