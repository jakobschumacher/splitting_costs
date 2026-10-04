import { costsplitterPipeline } from '../pipeline.js';
import { detectColumnMapping, MAPPING_ROLES } from '../transform/columnMapping.js';
import { buildEpcQrPayload } from '../reporting/epcQr.js';
import { buildPaymentCopyText } from '../reporting/paymentText.js';
import { renderQrDataUrl } from '../reporting/qrCanvas.js';
import { LOGO_PNG_BASE64 } from '../reporting/logoImage.js';
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
    this.ageWeightingMode = 'linear';
    this.selectedFile = null;
    this.currentResults = null;
    this.columnMapping = [];
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
    this.roundingToggle = document.getElementById('roundingToggle');
    this.exactLabel = document.getElementById('exactLabel');
    this.roundToFiveLabel = document.getElementById('roundToFiveLabel');
    this.ageWeightingToggle = document.getElementById('ageWeightingToggle');
    this.linearLabel = document.getElementById('linearLabel');
    this.solidarityLabel = document.getElementById('solidarityLabel');
    this.processButton = document.getElementById('processButton');
    this.errorDisplay = document.getElementById('errorDisplay');
    this.loadingDisplay = document.getElementById('loadingDisplay');
    this.helpContent1 = document.getElementById('helpContent1');
    this.helpContent2 = document.getElementById('helpContent2');
    this.helpContent3 = document.getElementById('helpContent3');
    this.helpBackdrop = document.getElementById('helpBackdrop');
    this.downloadPdfButton = document.getElementById('downloadPdfButton');
    this.copyAllButton = document.getElementById('copyAllButton');
    this.resetButton = document.getElementById('resetButton');
    this.progressSteps = document.getElementById('progressSteps');
    this.uploadDefaultState = document.getElementById('uploadDefaultState');
    this.uploadedState = document.getElementById('uploadedState');
    this.processingOptions = document.getElementById('processingOptions');
    this.step2Disabled = document.getElementById('step2Disabled');
    this.columnMappingSection = document.getElementById('columnMappingSection');
    this.columnMappingBody = document.getElementById('columnMappingBody');
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

    // Age weighting toggle
    this.ageWeightingToggle.addEventListener('change', (e) => {
      this.ageWeightingMode = e.target.checked ? 'solidarity' : 'linear';
      this.updateAgeWeightingUI();
    });

    // Initialize age weighting UI
    this.updateAgeWeightingUI();

    // Process button
    this.processButton.addEventListener('click', () => this.processFile());

    // Reset button
    document.getElementById('resetButton').addEventListener('click', () => this.reset());

    // Step-specific help buttons
    document.querySelectorAll('.step-help-button').forEach(button => {
      button.addEventListener('click', (e) => {
        const stepNumber = parseInt(e.target.dataset.step);
        this.toggleStepHelp(stepNumber);
      });
    });

    // Close help buttons
    document.querySelectorAll('.close-help-button').forEach(button => {
      button.addEventListener('click', (e) => {
        const stepNumber = parseInt(e.target.dataset.step);
        this.closeStepHelp(stepNumber);
      });
    });

    // Close help popup by clicking the backdrop or pressing Escape
    this.helpBackdrop.addEventListener('click', () => this.closeAllHelp());
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.closeAllHelp();
    });

    // Example file buttons
    document.querySelectorAll('[data-example]').forEach(button => {
      button.addEventListener('click', (e) => this.downloadExampleFile(e.target.dataset.example));
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
      this.updateAgeWeightingUI();
      this.renderColumnMapping();
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
      this.updateAgeWeightingUI();
      this.renderColumnMapping();

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
      this.detectAndRenderColumnMapping();
    }
  }

  async detectAndRenderColumnMapping() {
    try {
      const csvContent = await CostsplitterApp.readFileContent(this.selectedFile);
      const parseResult = Papa.parse(csvContent, {
        header: true,
        skipEmptyLines: true,
        transform: (value) => value.trim(),
      });
      const columns = Object.keys(parseResult.data[0] || {});
      this.columnMapping = detectColumnMapping(columns);
    } catch (error) {
      this.columnMapping = [];
    }
    this.renderColumnMapping();
  }

  renderColumnMapping() {
    if (!this.columnMapping.length) {
      this.columnMappingSection.classList.add('hidden');
      this.columnMappingBody.innerHTML = '';
      return;
    }

    this.columnMappingBody.innerHTML = this.columnMapping.map((entry, index) => `
      <tr>
        <td><code>${entry.column}</code></td>
        <td>
          <select data-mapping-index="${index}" class="mapping-role-select">
            ${MAPPING_ROLES.map((role) => `
              <option value="${role}" ${role === entry.role ? 'selected' : ''}>
                ${i18n.t(`columnMapping.role.${role}`)}
              </option>
            `).join('')}
          </select>
        </td>
        <td>
          ${(entry.role === 'pay' || entry.role === 'cost')
    ? `<input type="text" data-mapping-index="${index}" class="mapping-activity-input"
             value="${entry.activity}">`
    : ''}
        </td>
      </tr>
    `).join('');

    this.columnMappingBody.querySelectorAll('.mapping-role-select').forEach((select) => {
      select.addEventListener('change', (e) => {
        const index = parseInt(e.target.dataset.mappingIndex, 10);
        this.columnMapping[index].role = e.target.value;
        this.renderColumnMapping();
      });
    });

    this.columnMappingBody.querySelectorAll('.mapping-activity-input').forEach((input) => {
      input.addEventListener('input', (e) => {
        const index = parseInt(e.target.dataset.mappingIndex, 10);
        this.columnMapping[index].activity = e.target.value;
      });
    });

    this.columnMappingSection.classList.remove('hidden');
  }

  async processFile() {
    if (!this.selectedFile) return;

    this.showLoading(true);
    this.clearErrors();

    try {
      // Process file without showing progress indicators initially
      const csvContent = await CostsplitterApp.readFileContent(this.selectedFile);
      const mapping = this.columnMapping.length ? this.columnMapping : null;
      const result = costsplitterPipeline(
        this.selectedFile, csvContent, this.paymentMode, this.roundingMode, mapping,
        this.ageWeightingMode,
      );

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
    // Clear any previous errors since we successfully got results
    this.clearErrors();
    // Move to step 3
    this.enableStep(3);

    // Check for warnings and display them
    if (result.calculation && result.calculation.warning) {
      this.displayWarning(result.calculation.warning);
      return;
    }

    const referenceText = this.selectedFile
      ? this.selectedFile.name.replace(/\.csv$/i, '')
      : 'Costsplitter';

    // Payment matrix with integrated instructions
    CostsplitterApp.displayPaymentMatrix(
      result.report.paymentMatrix, result.report.transactions, referenceText,
    );
    this.setupCopyAllButton(result.report.transactions, referenceText);
  }

  static getObligationClass(netObligation) {
    if (netObligation < 0) return 'text-green';
    if (netObligation > 0) return 'text-red';
    return 'text-gray';
  }

  static getPaymentCopyText(transaction, referenceText) {
    return buildPaymentCopyText({
      ibanName: transaction.ibanName,
      iban: transaction.iban,
      amountText: i18n.formatCurrency(transaction.amount),
      reference: referenceText,
      labels: {
        recipient: i18n.t('payment.copyText.recipient'),
        amount: i18n.t('payment.copyText.amount'),
        reference: i18n.t('payment.copyText.reference'),
      },
    });
  }

  setupCopyAllButton(transactions, referenceText) {
    const withIban = transactions.filter((t) => t.iban);

    if (withIban.length === 0) {
      this.copyAllButton.classList.add('hidden');
      this.copyAllButton.onclick = null;
      return;
    }

    this.copyAllButton.classList.remove('hidden');
    this.copyAllButton.textContent = i18n.t('payment.copyAll');
    this.copyAllButton.onclick = () => {
      const text = withIban
        .map((t) => CostsplitterApp.getPaymentCopyText(t, referenceText))
        .join('\n\n');
      navigator.clipboard.writeText(text).then(() => {
        this.copyAllButton.textContent = i18n.t('payment.copyAllCopied');
        setTimeout(() => {
          this.copyAllButton.textContent = i18n.t('payment.copyAll');
        }, 1500);
      });
    };
  }

  static displayPaymentMatrix(paymentMatrix, transactions = [], referenceText = 'Costsplitter') {
    const matrixEl = document.getElementById('matrixContent');

    // Create maps for who pays whom and who receives from whom
    const payerMap = {};  // Maps payer -> list of transactions they need to pay
    const receiverMap = {};  // Maps receiver -> list of transactions they will receive

    transactions.forEach((t) => {
      if (!payerMap[t.from]) payerMap[t.from] = [];
      payerMap[t.from].push(t);
      if (!receiverMap[t.to]) receiverMap[t.to] = [];
      receiverMap[t.to].push(t);
    });

    const canShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

    const buildActionButtons = (t) => {
      if (!t.iban) return '';
      const index = transactions.indexOf(t);
      const copyBtn = `<button type="button" class="btn inline-action-btn copy-payment-btn"
        data-transaction-index="${index}">${i18n.t('payment.copy')}</button>`;
      const shareBtn = canShare
        ? `<button type="button" class="btn inline-action-btn share-payment-btn"
            data-transaction-index="${index}">${i18n.t('payment.share')}</button>`
        : '';
      return copyBtn + shareBtn;
    };

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
            const paymentTransactions = payerMap[p.element] || [];
            const receivingTransactions = receiverMap[p.element] || [];
            const isSettled = Math.abs(p.netObligation) < 0.01;

            let actionContent;
            if (isSettled) {
              actionContent = `<span style="color: #059669; font-weight: 500;">✅ ${i18n.t('matrix.settled')}</span>`;
            } else {
              const allInstructions = [];

              // Add payment instructions (what this person needs to pay)
              paymentTransactions.forEach((t) => {
                const formattedAmount = i18n.formatCurrency(t.amount);
                allInstructions.push(`
                  <div class="payment-row-pay">
                    → ${i18n.t('payment.pays')} ${formattedAmount} ${i18n.t('payment.to')} ${t.to}
                    ${buildActionButtons(t)}
                  </div>
                `);
              });

              // Add receiving instructions (what this person will receive)
              receivingTransactions.forEach((t) => {
                const formattedAmount = i18n.formatCurrency(t.amount);
                const receivesLabel = i18n.t('payment.receives');
                const fromLabel = i18n.t('payment.from');
                allInstructions.push(`
                  <div class="payment-row-receive">
                    ← ${receivesLabel} ${formattedAmount} ${fromLabel} ${t.from}
                  </div>
                `);
              });

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
                <td style="min-width: 220px;">
                  ${actionContent}
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
      ${transactions.length === 0 ?
        `<div style="margin-top: 1rem; padding: 1rem; background: #f0fdf4; border-radius: 0.5rem; border: 1px solid #bbf7d0;"><p style="margin: 0; color: #059669; font-weight: 500; text-align: center;">✅ ${i18n.t('matrix.noPaymentsNeeded')}</p></div>`
        : ''}
    `;

    matrixEl.querySelectorAll('.copy-payment-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const t = transactions[parseInt(btn.dataset.transactionIndex, 10)];
        const text = CostsplitterApp.getPaymentCopyText(t, referenceText);
        navigator.clipboard.writeText(text).then(() => {
          const original = btn.textContent;
          btn.textContent = i18n.t('payment.copied');
          setTimeout(() => { btn.textContent = original; }, 1500);
        });
      });
    });

    matrixEl.querySelectorAll('.share-payment-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const t = transactions[parseInt(btn.dataset.transactionIndex, 10)];
        const text = CostsplitterApp.getPaymentCopyText(t, referenceText);
        navigator.share({ text });
      });
    });
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


  toggleStepHelp(stepNumber) {
    const helpContent = this.getHelpContentElement(stepNumber);
    if (!helpContent) return;

    const isVisible = !helpContent.classList.contains('hidden');

    if (isVisible) {
      this.closeStepHelp(stepNumber);
    } else {
      this.showStepHelp(stepNumber);
    }
  }

  showStepHelp(stepNumber) {
    // Close all other help sections first
    this.closeAllHelp();

    const helpContent = this.getHelpContentElement(stepNumber);
    if (helpContent) {
      helpContent.classList.remove('hidden');
      this.helpBackdrop.classList.remove('hidden');
    }
  }

  closeStepHelp(stepNumber) {
    const helpContent = this.getHelpContentElement(stepNumber);
    if (helpContent) {
      helpContent.classList.add('hidden');
    }
    this.helpBackdrop.classList.add('hidden');
  }

  closeAllHelp() {
    if (this.helpContent1) this.helpContent1.classList.add('hidden');
    if (this.helpContent2) this.helpContent2.classList.add('hidden');
    if (this.helpContent3) this.helpContent3.classList.add('hidden');
    this.helpBackdrop.classList.add('hidden');
  }

  getHelpContentElement(stepNumber) {
    switch (stepNumber) {
      case 1:
        return this.helpContent1;
      case 2:
        return this.helpContent2;
      case 3:
        return this.helpContent3;
      default:
        return null;
    }
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
    const transactions = this.currentResults.report.transactions;
    const paymentMatrix = this.currentResults.report.paymentMatrix;
    const activities = summary.activities || [];
    const fileName = this.selectedFile ? this.selectedFile.name : 'ausgabendaten';
    const referenceText = fileName.replace(/\.csv$/i, '');

    const paymentModeLabel = this.paymentMode === 'group' ? 'Gruppe' : 'Individuell';
    const roundingLabel = this.roundingMode === 'roundToFive' ? 'Auf 5€ gerundet' : 'Exakt';
    const ageWeightingLabel = this.ageWeightingMode === 'solidarity' ? 'Solidarität' : 'Linear';

    const pageWidth = doc.internal.pageSize.getWidth();
    const marginX = 20;
    let yPos = 20;

    const ensureSpace = (needed) => {
      if (yPos + needed > 280) {
        doc.addPage();
        yPos = 20;
      }
    };

    const drawWrappedText = (text, x, maxWidth, lineHeight = 5) => {
      doc.splitTextToSize(text, maxWidth).forEach((line) => {
        ensureSpace(lineHeight + 2);
        doc.text(line, x, yPos);
        yPos += lineHeight;
      });
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
    doc.addImage(LOGO_PNG_BASE64, 'PNG', marginX, 6, 16, 16);
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text('Costsplitter', marginX + 20, 17);
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    doc.text('Ausgabenbericht', marginX + 20, 24);
    doc.setTextColor(...DARK);
    yPos = 40;

    doc.setFontSize(9);
    doc.setTextColor(...GRAY);
    doc.text(`Quelldatei: ${fileName}`, marginX, yPos);
    doc.text(`Erstellt am: ${new Date().toLocaleDateString('de-DE')}`, pageWidth - marginX, yPos, { align: 'right' });
    yPos += 6;
    doc.text(
      `Zahlungsmodus: ${paymentModeLabel}   ·   Rundung: ${roundingLabel}   ·   `
        + `Altersgewichtung: ${ageWeightingLabel}`,
      marginX, yPos,
    );
    doc.setTextColor(...DARK);
    yPos += 10;

    // Intro: plain-language explanation for anyone reading the report
    doc.setFontSize(9.5);
    drawWrappedText(
      'Dieser Bericht zeigt, wer wem wie viel bezahlen muss, damit alle Ausgaben der Reise '
        + 'fair aufgeteilt sind. Die Kosten wurden nach Teilnahme, Alter und individuellen '
        + 'Anpassungen gewichtet. Die Zahlungsanweisungen unten zeigen die kleinstmögliche '
        + 'Anzahl an Überweisungen, um alle offenen Beträge auszugleichen. Die Zahlungsübersicht '
        + 'und Aktivitätsaufschlüsselung weiter unten liefern die Details dazu, falls jemand '
        + 'nachvollziehen möchte, wie die Beträge zustande kamen.',
      marginX, pageWidth - marginX * 2, 5,
    );
    yPos += 8;

    // Summary section
    drawSectionHeader('Zusammenfassung');
    doc.setFontSize(11);
    doc.text(`Teilnehmer: ${this.currentResults.metadata.participantCount}`, marginX + 5, yPos);
    yPos += 7;
    doc.text(`Gesamt bezahlt: ${euro(summary.totalPaid)}`, marginX + 5, yPos);
    yPos += 7;
    doc.text(`Aktivitäten: ${activities.length}`, marginX + 5, yPos);
    yPos += 14;

    // Payment Instructions section
    drawSectionHeader('Zahlungsanweisungen');
    doc.setFontSize(9);
    doc.setTextColor(...GRAY);
    drawWrappedText(
      'So gleichen Sie alle Schulden mit der kleinstmöglichen Anzahl an Überweisungen aus:',
      marginX + 5, pageWidth - marginX * 2 - 5, 4.5,
    );
    doc.setTextColor(...DARK);
    yPos += 3;
    doc.setFontSize(10);

    if (instructions.length === 0) {
      doc.setTextColor(...GREEN);
      doc.text('Keine Zahlungen nötig – alles ausgeglichen!', marginX + 5, yPos);
      doc.setTextColor(...DARK);
      yPos += 12;
    } else {
      transactions.forEach((t) => {
        const instructionText = `${t.from} zahlt ${t.to} ${euro(t.amount)}`;

        if (t.iban && window.qrcode) {
          ensureSpace(26);
          const qrDataUrl = renderQrDataUrl(window.qrcode, buildEpcQrPayload({
            name: t.ibanName,
            iban: t.iban,
            amount: t.amount,
            remittanceInfo: `Costsplitter: ${referenceText}`,
          }));
          doc.addImage(qrDataUrl, 'PNG', marginX + 5, yPos - 4, 20, 20);
          doc.setFont(undefined, 'bold');
          doc.text(instructionText, marginX + 30, yPos + 1);
          doc.setFont(undefined, 'normal');
          doc.setFontSize(8.5);
          doc.setTextColor(...GRAY);
          doc.text(`IBAN: ${t.iban}`, marginX + 30, yPos + 7);
          doc.text(`Empfänger: ${t.ibanName}`, marginX + 30, yPos + 12);
          doc.setTextColor(...DARK);
          doc.setFontSize(10);
          yPos += 24;
        } else {
          ensureSpace(8);
          doc.text(`• ${instructionText}`, marginX + 5, yPos);
          yPos += 6;
        }
      });
      yPos += 8;
    }

    // Payment Matrix section
    drawSectionHeader('Zahlungsübersicht');
    doc.setFontSize(9);
    doc.setTextColor(...GRAY);
    drawWrappedText(
      'Alle Teilnehmer im Detail. Ein negativer Nettobetrag (grün) bedeutet, die Person bekommt '
        + 'Geld zurück; ein positiver Betrag (rot) bedeutet, sie muss noch zahlen.',
      marginX + 5, pageWidth - marginX * 2 - 5, 4.5,
    );
    doc.setTextColor(...DARK);
    yPos += 3;

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
      doc.setFontSize(9);
      doc.setTextColor(...GRAY);
      drawWrappedText(
        'Zum Nachvollziehen: Aufschlüsselung der Kosten je Aktivität, wer bezahlt hat und welchen '
          + 'Anteil jede Person trägt.',
        marginX + 5, pageWidth - marginX * 2 - 5, 4.5,
      );
      doc.setTextColor(...DARK);
      yPos += 3;

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
    this.ageWeightingToggle.checked = false;
    this.ageWeightingMode = 'linear';
    this.updateAgeWeightingUI();
    CostsplitterApp.resetProgress();
    this.closeAllHelp();
    this.currentResults = null;
    this.columnMapping = [];
    this.renderColumnMapping();
    this.copyAllButton.classList.add('hidden');
    this.copyAllButton.onclick = null;

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
  }

  updateRoundingUI() {
    const isRoundToFive = this.roundingMode === 'roundToFive';

    // Update label states
    this.exactLabel.classList.toggle('active', !isRoundToFive);
    this.roundToFiveLabel.classList.toggle('active', isRoundToFive);
  }

  updateAgeWeightingUI() {
    const isSolidarity = this.ageWeightingMode === 'solidarity';

    // Update label states
    this.linearLabel.classList.toggle('active', !isSolidarity);
    this.solidarityLabel.classList.toggle('active', isSolidarity);
  }

  async downloadExampleFile(exampleType) {
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

      // Create a download link
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

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
