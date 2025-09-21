export const de = {
  // Header
  'header.title': 'Costsplitter',
  'header.subtitle': 'Faire Kostenaufteilung für Gruppenreisen',
  'header.description': 'Laden Sie Ihre Ausgaben-CSV-Datei hoch, um automatisch zu berechnen, wer wem was schuldet. Unterstützt individuelle Zahlungen und gemeinsame Ausgaben mit anpassbaren Aufteilungsverhältnissen.',

  // Fair Cost Splitting
  'fairSplitting.title': 'Warum faire Kostenaufteilung wichtig ist',
  'fairSplitting.description': 'Einfache gleichmäßige Aufteilungen funktionieren bei grundlegenden Szenarien, aber Gruppenreisen beinhalten oft komplexe Situationen, die einen nuancierteren Ansatz erfordern, um sicherzustellen, dass jeder seinen fairen Anteil zahlt.',
  'fairSplitting.complex.title': 'Über einfache Aufteilungen hinaus',
  'fairSplitting.complex.description': 'Wenn Menschen spät dazukommen, früh gehen, unterschiedliche Aktivitätsteilnahme haben oder variierende Konsummuster aufweisen, wird eine faire Berechnung zur Aufrechterhaltung der Gruppenharmonie unerlässlich.',
  'fairSplitting.smart.title': 'Intelligente Berechnungen',
  'fairSplitting.smart.description': 'Unser Algorithmus berücksichtigt individuelle Zahlungen, Aktivitätsteilnahme, altersbasierte Konsumgewohnheiten und persönliche Anpassungen, um eine wirklich gerechte Kostenverteilung zu berechnen.',

  // Step 1: Upload Your Data
  'step1.title': 'Daten hochladen',
  'step1.upload.title': 'CSV-Datei hier ablegen oder zum Durchsuchen klicken',
  'step1.upload.subtitle': 'Unterstützt Dateien bis zu 10MB',
  'step1.upload.success': 'Datei erfolgreich hochgeladen!',
  'step1.upload.ready': 'Bereit für Verarbeitungsoptionen',
  'step1.welcome.exampleText': 'Benötigen Sie ein Beispiel? Probieren Sie eine unserer Beispieldateien:',
  'step1.welcome.examples.simple': 'Einfaches Abendessen',
  'step1.welcome.examples.family': 'Familienreise',
  'step1.welcome.examples.business': 'Geschäftsreise',

  // Step 2: Configure & Process
  'step2.title': 'Konfigurieren & Verarbeiten',
  'step2.disabled.title': 'Verarbeitungsoptionen',
  'step2.disabled.message': 'Laden Sie eine CSV-Datei hoch, um Verarbeitungsoptionen zu konfigurieren',
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
  'csvHelp.commonIssues': 'Häufige Probleme:',
  'csvHelp.issue1': '• Fehlende "name" Spalte - diese ist für alle Teilnehmer erforderlich',
  'csvHelp.issue2': '• Text und Zahlen in Zahlungsspalten gemischt (nur Zahlen verwenden)',
  'csvHelp.issue3': '• Datei als Excel (.xlsx) statt CSV-Format gespeichert',
  'csvHelp.issue4': '• Zusätzliche Kommas oder Anführungszeichen verursachen Parsing-Fehler',
  'csvHelp.examples': 'Benötigen Sie ein Beispiel? Probieren Sie:',
  'csvHelp.closeHelp': 'Hilfe schließen',

  // Step-specific Help
  'help.step1.title': 'Erste Schritte',
  'help.step1.description': 'Laden Sie Ihre CSV-Datei mit Ausgabendaten hoch, um mit den Kostenaufteilungsberechnungen zu beginnen.',
  'help.step2.title': 'Verarbeitungsoptionen',
  'help.step2.description': 'Wählen Sie aus, wie Zahlungen und Rundungen behandelt werden sollen, bevor Sie Ihre Daten verarbeiten.',
  'help.step2.paymentModes': 'Zahlungsmodi: Individuell verfolgt jede Person separat, Gruppe kombiniert Familien-/Teameinheiten.',
  'help.step2.rounding': 'Rundung: Exakt behält genaue Beträge bei, Auf 5€ runden vereinfacht Endzahlungen.',
  'help.step3.title': 'Ergebnisse verstehen',
  'help.step3.description': 'Überprüfen Sie, wer wem was schuldet und laden Sie einen detaillierten Zahlungsbericht herunter.',
  'help.step3.matrix': 'Die Zahlungsmatrix zeigt die Verpflichtungen jeder Person und die erforderlichen Aktionen.',
  'help.step3.pdf': 'Laden Sie den PDF-Bericht für eine detaillierte Aktivitätsaufschlüsselung und umfassende Analyse herunter.',

  // Step 3: Results
  'step3.title': 'Ergebnisse',
  'step3.disabled.title': 'Zahlungsergebnisse',
  'step3.disabled.message': 'Verarbeiten Sie Ihre Datei, um Zahlungsberechnungen und Berichte zu sehen',
  'step3.paymentInstructions': 'Zahlungsanweisungen',
  'step3.paymentMatrix': 'Zahlungsübersicht',
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

  // Language
  'language.current': 'Deutsch',
  'language.switch': 'Sprache wechseln'
};