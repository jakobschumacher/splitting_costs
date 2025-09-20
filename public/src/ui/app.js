import { costsplitterPipeline } from '../pipeline.js';
import {
  classifyError, generateErrorSuggestions, generateHelpResources,
} from './errorClassification.js';
import { i18n, translateContainer } from '../i18n/i18n.js';

class CostsplitterApp {
  constructor() {
    this.initializeElements();
    this.bindEvents();
    this.paymentMode = 'individual';
    this.roundingMode = 'exact';
    this.selectedFile = null;
    this.currentResults = null;
    this.initializeI18n();
    this.initializeStepStates(); // Initialize all steps with proper states
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
    this.progressSteps = document.getElementById('progressSteps');
    this.uploadDefaultState = document.getElementById('uploadDefaultState');
    this.uploadedState = document.getElementById('uploadedState');
    this.processingOptions = document.getElementById('processingOptions');
    this.step2Disabled = document.getElementById('step2Disabled');
    this.step3Disabled = document.getElementById('step3Disabled');
    this.resultsContent = document.getElementById('resultsContent');
    this.languageSelector = document.getElementById('languageSelector');
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

    // Process button
    this.processButton.addEventListener('click', () => this.processFile());

    // Reset button
    document.getElementById('resetButton').addEventListener('click', () => this.reset());

    // Help button
    this.helpButton.addEventListener('click', () => this.toggleHelp());

    // Example file buttons
    document.querySelectorAll('[data-example]').forEach(button => {
      button.addEventListener('click', (e) => this.loadExampleFile(e.target.dataset.example));
    });

    // PDF download button
    this.downloadPdfButton.addEventListener('click', () => this.downloadPdf());

    // Language selector
    this.languageSelector.addEventListener('change', (e) => this.changeLanguage(e.target.value));
  }

  initializeI18n() {
    // Set the language selector to current language
    this.languageSelector.value = i18n.getCurrentLanguage();

    // Subscribe to language changes to update dynamic content
    i18n.subscribe((language) => {
      this.updatePaymentModeUI();
      this.updateRoundingUI();
      // Update any other dynamic content as needed
    });

    // Initial translation
    translateContainer();
  }

  changeLanguage(language) {
    if (i18n.setLanguage(language)) {
      // Update the HTML lang attribute
      document.documentElement.lang = language;

      // Re-translate any dynamic content
      this.updatePaymentModeUI();
      this.updateRoundingUI();

      // Re-translate results if they exist
      if (this.currentResults) {
        this.displayResults(this.currentResults);
      }
    }
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

      // Enable Step 2 with processing options
      this.enableStep(2);
    }
  }

  async processFile() {
    if (!this.selectedFile) return;

    this.showLoading(true);
    this.clearErrors();

    try {
      // Process file without showing progress indicators initially
      const csvContent = await CostsplitterApp.readFileContent(this.selectedFile);
      const result = costsplitterPipeline(this.selectedFile, csvContent, this.paymentMode, this.roundingMode);

      if (result.success) {
        // Success: Show results directly without any progress indicators
        this.displayResults(result);
      } else {
        // Error: Now show progress indicators to help debug the issue
        CostsplitterApp.showProgress(true);
        CostsplitterApp.resetProgress();
        this.handleProcessingError(result);
      }
    } catch (error) {
      // Error: Show progress indicators to help debug the issue
      CostsplitterApp.showProgress(true);
      CostsplitterApp.resetProgress();
      CostsplitterApp.updateProgress('parsing', 'error');
      this.displayError({
        error: 'File processing failed',
        details: error.message,
      });
    } finally {
      this.showLoading(false);
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
    this.enableStep(3);

    // Check for warnings and display them
    if (result.calculation && result.calculation.warning) {
      this.displayWarning(result.calculation.warning);
      return;
    }

    // Payment matrix with integrated instructions
    CostsplitterApp.displayPaymentMatrix(result.report.paymentMatrix, result.report.instructions);

    // Activity breakdown
    CostsplitterApp.displayActivities(result.report.summary.activities);
  }

  static displaySummary(summary) {
    const summaryEl = document.getElementById('summaryContent');
    summaryEl.innerHTML = `
      <div class="summary-card">
        <div class="summary-label">${i18n.t('summary.participants')}</div>
        <div class="summary-value">${summary.totalParticipants}</div>
      </div>
      <div class="summary-card">
        <div class="summary-label">${i18n.t('summary.totalPaid')}</div>
        <div class="summary-value text-green">${i18n.formatCurrency(summary.totalPaid)}</div>
      </div>
      <div class="summary-card">
        <div class="summary-label">${i18n.t('summary.activities')}</div>
        <div class="summary-value" style="color: #3b82f6;">${summary.activities ? Object.keys(summary.activities).length : 0}</div>
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

  static displayPaymentMatrix(paymentMatrix, instructions = []) {
    const matrixEl = document.getElementById('matrixContent');

    // Create maps for who pays whom and who receives from whom
    const payerMap = {};  // Maps payer -> list of payments they need to make
    const receiverMap = {};  // Maps receiver -> list of payments they will receive

    if (instructions.length > 0) {
      instructions.forEach(instruction => {
        // Parse instructions like "Alice pays Bob €25.50"
        const match = instruction.match(/^(.+?)\s+pays\s+(.+?)\s+€([\d.]+)$/);
        if (match) {
          const [, payer, receiver, amount] = match;
          const formattedAmount = i18n.formatCurrency(parseFloat(amount));

          // Add to payer map
          if (!payerMap[payer]) payerMap[payer] = [];
          payerMap[payer].push(`${i18n.t('payment.pays')} ${formattedAmount} ${i18n.t('payment.to')} ${receiver}`);

          // Add to receiver map
          if (!receiverMap[receiver]) receiverMap[receiver] = [];
          receiverMap[receiver].push(`${i18n.t('payment.receives')} ${formattedAmount} ${i18n.t('payment.from')} ${payer}`);
        }
      });
    }

    matrixEl.innerHTML = `
      <table class="table">
        <thead>
          <tr>
            <th>${i18n.t('matrix.name')}</th>
            <th>${i18n.t('matrix.shouldPay')}</th>
            <th>${i18n.t('matrix.alreadyPaid')}</th>
            <th>${i18n.t('matrix.netAmount')}</th>
            <th>${i18n.t('matrix.action')}</th>
          </tr>
        </thead>
        <tbody>
          ${paymentMatrix.map((p) => {
            const paymentInstructions = payerMap[p.element] || [];
            const receivingInstructions = receiverMap[p.element] || [];
            const isSettled = Math.abs(p.netObligation) < 0.01;

            let actionContent;
            if (isSettled) {
              actionContent = `<span style="color: #059669; font-weight: 500;">✅ ${i18n.t('matrix.settled')}</span>`;
            } else {
              const allInstructions = [];

              // Add payment instructions (what this person needs to pay)
              if (paymentInstructions.length > 0) {
                paymentInstructions.forEach(inst => {
                  allInstructions.push(`<div style="font-size: 0.875rem; color: #dc2626; margin-bottom: 0.25rem; font-weight: 500;">→ ${inst}</div>`);
                });
              }

              // Add receiving instructions (what this person will receive)
              if (receivingInstructions.length > 0) {
                receivingInstructions.forEach(inst => {
                  allInstructions.push(`<div style="font-size: 0.875rem; color: #059669; margin-bottom: 0.25rem;">← ${inst}</div>`);
                });
              }

              // If no specific instructions but has net obligation, show general status
              if (allInstructions.length === 0) {
                if (p.netObligation > 0) {
                  actionContent = `<span style="color: #dc2626; font-size: 0.875rem;">${i18n.t('matrix.owes')}</span>`;
                } else if (p.netObligation < 0) {
                  actionContent = `<span style="color: #059669; font-size: 0.875rem;">${i18n.t('matrix.receives')}</span>`;
                }
              } else {
                actionContent = allInstructions.join('');
              }
            }

            return `
              <tr>
                <td style="font-weight: 500;">${p.element}</td>
                <td>${i18n.formatCurrency(p.shouldPay)}</td>
                <td>${i18n.formatCurrency(p.alreadyPaid)}</td>
                <td class="${CostsplitterApp.getObligationClass(p.netObligation)}"
                     style="font-weight: 500;">
                  ${i18n.formatCurrency(p.netObligation)}
                </td>
                <td style="min-width: 200px;">
                  ${actionContent}
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
      ${instructions.length === 0 ?
        `<div style="margin-top: 1rem; padding: 1rem; background: #f0fdf4; border-radius: 0.5rem; border: 1px solid #bbf7d0;"><p style="margin: 0; color: #059669; font-weight: 500; text-align: center;">✅ ${i18n.t('matrix.noPaymentsNeeded')}</p></div>`
        : ''}
    `;
  }

  static displayActivities(activities) {
    const activitiesEl = document.getElementById('activitiesContent');

    if (!activities || Object.keys(activities).length === 0) {
      activitiesEl.innerHTML = '<div>No activities to display</div>';
      return;
    }

    // Convert activities object to array for easier handling
    const activityList = Object.entries(activities).map(([name, activity]) => ({
      name,
      ...activity
    }));

    activitiesEl.innerHTML = activityList.map((activity) => `
      <div class="activity-card">
        <h4 style="font-weight: 500; margin-bottom: 0.5rem;">${activity.name}</h4>
        <div style="font-size: 0.875rem; color: #6b7280;">
          <p style="margin-bottom: 0.25rem;">${i18n.t('activity.totalPaid')}: <span style="font-weight: 500;">${i18n.formatCurrency(activity.totalPaid)}</span></p>
          <p style="margin-bottom: 0.25rem;">${i18n.t('activity.paidBy')}: <span style="font-weight: 500;">${activity.paidBy}</span></p>
          <div style="margin-top: 0.5rem;">
            <strong>${i18n.t('activity.charges')}:</strong>
            <div style="margin-left: 1rem; margin-top: 0.25rem;">
              ${activity.charges ? activity.charges.map(charge =>
                `<div>• ${charge.person}: ${i18n.formatCurrency(charge.amount)}</div>`
              ).join('') : '<div>No specific charges recorded</div>'}
            </div>
          </div>
        </div>
      </div>
    `).join('');
  }

  displayWarning(warningMessage) {
    const matrixEl = document.getElementById('matrixContent');
    const activitiesEl = document.getElementById('activitiesContent');

    // Clear existing content
    matrixEl.innerHTML = '';
    activitiesEl.innerHTML = '';

    // Display warning message in the matrix area
    matrixEl.innerHTML = `
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
      alert('No results to download. Please process a file first.');
      return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Get data
    const summary = this.currentResults.report.summary;
    const instructions = this.currentResults.report.instructions;
    const paymentMatrix = this.currentResults.report.paymentMatrix;
    const activities = summary.activities || [];
    const fileName = this.selectedFile ? this.selectedFile.name : 'expense-data';

    let yPos = 20;

    // Title and filename
    doc.setFontSize(20);
    doc.text('Costsplitter - Expense Report', 20, yPos);
    yPos += 10;
    doc.setFontSize(10);
    doc.text(`Source file: ${fileName}`, 20, yPos);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 120, yPos);
    yPos += 20;

    // Summary section
    doc.setFontSize(16);
    doc.text('Summary', 20, yPos);
    yPos += 10;
    doc.setFontSize(12);
    doc.text(`Participants: ${summary.totalParticipants}`, 25, yPos);
    yPos += 8;
    doc.text(`Total Paid: €${summary.totalPaid.toFixed(2)}`, 25, yPos);
    yPos += 8;
    doc.text(`Activities: ${activities.length}`, 25, yPos);
    yPos += 20;

    // Payment Instructions section
    doc.setFontSize(16);
    doc.text('Payment Instructions', 20, yPos);
    yPos += 10;
    doc.setFontSize(10);

    if (instructions.length === 0) {
      doc.text('No payments needed - all settled!', 25, yPos);
      yPos += 15;
    } else {
      instructions.forEach(instruction => {
        doc.text(`• ${instruction}`, 25, yPos);
        yPos += 6;
      });
      yPos += 10;
    }

    // Check if we need a new page
    if (yPos > 220) {
      doc.addPage();
      yPos = 20;
    }

    // Payment Matrix section
    doc.setFontSize(16);
    doc.text('Payment Matrix', 20, yPos);
    yPos += 15;

    // Table headers
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text('Name', 25, yPos);
    doc.text('Should Pay', 70, yPos);
    doc.text('Already Paid', 110, yPos);
    doc.text('Net Amount', 155, yPos);
    yPos += 8;

    // Table separator line
    doc.line(20, yPos - 2, 190, yPos - 2);

    // Table data
    doc.setFont(undefined, 'normal');
    paymentMatrix.forEach(person => {
      doc.text(person.element, 25, yPos);
      doc.text(`€${person.shouldPay.toFixed(2)}`, 70, yPos);
      doc.text(`€${person.alreadyPaid.toFixed(2)}`, 110, yPos);
      const netColor = person.netObligation < 0 ? [0, 150, 0] : person.netObligation > 0 ? [200, 0, 0] : [0, 0, 0];
      doc.setTextColor(...netColor);
      doc.text(`€${person.netObligation.toFixed(2)}`, 155, yPos);
      doc.setTextColor(0, 0, 0);
      yPos += 6;
    });
    yPos += 15;

    // Check if we need a new page for activities
    if (yPos > 200) {
      doc.addPage();
      yPos = 20;
    }

    // Activity Breakdown section
    if (activities.length > 0) {
      doc.setFontSize(16);
      doc.text('Activity Breakdown', 20, yPos);
      yPos += 15;

      activities.forEach(activity => {
        // Check if we need a new page
        if (yPos > 240) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text(activity.name, 25, yPos);
        yPos += 8;

        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.text(`Total Paid: €${activity.totalPaid.toFixed(2)}`, 30, yPos);
        yPos += 6;

        if (activity.paidBy) {
          doc.text(`Paid by: ${activity.paidBy}`, 30, yPos);
          yPos += 6;
        }

        if (activity.charges && activity.charges.length > 0) {
          doc.text('Individual charges:', 30, yPos);
          yPos += 6;
          activity.charges.forEach(charge => {
            doc.text(`  • ${charge.person}: €${charge.amount.toFixed(2)} (${charge.shares} shares)`, 35, yPos);
            yPos += 5;
          });
        }
        yPos += 8;
      });
    }

    // Save the PDF with dynamic filename
    const timestamp = new Date().toISOString().slice(0, 10);
    const baseFileName = fileName.replace('.csv', '');
    doc.save(`${baseFileName}-report-${timestamp}.pdf`);
  }

  reset() {
    this.selectedFile = null;
    this.fileInput.value = '';
    this.initializeStepStates(); // Reset to initial state
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

  initializeStepStates() {
    // Show all steps from the beginning
    this.step1.classList.remove('hidden');
    this.step2.classList.remove('hidden');
    this.step3.classList.remove('hidden');

    // Set initial states
    this.enableStep(1);
    this.disableStep(2);
    this.disableStep(3);
  }

  enableStep(stepNumber) {
    const step = document.getElementById(`step${stepNumber}`);
    step.classList.remove('step-disabled');

    switch (stepNumber) {
      case 2:
        this.step2Disabled.classList.add('hidden');
        this.processingOptions.classList.remove('hidden');
        this.processButton.disabled = false;
        break;
      case 3:
        this.step3Disabled.classList.add('hidden');
        this.resultsContent.classList.remove('hidden');
        break;
    }
  }

  disableStep(stepNumber) {
    const step = document.getElementById(`step${stepNumber}`);
    step.classList.add('step-disabled');

    switch (stepNumber) {
      case 2:
        this.step2Disabled.classList.remove('hidden');
        this.processingOptions.classList.add('hidden');
        this.processButton.disabled = true;
        break;
      case 3:
        this.step3Disabled.classList.remove('hidden');
        this.resultsContent.classList.add('hidden');
        break;
    }
  }


  updatePaymentModeUI() {
    const isGroupMode = this.paymentMode === 'group';

    // Update label states
    this.individualLabel.classList.toggle('active', !isGroupMode);
    this.groupLabel.classList.toggle('active', isGroupMode);

    // Update description using i18n
    if (isGroupMode) {
      this.paymentModeDescription.textContent = i18n.t('step2.paymentMode.description.group');
    } else {
      this.paymentModeDescription.textContent = i18n.t('step2.paymentMode.description.individual');
    }
  }

  updateRoundingUI() {
    const isRoundToFive = this.roundingMode === 'roundToFive';

    // Update label states
    this.exactLabel.classList.toggle('active', !isRoundToFive);
    this.roundToFiveLabel.classList.toggle('active', isRoundToFive);

    // Update description using i18n
    if (isRoundToFive) {
      this.roundingDescription.textContent = i18n.t('step2.rounding.description.roundToFive');
    } else {
      this.roundingDescription.textContent = i18n.t('step2.rounding.description.exact');
    }
  }

  async loadExampleFile(exampleType) {
    try {
      // Map example types to file names
      const fileMap = {
        simple: 'simple_dinner.csv',
        family: 'family_vacation.csv',
        business: 'business_trip.csv'
      };

      const fileName = fileMap[exampleType];
      if (!fileName) return;

      // Fetch the example file
      const response = await fetch(`testdata/${fileName}`);
      if (!response.ok) throw new Error('Failed to load example file');

      const csvContent = await response.text();

      // Create a File object from the CSV content
      const blob = new Blob([csvContent], { type: 'text/csv' });
      this.selectedFile = new File([blob], fileName, { type: 'text/csv' });

      // Update the display
      this.updateFileDisplay();

    } catch (error) {
      console.error('Error loading example file:', error);
      this.displayError({
        error: 'Failed to load example file',
        details: 'Could not load the selected example file. Please try uploading your own CSV file.'
      });
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
