import { costsplitterPipeline } from '../pipeline';

class CostsplitterApp {
  constructor() {
    this.initializeElements();
    this.bindEvents();
    this.paymentMode = 'individual';
  }

  initializeElements() {
    this.fileInput = document.getElementById('csvFile');
    this.dropZone = document.getElementById('dropZone');
    this.uploadSection = document.getElementById('uploadSection');
    this.resultsSection = document.getElementById('resultsSection');
    this.paymentModeSelect = document.getElementById('paymentMode');
    this.processButton = document.getElementById('processButton');
    this.errorDisplay = document.getElementById('errorDisplay');
    this.loadingDisplay = document.getElementById('loadingDisplay');
    this.resultsDisplay = document.getElementById('resultsDisplay');
  }

  bindEvents() {
    // File input change
    this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));

    // Drag and drop
    this.dropZone.addEventListener('dragover', (e) => this.handleDragOver(e));
    this.dropZone.addEventListener('drop', (e) => this.handleDrop(e));
    this.dropZone.addEventListener('click', () => this.fileInput.click());

    // Payment mode selection
    this.paymentModeSelect.addEventListener('change', (e) => {
      this.paymentMode = e.target.value;
    });

    // Process button
    this.processButton.addEventListener('click', () => this.processFile());

    // Reset button
    document.getElementById('resetButton').addEventListener('click', () => this.reset());
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
      [this.selectedFile] = files;
      this.updateFileDisplay();
    }
  }

  handleFileSelect(e) {
    if (e.target.files.length > 0) {
      [this.selectedFile] = e.target.files;
      this.updateFileDisplay();
    }
  }

  updateFileDisplay() {
    if (this.selectedFile) {
      document.getElementById('fileName').textContent = this.selectedFile.name;
      const sizeText = `${(this.selectedFile.size / 1024).toFixed(1)} KB`;
      document.getElementById('fileSize').textContent = sizeText;
      document.getElementById('fileInfo').classList.remove('hidden');
      this.processButton.disabled = false;
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

      const result = costsplitterPipeline(this.selectedFile, csvContent, this.paymentMode);

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
    const steps = document.querySelectorAll('.step');
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
    // Keep upload section visible, just show results below
    this.uploadSection.classList.add('has-results');
    this.resultsSection.classList.remove('hidden');

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
      <div class="summary-grid">
        <div class="summary-item">
          <span class="label">Participants:</span>
          <span class="value">${summary.totalParticipants}</span>
        </div>
        <div class="summary-item">
          <span class="label">Total Paid:</span>
          <span class="value">€${summary.totalPaid.toFixed(2)}</span>
        </div>
        <div class="summary-item">
          <span class="label">Total Owed:</span>
          <span class="value">€${summary.totalOwed.toFixed(2)}</span>
        </div>
        <div class="summary-item">
          <span class="label">Balance Check:</span>
          <span class="value ${summary.balanceCheck ? 'success' : 'error'}">
            ${summary.balanceCheck ? '✓ Balanced' : '✗ Unbalanced'}
          </span>
        </div>
      </div>
    `;
  }

  static displayInstructions(instructions) {
    const instructionsEl = document.getElementById('instructionsContent');
    if (instructions.length === 0) {
      const noTransactionsText = '✅ No payments needed - everyone is settled!';
      instructionsEl.innerHTML = `<p class="no-transactions">${noTransactionsText}</p>`;
      return;
    }

    instructionsEl.innerHTML = `
      <ul class="instructions-list">
        ${instructions.map((instruction) => (
    `<li class="instruction-item">${instruction}</li>`
  )).join('')}
      </ul>
    `;
  }

  static getObligationClass(netObligation) {
    if (netObligation < 0) return 'credit';
    if (netObligation > 0) return 'debit';
    return 'neutral';
  }

  static displayPaymentMatrix(paymentMatrix) {
    const matrixEl = document.getElementById('matrixContent');
    matrixEl.innerHTML = `
      <table class="payment-table">
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
              <td>${p.element}</td>
              <td>€${p.shouldPay.toFixed(2)}</td>
              <td>€${p.alreadyPaid.toFixed(2)}</td>
              <td class="${CostsplitterApp.getObligationClass(p.netObligation)}">
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
    activitiesEl.innerHTML = `
      <div class="activities-grid">
        ${activities.map((activity) => `
          <div class="activity-card">
            <h4>${activity.name}</h4>
            <p>Total Paid: €${activity.totalPaid.toFixed(2)}</p>
            <p>Total Shares: ${activity.totalShares}</p>
            <p>Cost per Unit: €${activity.costPerUnit.toFixed(2)}</p>
          </div>
        `).join('')}
      </div>
    `;
  }

  displayError(error) {
    this.errorDisplay.classList.remove('hidden');

    let errorHtml = `<h3>Error: ${error.error}</h3>`;

    if (error.details) {
      if (Array.isArray(error.details)) {
        errorHtml += `<ul>${error.details.map((detail) => `<li>${detail}</li>`).join('')}</ul>`;
      } else {
        errorHtml += `<p>${error.details}</p>`;
      }
    }

    // Show steps that completed successfully
    if (error.steps) {
      errorHtml += '<h4>Processing Steps:</h4><ul>';
      if (error.steps.security === 'passed') {
        errorHtml += '<li>✅ Security check: PASSED</li>';
      }
      if (error.steps.validation === 'passed') {
        errorHtml += '<li>✅ Data validation: PASSED</li>';
      }
      if (error.steps.validation === 'failed') {
        errorHtml += '<li>❌ Data validation: FAILED</li>';
      }
      errorHtml += '</ul>';
    }

    // Show validation errors in detail
    if (error.validationErrors) {
      errorHtml += `
        <h4>Validation Errors:</h4>
        <ul>
          ${error.validationErrors.map((e) => (
    `<li><strong>Row ${e.row}, Column ${e.column}:</strong> ${e.message}</li>`
  )).join('')}
        </ul>
      `;
    }

    // Show CSV columns if available for debugging
    if (error.metadata && error.metadata.csvColumns) {
      errorHtml += `
        <h4>CSV Columns Found:</h4>
        <p><code>${error.metadata.csvColumns.join(', ')}</code></p>
      `;
    }

    this.errorDisplay.innerHTML = errorHtml;
  }

  clearErrors() {
    this.errorDisplay.classList.add('hidden');
  }

  showLoading(show) {
    this.loadingDisplay.classList.toggle('hidden', !show);
  }

  reset() {
    this.selectedFile = null;
    this.fileInput.value = '';
    this.uploadSection.classList.remove('has-results');
    this.resultsSection.classList.add('hidden');
    CostsplitterApp.showProgress(false);
    this.clearErrors();
    document.getElementById('fileInfo').classList.add('hidden');
    this.processButton.disabled = true;
    this.paymentModeSelect.value = 'individual';
    this.paymentMode = 'individual';
    CostsplitterApp.resetProgress();
  }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // eslint-disable-next-line no-new
  new CostsplitterApp();
});
