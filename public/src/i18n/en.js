export const en = {
  // Header
  'header.title': 'Costsplitter',
  'header.subtitle': 'Fair cost division for group travel',
  'header.description': 'Upload your expense CSV file to automatically calculate who owes what to whom. Supports individual payments and shared expenses with customizable split ratios.',

  // Step 1: Welcome & Get Started
  'step1.title': 'Get Started',
  'step1.welcome.title': 'Upload Your Expense Data',
  'step1.welcome.description': 'Drop your CSV file with group expenses and get instant payment calculations. Fair splitting made simple with support for different participation levels and payment preferences.',
  'step1.welcome.uploadButton': '📁 Upload CSV File',
  'step1.welcome.fileInfo': 'Supports .csv files up to 10MB',
  'step1.welcome.exampleText': 'Need an example? Try one of our sample files:',
  'step1.welcome.examples.simple': 'Simple Dinner',
  'step1.welcome.examples.family': 'Family Trip',
  'step1.welcome.examples.business': 'Business Travel',

  // Step 2: Upload & Process
  'step2.title': 'Upload & Process Your CSV File',
  'step2.upload.title': 'Drop your CSV file here or click to browse',
  'step2.upload.subtitle': 'Supports files up to 10MB',
  'step2.upload.success': 'File uploaded successfully!',
  'step2.upload.ready': 'Ready to process',
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

  // Step 3: Results
  'step3.title': 'Results',
  'step3.paymentInstructions': 'Payment Instructions',
  'step3.paymentMatrix': 'Payment Overview',
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
  'button.help': 'Help',

  // Language
  'language.current': 'English',
  'language.switch': 'Switch Language'
};