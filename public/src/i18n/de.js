export const de = {
  // Header
  'header.title': 'Kostenteiler',
  'header.subtitle': 'Faire Kostenaufteilung für Gruppenreisen',
  'header.description': 'Laden Sie Ihre Ausgaben-CSV-Datei hoch, um automatisch zu berechnen, wer wem was schuldet. Unterstützt individuelle Zahlungen und gemeinsame Ausgaben mit anpassbaren Aufteilungsverhältnissen.',

  // Step 1: Configure Options
  'step1.title': 'Optionen konfigurieren',
  'step1.paymentMode.label': 'Zahlungsmodus',
  'step1.paymentMode.individual': 'Individuell',
  'step1.paymentMode.group': 'Gruppe',
  'step1.paymentMode.description.individual': 'Individuell: Die Ausgaben jeder Person werden separat erfasst',
  'step1.paymentMode.description.group': 'Gruppe: Ausgaben werden nach Familie oder Gruppeneinheiten erfasst',
  'step1.rounding.label': 'Betragsrundung',
  'step1.rounding.exact': 'Exakt',
  'step1.rounding.roundToFive': 'Auf 5€ runden',
  'step1.rounding.description.exact': 'Exakt: Präzise Beträge bis auf Cent beibehalten',
  'step1.rounding.description.roundToFive': 'Auf 5€ runden: Alle Beträge auf nächste 5 Euro runden',

  // Step 2: Upload & Process
  'step2.title': 'CSV-Datei hochladen und verarbeiten',
  'step2.upload.title': 'CSV-Datei hier ablegen oder zum Durchsuchen klicken',
  'step2.upload.subtitle': 'Unterstützt Dateien bis zu 10MB',
  'step2.upload.success': 'Datei erfolgreich hochgeladen!',
  'step2.upload.ready': 'Bereit zur Verarbeitung',
  'step2.progress.title': 'Datei wird verarbeitet',
  'step2.progress.parsing': 'Analysieren',
  'step2.progress.security': 'Sicherheit',
  'step2.progress.validation': 'Validierung',
  'step2.progress.transformation': 'Umwandeln',
  'step2.progress.calculation': 'Berechnen',
  'step2.progress.reporting': 'Bericht',

  // CSV Help
  'csvHelp.title': 'CSV-Dateiformat',
  'csvHelp.description': 'Ihre CSV-Datei sollte die folgenden Spalten enthalten:',
  'csvHelp.columns.activity': 'activity - Name der Ausgabe/Aktivität',
  'csvHelp.columns.paidBy': 'paidBy - Person, die für diese Ausgabe bezahlt hat',
  'csvHelp.columns.amount': 'amount - gezahlter Gesamtbetrag (z.B. 25,50)',
  'csvHelp.columns.participants': 'participants - kommagetrennte Liste der Personen',
  'csvHelp.columns.shares': 'shares (optional) - individuelle Anteile pro Person (z.B. "2,1,1")',
  'csvHelp.example': 'Beispiel:',

  // Step 3: Results
  'step3.title': 'Ergebnisse',
  'step3.paymentInstructions': 'Zahlungsanweisungen',
  'step3.paymentMatrix': 'Zahlungsmatrix',
  'step3.activityBreakdown': 'Aktivitätsaufschlüsselung',
  'step3.downloadPdf': 'PDF-Bericht herunterladen',

  // Summary Cards
  'summary.participants': 'Teilnehmer',
  'summary.totalPaid': 'Gesamt bezahlt',
  'summary.activities': 'Aktivitäten',
  'summary.totalExpenses': 'Gesamtausgaben',
  'summary.totalPeople': 'Anzahl Personen',
  'summary.averagePerPerson': 'Durchschnitt pro Person',
  'summary.transactions': 'Transaktionen',

  // Payment Instructions
  'payment.instructions.empty': 'Alle sind quitt! Keine Zahlungen erforderlich.',
  'payment.instructions.single': 'Nur eine Transaktion erforderlich:',
  'payment.instructions.multiple': 'Transaktionen erforderlich:',
  'payment.pays': 'zahlt',
  'payment.to': 'an',

  // Matrix Headers
  'matrix.owes': 'Schuldet',
  'matrix.receives': 'Erhält',

  // Activity Details
  'activity.totalPaid': 'Gesamt bezahlt',
  'activity.paidBy': 'Bezahlt von',
  'activity.costPerUnit': 'Kosten pro Einheit',
  'activity.shares': 'Anteile',

  // Errors
  'error.title': 'Ein Fehler ist aufgetreten',
  'error.subtitle': 'Bitte versuchen Sie es erneut',
  'error.tryThis': 'Versuchen Sie dies:',
  'error.checkFormat': 'Überprüfen Sie Ihr Dateiformat',
  'error.needHelp': 'Benötigen Sie weitere Hilfe?',
  'error.fileProcessingFailed': 'Dateiverarbeitung fehlgeschlagen',
  'error.invalidFileType': 'Ungültiger Dateityp',
  'error.fileTooLarge': 'Datei zu groß',
  'error.invalidFileTypeDetails': 'Bitte wählen Sie eine CSV-Datei aus',
  'error.fileTooLargeDetails': 'Dateigröße muss weniger als 10MB betragen',
  'error.securityValidationFailed': 'Sicherheitsvalidierung fehlgeschlagen',
  'error.dataValidationFailed': 'Datenvalidierung fehlgeschlagen',
  'error.csvParsingFailed': 'CSV-Analyse fehlgeschlagen',
  'error.processingFailed': 'Verarbeitung fehlgeschlagen',

  // Buttons
  'button.reset': 'Zurücksetzen',
  'button.help': 'Hilfe',

  // Language
  'language.current': 'Deutsch',
  'language.switch': 'Sprache wechseln'
};