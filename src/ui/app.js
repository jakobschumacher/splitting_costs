import { costsplitterPipeline } from '../pipeline.js';
import {
  classifyError, generateErrorSuggestions, generateHelpResources,
} from './errorClassification.js';

class CostsplitterApp {
  constructor() {
    this.initializeElements();
    this.bindEvents();
    this.paymentMode = 'individual';
    this.roundingMode = 'exact';
    this.selectedFile = null;
    this.currentResults = null;
    this.showStep(2); // Initialize with step 1 & 2 visible
  }

  initializeElements() {
    this.fileInput = document.getElementById('csvFile');
    this.dropZone = document.getElementById('dropZone');
    this.step1 = document.getElementById('step1');
    this.step2 = document.getElementById('step2');
    this.step3 = document.getElementById('step3');
    this.paymentModeToggle = document.getElementById('paymentModeToggle');
    this.individualLabel = document.getElementById('individualLabel');
    this.groupLabel = document.getElementById('groupLabel');
    this.paymentModeDescription = document.getElementById('paymentModeDescription');
    this.roundingToggle = document.getElementById('roundingToggle');
    this.exactLabel = document.getElementById('exactLabel');
    this.roundToFiveLabel = document.getElementById('roundToFiveLabel');
    this.roundingDescription = document.getElementById('roundingDescription');
    this.processButton = document.getElementById('processButton');
    this.errorDisplay = document.getElementById('errorDisplay');
    this.loadingDisplay = document.getElementById('loadingDisplay');
    this.helpButton = document.getElementById('helpButton');
    this.csvHelp = document.getElementById('csvHelp');
    this.downloadPdfButton = document.getElementById('downloadPdfButton');
    this.resetButton = document.getElementById('resetButton');
    this.uploadDefaultState = document.getElementById('uploadDefaultState');
    this.uploadedState = document.getElementById('uploadedState');
  }

  bindEvents() {
    // File input change
    this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));

    // Drag and drop
    this.dropZone.addEventListener('dragover', (e) => this.handleDragOver(e));
    this.dropZone.addEventListener('drop', (e) => this.handleDrop(e));
    this.dropZone.addEventListener('click', () => this.fileInput.click());

    // Payment mode toggle
    this.paymentModeToggle.addEventListener('change', (e) => {
      this.paymentMode = e.target.checked ? 'group' : 'individual';
      this.updatePaymentModeUI();
    });

    // Initialize payment mode UI
    this.updatePaymentModeUI();

    // Rounding toggle
    this.roundingToggle.addEventListener('change', (e) => {
      this.roundingMode = e.target.checked ? 'roundToFive' : 'exact';
      this.updateRoundingUI();
    });

    // Initialize rounding UI
    this.updateRoundingUI();

    // Reset button
    document.getElementById('resetButton').addEventListener('click', () => this.reset());

    // Help button
    this.helpButton.addEventListener('click', () => this.toggleHelp());

    // PDF download button
    this.downloadPdfButton.addEventListener('click', () => this.downloadPdf());
  }

  handleDragOver(e) {
    e.preventDefault();
    this.dropZone.classList.add('dragover');
  }

  handleDrop(e) {
    e.preventDefault();
    this.dropZone.classList.remove('dragover');
    const { files } = e.dataTransfer;
    if (files.length > 0) {
      const file = files[0];
      if (this.validateFile(file)) {
        this.selectedFile = file;
        this.updateFileDisplay();
      }
    }
  }

  handleFileSelect(e) {
    if (e.target.files.length > 0) {
      const file = e.target.files[0];
      if (this.validateFile(file)) {
        this.selectedFile = file;
        this.updateFileDisplay();
      }
    }
  }

  validateFile(file) {
    // Check file type
    if (!file.type.includes('csv') && !file.name.toLowerCase().endsWith('.csv')) {
      this.selectedFile = null;
      this.displayError({
        error: 'Invalid file type',
        details: 'Please select a CSV file'
      });
      return false;
    }

    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      this.selectedFile = null;
      this.displayError({
        error: 'File too large',
        details: 'File size must be less than 10MB'
      });
      return false;
    }

    this.clearErrors();
    return true;
  }

  updateFileDisplay() {
    if (this.selectedFile) {
      // Update the file info in the upload area
      document.getElementById('uploadedFileNameBottom').textContent = this.selectedFile.name;

      // Switch upload area to success state
      this.uploadDefaultState.classList.add('hidden');
      this.uploadedState.classList.remove('hidden');
      this.dropZone.style.borderColor = '#059669';
      this.dropZone.style.backgroundColor = '#f0fdf4';

      // Automatically process the file
      this.processFile();
    }
  }

  async processFile() {
    if (!this.selectedFile) return;

    this.showLoading(true);
    CostsplitterApp.showProgress(true);
    this.clearErrors();
    CostsplitterApp.resetProgress();

    try {
      CostsplitterApp.updateProgress('parsing', 'active');
      await CostsplitterApp.delay(200);

      const csvContent = await CostsplitterApp.readFileContent(this.selectedFile);
      CostsplitterApp.updateProgress('parsing', 'completed');

      CostsplitterApp.updateProgress('security', 'active');
      await CostsplitterApp.delay(300);

      const result = costsplitterPipeline(this.selectedFile, csvContent, this.paymentMode, this.roundingMode);

      if (result.success) {
        CostsplitterApp.updateProgressFromResult(result);
        CostsplitterApp.setProgressToSummaryMode('Processing Complete');
        this.displayResults(result);
      } else {
        this.handleProcessingError(result);
      }
    } catch (error) {
      CostsplitterApp.updateProgress('parsing', 'error');
      this.displayError({
        error: 'File processing failed',
        details: error.message,
      });
    } finally {
      this.showLoading(false);
      // Note: Progress stays visible for debugging/reference
    }
  }

  static delay(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  static showProgress(show) {
    const progressSteps = document.getElementById('progressSteps');
    if (progressSteps) {
      progressSteps.classList.toggle('hidden', !show);
    }
  }

  static resetProgress() {
    const steps = document.querySelectorAll('[data-step]');
    steps.forEach((step) => {
      step.classList.remove('active', 'completed', 'error');
    });

    const progressSteps = document.getElementById('progressSteps');
    if (progressSteps) {
      progressSteps.classList.remove('summary-mode');
    }

    const progressTitle = document.getElementById('progressTitle');
    if (progressTitle) {
      progressTitle.textContent = 'Processing Your File';
    }
  }

  static updateProgress(stepName, status) {
    const step = document.querySelector(`[data-step="${stepName}"]`);
    if (step) {
      step.classList.remove('active', 'completed', 'error');
      if (status) step.classList.add(status);
    }
  }

  static setProgressToSummaryMode(title) {
    const progressSteps = document.getElementById('progressSteps');
    const progressTitle = document.getElementById('progressTitle');

    if (progressSteps) {
      progressSteps.classList.add('summary-mode');
    }

    if (progressTitle) {
      progressTitle.textContent = title;
    }
  }

  static updateProgressFromResult(result) {
    const steps = result.steps || {};

    if (steps.security === 'passed') {
      CostsplitterApp.updateProgress('security', 'completed');
    }

    if (steps.validation === 'passed') {
      CostsplitterApp.updateProgress('validation', 'completed');
    } else if (steps.validation === 'failed') {
      CostsplitterApp.updateProgress('validation', 'error');
      return;
    }

    if (steps.transformation === 'completed') {
      CostsplitterApp.updateProgress('transformation', 'completed');
    }

    if (steps.calculation === 'completed') {
      CostsplitterApp.updateProgress('calculation', 'completed');
    }

    if (steps.reporting === 'completed') {
      CostsplitterApp.updateProgress('reporting', 'completed');
    }
  }

  handleProcessingError(result) {
    if (result.error === 'Security validation failed') {
      CostsplitterApp.updateProgress('security', 'error');
    } else if (result.error === 'Data validation failed') {
      CostsplitterApp.updateProgress('validation', 'error');
    } else if (result.error === 'CSV parsing failed') {
      CostsplitterApp.updateProgress('parsing', 'error');
    }

    CostsplitterApp.setProgressToSummaryMode('Processing Failed');
    this.displayError(result);
  }

  static readFileContent(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  displayResults(result) {
    this.currentResults = result;
    // Move to step 3
    this.showStep(3);

    // Check for warnings and display them
    if (result.calculation && result.calculation.warning) {
      this.displayWarning(result.calculation.warning);
      return;
    }

    // Summary
    CostsplitterApp.displaySummary(result.report.summary);

    // Payment instructions
    CostsplitterApp.displayInstructions(result.report.instructions);

    // Payment matrix
    CostsplitterApp.displayPaymentMatrix(result.report.paymentMatrix);

    // Activity breakdown
    CostsplitterApp.displayActivities(result.report.summary.activities);
  }

  static displaySummary(summary) {
    const summaryEl = document.getElementById('summaryContent');
    summaryEl.innerHTML = `
      <div class="summary-card">
        <div class="summary-label">Participants</div>
        <div class="summary-value">${summary.totalParticipants}</div>
      </div>
      <div class="summary-card">
        <div class="summary-label">Total Paid</div>
        <div class="summary-value text-green">€${summary.totalPaid.toFixed(2)}</div>
      </div>
      <div class="summary-card">
        <div class="summary-label">Activities</div>
        <div class="summary-value" style="color: #3b82f6;">${summary.activities ? summary.activities.length : 0}</div>
      </div>
    `;
  }

  static displayInstructions(instructions) {
    const instructionsEl = document.getElementById('instructionsContent');
    if (instructions.length === 0) {
      instructionsEl.innerHTML = '<p class="text-green" style="font-weight: 500;">'
        + '✅ No payments needed - everyone is settled!</p>';
      return;
    }

    instructionsEl.innerHTML = `
      <ul style="list-style: none; padding: 0;">
        ${instructions.map((instruction) => (
    `<li style="margin-bottom: 0.5rem; display: flex; align-items: flex-start;">
              <span style="color: #3b82f6; margin-right: 0.5rem;">•</span>
              <span>${instruction}</span>
            </li>`
  )).join('')}
      </ul>
    `;
  }

  static getObligationClass(netObligation) {
    if (netObligation < 0) return 'text-green';
    if (netObligation > 0) return 'text-red';
    return 'text-gray';
  }

  static displayPaymentMatrix(paymentMatrix) {
    const matrixEl = document.getElementById('matrixContent');
    matrixEl.innerHTML = `
      <table class="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Should Pay</th>
            <th>Already Paid</th>
            <th>Net Amount</th>
          </tr>
        </thead>
        <tbody>
          ${paymentMatrix.map((p) => `
            <tr>
              <td style="font-weight: 500;">${p.element}</td>
              <td>€${p.shouldPay.toFixed(2)}</td>
              <td>€${p.alreadyPaid.toFixed(2)}</td>
              <td class="${CostsplitterApp.getObligationClass(p.netObligation)}"
                   style="font-weight: 500;">
                €${p.netObligation.toFixed(2)}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  static displayActivities(activities) {
    const activitiesEl = document.getElementById('activitiesContent');
    // eslint-disable-next-line max-len
    activitiesEl.innerHTML = activities.map((activity) => `
      <div class="activity-card">
        <h4 style="font-weight: 500; margin-bottom: 0.5rem;">${activity.name}</h4>
        <div style="font-size: 0.875rem; color: #6b7280;">
          <p style="margin-bottom: 0.25rem;">Total Paid: <span style="font-weight: 500;">€${activity.totalPaid.toFixed(2)}</span></p>
          <p style="margin-bottom: 0.25rem;">Paid by: <span style="font-weight: 500;">${activity.paidBy}</span></p>
          <div style="margin-top: 0.5rem;">
            <strong>Charges:</strong>
            <div style="margin-left: 1rem; margin-top: 0.25rem;">
              ${activity.charges ? activity.charges.map(charge =>
                `<div>• ${charge.person}: €${charge.amount.toFixed(2)} (${charge.shares} shares)</div>`
              ).join('') : '<div>No specific charges recorded</div>'}
            </div>
          </div>
        </div>
      </div>
    `).join('');
  }

  displayWarning(warningMessage) {
    const summaryEl = document.getElementById('summaryContent');
    const instructionsEl = document.getElementById('instructionsContent');
    const matrixEl = document.getElementById('matrixContent');
    const activitiesEl = document.getElementById('activitiesContent');

    // Clear existing content
    summaryEl.innerHTML = '';
    matrixEl.innerHTML = '';
    activitiesEl.innerHTML = '';

    // Display warning message
    instructionsEl.innerHTML = `
      <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 0.5rem; padding: 1rem; margin-bottom: 1rem;">
        <div style="display: flex; align-items: flex-start;">
          <span style="color: #d97706; font-size: 1.5rem; margin-right: 0.75rem;">⚠️</span>
          <div>
            <h4 style="margin: 0 0 0.5rem 0; color: #92400e; font-size: 1rem;">Configuration Issue Detected</h4>
            <p style="margin: 0; color: #92400e; line-height: 1.5;">${warningMessage}</p>
            <div style="margin-top: 1rem;">
              <button onclick="document.getElementById('paymentMode').value='individual'; document.getElementById('paymentMode').dispatchEvent(new Event('change'));"
                      style="background: #f59e0b; color: white; border: none; padding: 0.5rem 1rem; border-radius: 0.25rem; cursor: pointer; font-size: 0.875rem;">
                Switch to Individual Mode
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  displayError(error) {
    this.errorDisplay.classList.remove('hidden');

    // Get intelligent error classification
    const classification = classifyError(error.error, error);
    const suggestions = generateErrorSuggestions(error.error, error);
    const helpResources = generateHelpResources(error.error);

    // Build context-aware error display
    let errorHtml = CostsplitterApp.buildPrimaryErrorMessage(error, classification);

    // Add suggestions based on error type
    if (suggestions.length > 0) {
      errorHtml += CostsplitterApp.buildSuggestionsSection(suggestions);
    }

    // Show technical details based on classification
    if (classification.showValidationErrors && error.validationErrors) {
      errorHtml += CostsplitterApp.buildValidationErrorsSection(error.validationErrors);
    }

    if (classification.showCsvColumns && error.metadata?.csvColumns) {
      errorHtml += CostsplitterApp.buildCsvColumnsSection(error.metadata.csvColumns);
    }

    // Always show processing steps for context
    if (error.steps) {
      errorHtml += CostsplitterApp.buildProcessingStepsSection(error.steps);
    }

    // Add expandable technical details section
    if (classification.showTechnicalDetails || error.details) {
      errorHtml += CostsplitterApp.buildTechnicalDetailsSection(error, classification);
    }

    // Add help resources
    if (helpResources.length > 0) {
      errorHtml += CostsplitterApp.buildHelpResourcesSection(helpResources);
    }

    this.errorDisplay.innerHTML = errorHtml;
  }

  static buildPrimaryErrorMessage(error, classification) {
    const errorTypeClass = classification.type ? classification.type.replace('-', '_') : 'general-error';
    // Debug: console.log('Error object:', error, 'Classification:', classification);
    const primaryMessage = classification.primaryMessage || error.error || 'An error occurred';
    const helpText = classification.helpText || error.details || 'Please try again';

    return `
      <div class="error-primary ${errorTypeClass}">
        <h3>${primaryMessage}</h3>
        <p class="error-help">${helpText}</p>
      </div>
    `;
  }

  static buildSuggestionsSection(suggestions) {
    return `
      <div class="error-suggestions">
        <h4>💡 Try This:</h4>
        <ul class="suggestions-list">
          ${suggestions.map((suggestion) => `<li>${suggestion}</li>`).join('')}
        </ul>
      </div>
    `;
  }

  static buildValidationErrorsSection(validationErrors) {
    return `
      <div class="error-validation">
        <h4>📋 Specific Issues Found:</h4>
        <ul class="validation-errors">
          ${validationErrors.map((e) => (
    `<li><strong>Row ${e.row}, Column "${e.column}":</strong> ${e.message}</li>`
  )).join('')}
        </ul>
      </div>
    `;
  }

  static buildCsvColumnsSection(csvColumns) {
    return `
      <div class="error-csv-info">
        <h4>📊 Your CSV Structure:</h4>
        <div class="csv-columns">
          <strong>Columns found:</strong> <code>${csvColumns.join(', ')}</code>
        </div>
      </div>
    `;
  }

  static buildProcessingStepsSection(steps) {
    return `
      <div class="error-processing-steps">
        <h4>🔄 Processing Status:</h4>
        <ul class="steps-list">
          ${steps.security === 'passed' ? '<li>✅ Security check: PASSED</li>' : ''}
          ${steps.validation === 'passed' ? '<li>✅ Data validation: PASSED</li>' : ''}
          ${steps.validation === 'failed' ? '<li>❌ Data validation: FAILED</li>' : ''}
          ${steps.transformation === 'completed' ? '<li>✅ Data transformation: COMPLETED</li>' : ''}
        </ul>
      </div>
    `;
  }

  static buildTechnicalDetailsSection(error, classification) {
    const isCollapsible = !classification.showTechnicalDetails;
    const detailsHtml = CostsplitterApp.formatTechnicalDetails(error);

    if (isCollapsible) {
      return `
        <details class="error-technical-details">
          <summary>🔧 Technical Details</summary>
          <div class="technical-content">
            ${detailsHtml}
          </div>
        </details>
      `;
    }
    return `
        <div class="error-technical-details expanded">
          <h4>🔧 Technical Details:</h4>
          <div class="technical-content">
            ${detailsHtml}
          </div>
        </div>
      `;
  }

  static formatTechnicalDetails(error) {
    let details = '';

    if (error.details) {
      if (Array.isArray(error.details)) {
        details += `<ul>${error.details.map((detail) => `<li>${detail}</li>`).join('')}</ul>`;
      } else {
        details += `<p><strong>Error Details:</strong> ${error.details}</p>`;
      }
    }

    if (error.error) {
      details += `<p><strong>Error Type:</strong> <code>${error.error}</code></p>`;
    }

    return details || '<p>No additional technical information available.</p>';
  }

  static buildHelpResourcesSection(helpResources) {
    return `
      <div class="error-help-resources">
        <h4>📚 Need More Help?</h4>
        <div class="help-buttons">
          ${helpResources.map((resource) => (
    `<button class="help-button" onclick="alert('${resource.description}')">
              ${resource.title}
            </button>`
  )).join('')}
        </div>
      </div>
    `;
  }

  clearErrors() {
    this.errorDisplay.classList.add('hidden');
  }

  showLoading(show) {
    this.loadingDisplay.classList.toggle('hidden', !show);
  }

  toggleHelp() {
    this.csvHelp.classList.toggle('hidden');
  }

  downloadPdf() {
    if (!this.currentResults) {
      alert('Keine Ergebnisse zum Herunterladen. Bitte zuerst eine Datei verarbeiten.');
      return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const BLUE = [59, 130, 246];
    const BLUE_LIGHT = [219, 234, 254];
    const GREEN = [5, 150, 105];
    const RED = [185, 28, 28];
    const GRAY = [107, 114, 128];
    const ROW_STRIPE = [249, 250, 251];
    const DARK = [17, 24, 39];

    const euro = (value) => `${value.toLocaleString('de-DE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} €`;

    // Get data
    const summary = this.currentResults.report.summary;
    const instructions = this.currentResults.report.instructions;
    const paymentMatrix = this.currentResults.report.paymentMatrix;
    const activities = summary.activities || [];
    const fileName = this.selectedFile ? this.selectedFile.name : 'ausgabendaten';

    const pageWidth = doc.internal.pageSize.getWidth();
    const marginX = 20;
    let yPos = 20;

    const ensureSpace = (needed) => {
      if (yPos + needed > 280) {
        doc.addPage();
        yPos = 20;
      }
    };

    const drawSectionHeader = (title) => {
      ensureSpace(16);
      doc.setFillColor(...BLUE_LIGHT);
      doc.rect(marginX, yPos - 6, pageWidth - marginX * 2, 10, 'F');
      doc.setFontSize(13);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(...BLUE);
      doc.text(title, marginX + 3, yPos + 1);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(...DARK);
      yPos += 16;
    };

    // Title banner
    doc.setFillColor(...BLUE);
    doc.rect(0, 0, pageWidth, 28, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text('Costsplitter', marginX, 17);
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    doc.text('Ausgabenbericht', marginX, 24);
    doc.setTextColor(...DARK);
    yPos = 40;

    doc.setFontSize(9);
    doc.setTextColor(...GRAY);
    doc.text(`Quelldatei: ${fileName}`, marginX, yPos);
    doc.text(`Erstellt am: ${new Date().toLocaleDateString('de-DE')}`, pageWidth - marginX, yPos, { align: 'right' });
    doc.setTextColor(...DARK);
    yPos += 14;

    // Summary section
    drawSectionHeader('Zusammenfassung');
    doc.setFontSize(11);
    doc.text(`Teilnehmer: ${summary.totalParticipants}`, marginX + 5, yPos);
    yPos += 7;
    doc.text(`Gesamt bezahlt: ${euro(summary.totalPaid)}`, marginX + 5, yPos);
    yPos += 7;
    doc.text(`Aktivitäten: ${activities.length}`, marginX + 5, yPos);
    yPos += 14;

    // Payment Instructions section
    drawSectionHeader('Zahlungsanweisungen');
    doc.setFontSize(10);

    if (instructions.length === 0) {
      doc.setTextColor(...GREEN);
      doc.text('Keine Zahlungen nötig – alles ausgeglichen!', marginX + 5, yPos);
      doc.setTextColor(...DARK);
      yPos += 12;
    } else {
      instructions.forEach((instruction) => {
        ensureSpace(8);
        doc.text(`• ${instruction}`, marginX + 5, yPos);
        yPos += 6;
      });
      yPos += 8;
    }

    // Payment Matrix section
    drawSectionHeader('Zahlungsübersicht');

    // Table headers
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text('Name', marginX + 5, yPos);
    doc.text('Soll zahlen', 80, yPos);
    doc.text('Bereits bezahlt', 120, yPos);
    doc.text('Nettobetrag', 165, yPos);
    yPos += 5;

    doc.setDrawColor(...BLUE);
    doc.setLineWidth(0.4);
    doc.line(marginX, yPos, pageWidth - marginX, yPos);
    yPos += 6;
    doc.setFont(undefined, 'normal');

    paymentMatrix.forEach((person, index) => {
      ensureSpace(8);
      if (index % 2 === 0) {
        doc.setFillColor(...ROW_STRIPE);
        doc.rect(marginX, yPos - 4.5, pageWidth - marginX * 2, 6, 'F');
      }
      doc.text(person.element, marginX + 5, yPos);
      doc.text(euro(person.shouldPay), 80, yPos);
      doc.text(euro(person.alreadyPaid), 120, yPos);
      const netColor = person.netObligation < 0 ? GREEN : (person.netObligation > 0 ? RED : DARK);
      doc.setTextColor(...netColor);
      doc.text(euro(person.netObligation), 165, yPos);
      doc.setTextColor(...DARK);
      yPos += 6;
    });
    yPos += 12;

    // Activity Breakdown section
    if (activities.length > 0) {
      drawSectionHeader('Aktivitätsübersicht');

      activities.forEach((activity) => {
        ensureSpace(24);

        doc.setFontSize(11);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(...BLUE);
        doc.text(activity.name, marginX + 5, yPos);
        doc.setTextColor(...DARK);
        yPos += 7;

        doc.setFontSize(9.5);
        doc.setFont(undefined, 'normal');
        doc.text(`Gesamt bezahlt: ${euro(activity.totalPaid)}`, marginX + 8, yPos);
        yPos += 5.5;

        if (activity.paidBy) {
          doc.text(`Bezahlt von: ${activity.paidBy}`, marginX + 8, yPos);
          yPos += 5.5;
        }

        if (activity.charges && activity.charges.length > 0) {
          doc.setTextColor(...GRAY);
          doc.text('Einzelbeträge:', marginX + 8, yPos);
          doc.setTextColor(...DARK);
          yPos += 5.5;
          activity.charges.forEach((charge) => {
            ensureSpace(6);
            doc.text(`• ${charge.person}: ${euro(charge.amount)} (${charge.shares} Anteile)`, marginX + 12, yPos);
            yPos += 5;
          });
        }
        yPos += 6;
      });
    }

    // Footer with page numbers
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i += 1) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(...GRAY);
      doc.text(`Seite ${i} von ${pageCount}`, pageWidth - marginX, 290, { align: 'right' });
      doc.setTextColor(...DARK);
    }

    // Save the PDF with dynamic filename
    const timestamp = new Date().toISOString().slice(0, 10);
    const baseFileName = fileName.replace('.csv', '');
    doc.save(`${baseFileName}-bericht-${timestamp}.pdf`);
  }

  reset() {
    this.selectedFile = null;
    this.fileInput.value = '';
    this.showStep(2); // Back to step 1 & 2 (Configure + Upload)
    CostsplitterApp.showProgress(false);
    this.clearErrors();
    // File info section no longer exists
    this.paymentModeToggle.checked = false;
    this.paymentMode = 'individual';
    this.updatePaymentModeUI();
    this.roundingToggle.checked = false;
    this.roundingMode = 'exact';
    this.updateRoundingUI();
    CostsplitterApp.resetProgress();
    this.csvHelp.classList.add('hidden');
    this.currentResults = null;

    // Reset upload area to default state
    this.uploadDefaultState.classList.remove('hidden');
    this.uploadedState.classList.add('hidden');
    this.dropZone.style.borderColor = '';
    this.dropZone.style.backgroundColor = '';
  }

  showStep(stepNumber) {
    // Hide all steps
    this.step1.classList.add('hidden');
    this.step2.classList.add('hidden');
    this.step3.classList.add('hidden');

    // Show the requested step and any previous completed steps
    switch (stepNumber) {
      case 1:
        this.step1.classList.remove('hidden'); // Configure Options
        break;
      case 2:
        this.step1.classList.remove('hidden'); // Keep step 1 visible
        this.step2.classList.remove('hidden'); // Upload & Process
        break;
      case 3:
        this.step1.classList.remove('hidden'); // Keep step 1 visible
        this.step2.classList.remove('hidden'); // Keep step 2 visible
        this.step3.classList.remove('hidden'); // Results
        break;
      default:
        this.step1.classList.remove('hidden');
    }
  }

  updatePaymentModeUI() {
    const isGroupMode = this.paymentMode === 'group';

    // Update label states
    this.individualLabel.classList.toggle('active', !isGroupMode);
    this.groupLabel.classList.toggle('active', isGroupMode);

    // Update description
    if (isGroupMode) {
      this.paymentModeDescription.textContent = 'Group: All expenses are shared equally among participants';
    } else {
      this.paymentModeDescription.textContent = 'Individual: Each person\'s expenses are tracked separately';
    }
  }

  updateRoundingUI() {
    const isRoundToFive = this.roundingMode === 'roundToFive';

    // Update label states
    this.exactLabel.classList.toggle('active', !isRoundToFive);
    this.roundToFiveLabel.classList.toggle('active', isRoundToFive);

    // Update description
    if (isRoundToFive) {
      this.roundingDescription.textContent = 'Round to 5€: All amounts rounded to nearest 5 Euro for easier payments';
    } else {
      this.roundingDescription.textContent = 'Exact: Keep precise amounts down to cents';
    }
  }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // eslint-disable-next-line no-new
  new CostsplitterApp();
});

// Export for testing
export default CostsplitterApp;
