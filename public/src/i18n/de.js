export const de = {
  // Header
  'header.title': 'Costsplitter',
  'header.subtitle': 'Faire Kostenaufteilung für Gruppenreisen',
  'header.description': 'Gruppenreisen sind toll. Aber die Abrechnung kann schwierig sein. Dieses Tool hilft ihnen dabei. Erstellen Sie eine Ausgaben-CSV-Datei. Laden Sie die Datei hier hoch. Die App berechnet dann wer wem was schuldet. Die App bietet die Möglichkeit die Kosten anzupassen: Pro Aktivität, nach Alter und anhand eines Solidaritätsbereiches.',

  // Main Introduction
  'main.intro': 'Gruppenreisen sind toll. Aber die Abrechnung kann schwierig sein. Dieses Tool hilft ihnen dabei. Erstellen Sie eine Ausgaben-CSV-Datei (?). Laden Sie die Datei hier hoch. Die App berechnet dann wer wem was schuldet. Die App bietet die Möglichkeit die Kosten anzupassen: Pro Aktivität, nach Alter und anhand eines Solidaritätsbereiches.',

  // CSV Help Modal
  'csvHelp.modal.title': 'CSV-Datei Format',
  'csvHelp.modal.content': 'Die Daten sollten die folgenden Spalten enthalten:\n\n• Die name Spalte. Diese Spalte zeigt die Namen der beteiligten Personen an. Dies ist eine Pflicht-Spalte, andernfalls wirft das Paket einen Fehler. Die Namen müssen eindeutig sein.\n\n• Die pay_ Spalten. Diese Spalten enthalten den Betrag, den jemand für eine Aktivität bezahlt hat. Mindestens eine pay_ Spalte muss verfügbar sein. Jede pay_Spalte muss mit einer share_Spalte übereinstimmen. Dies muss durch einen entsprechenden Teil nach dem _ erfolgen, z.B. pay_breakfast und share_breakfast. Der Wert sollte numerisch sein. Alle pay_ Spalten sollten mit pay_ beginnen.\n\n• Die share_Spalten. Diese Spalten enthalten den Anteil, den jeder für die Aktivität zahlen muss. Der zweite Teil des Namens nach dem _ muss einer pay_Spalte entsprechen. Der Wert kann numerisch sein. Er muss zwischen 0 (die Person muss nicht zahlen) und 1 (die Person muss einen vollen Anteil zahlen) liegen oder kann einen der folgenden kategorischen Werte haben: full, reduced, half oder some. Diese kategorischen Werte werden in numerische Werte umgewandelt. NA-Werte und leere Werte werden in 0 übersetzt. Alle share_ Spalten sollten mit share_ beginnen.\n\n• Die group Spalte. Mehrere Personen können zu einer Gruppe zusammengefasst werden. Dies kann in dieser Spalte angegeben werden.\n\n• Die age Spalte. Diese Spalte zeigt das Alter der beteiligten Personen an. Der Wert sollte ein ganzzahliger Wert zwischen 0 und 120 sein. Der Wert könnte auch adult oder kid sein, das wird in 1 bzw. 0,5 übersetzt. NA-Werte und leere Werte werden in 1 übersetzt.\n\n• Die adjustment Spalte. Um einen allgemeinen Bonus oder Malus zu geben, der auf den gesamten Betrag angewendet wird, den jemand zahlen muss, können Sie die adjustment Spalte verwenden. Diese Spalte kann numerisch zwischen 0 (die Person muss nicht zahlen) und 100 (100x des normalen Anteils) sein. Der Wert kann auch kategorisch sein, wobei more bedeutet, dass die Person 1,2-mal mehr zahlen sollte und less bedeutet, dass die Person nur 0,8 des üblichen Betrags zahlen sollte. NA-Werte und leere Werte werden in 1 übersetzt.',

  // Step 1: Upload Your Data
  'step1.title': 'Daten hochladen',
  'step1.csvFormatHelp': 'Klicken Sie hier um zu sehen wie die Datei aufgebaut sein soll',
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