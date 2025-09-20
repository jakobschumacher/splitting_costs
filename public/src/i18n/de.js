export const de = {
  // Header
  'header.title': 'Costsplitter',
  'header.subtitle': 'Faire Kostenaufteilung für Gruppenreisen',
  'header.description': 'Laden Sie Ihre Ausgaben-CSV-Datei hoch, um automatisch zu berechnen, wer wem was schuldet. Unterstützt individuelle Zahlungen und gemeinsame Ausgaben mit anpassbaren Aufteilungsverhältnissen.',

  // Step 1: Welcome & Get Started
  'step1.title': 'Loslegen',
  'step1.welcome.title': 'Laden Sie Ihre Ausgabendaten hoch',
  'step1.welcome.description': 'Laden Sie Ihre CSV-Datei mit Gruppenausgaben hoch und erhalten Sie sofortige Zahlungsberechnungen. Faire Aufteilung leicht gemacht mit Unterstützung für verschiedene Teilnahmelevel und Zahlungspräferenzen.',
  'step1.welcome.uploadButton': '📁 CSV-Datei hochladen',
  'step1.welcome.fileInfo': 'Unterstützt .csv-Dateien bis zu 10MB',
  'step1.welcome.exampleText': 'Benötigen Sie ein Beispiel? Probieren Sie eine unserer Beispieldateien:',
  'step1.welcome.examples.simple': 'Einfaches Abendessen',
  'step1.welcome.examples.family': 'Familienreise',
  'step1.welcome.examples.business': 'Geschäftsreise',

  // Step 2: Upload & Process
  'step2.title': 'CSV-Datei hochladen und verarbeiten',
  'step2.upload.title': 'CSV-Datei hier ablegen oder zum Durchsuchen klicken',
  'step2.upload.subtitle': 'Unterstützt Dateien bis zu 10MB',
  'step2.upload.success': 'Datei erfolgreich hochgeladen!',
  'step2.upload.ready': 'Bereit zur Verarbeitung',
  'step2.options.title': 'Verarbeitungsoptionen',
  'step2.paymentMode.label': 'Zahlungsmodus',
  'step2.paymentMode.individual': 'Individuell',
  'step2.paymentMode.group': 'Gruppe',
  'step2.paymentMode.description.individual': 'Individuell: Die Ausgaben jeder Person werden separat erfasst',
  'step2.paymentMode.description.group': 'Gruppe: Ausgaben werden nach Familie oder Gruppeneinheiten erfasst',
  'step2.rounding.label': 'Betragsrundung',
  'step2.rounding.exact': 'Exakt',
  'step2.rounding.roundToFive': 'Auf 5€ runden',
  'step2.rounding.description.exact': 'Exakt: Präzise Beträge bis auf Cent beibehalten',
  'step2.rounding.description.roundToFive': 'Auf 5€ runden: Alle Beträge auf nächste 5 Euro runden',
  'step2.processButton': 'Datei verarbeiten',
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
  'csvHelp.columns.name': 'name - Teilnehmername (erforderlich)',
  'csvHelp.columns.group': 'group - optionale Gruppierung (z.B. Familienname)',
  'csvHelp.columns.pay': 'pay_[aktivität] - bereits gezahlter Betrag für Aktivität',
  'csvHelp.columns.cost': 'cost_[aktivität] - Teilnahmelevel (full, half, 0.5, etc.)',
  'csvHelp.columns.age': 'age - optionales Alter oder Kategorie (adult, kid, numerisch)',
  'csvHelp.columns.adjustment': 'adjustment - optionaler Zahlungsmodifikator (more, less, 1.2)',
  'csvHelp.example': 'Beispiel:',

  // Step 3: Results
  'step3.title': 'Ergebnisse',
  'step3.paymentInstructions': 'Zahlungsanweisungen',
  'step3.paymentMatrix': 'Zahlungsübersicht',
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
  'payment.receives': 'Erhält',
  'payment.from': 'von',

  // Matrix Headers
  'matrix.name': 'Name',
  'matrix.shouldPay': 'Soll zahlen',
  'matrix.alreadyPaid': 'Bereits bezahlt',
  'matrix.netAmount': 'Nettobetrag',
  'matrix.action': 'Aktion',
  'matrix.settled': 'Ausgeglichen',
  'matrix.owes': 'Schuldet Geld',
  'matrix.receives': 'Erhält Geld',
  'matrix.noPaymentsNeeded': 'Keine Zahlungen erforderlich - alle sind ausgeglichen!',

  // Activity Details
  'activity.totalPaid': 'Gesamt bezahlt',
  'activity.paidBy': 'Bezahlt von',
  'activity.costPerUnit': 'Kosten pro Einheit',
  'activity.shares': 'Anteile',
  'activity.charges': 'Kosten',

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