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
    this.clearErrors();

    try {
      const csvContent = await CostsplitterApp.readFileContent(this.selectedFile);
      const result = costsplitterPipeline(this.selectedFile, csvContent, this.paymentMode);

      if (result.success) {
        this.displayResults(result);
      } else {
        this.displayError(result);
      }
    } catch (error) {
      this.displayError({
        error: 'File processing failed',
        details: error.message,
      });
    } finally {
      this.showLoading(false);
    }
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
    this.uploadSection.classList.add('hidden');
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
    this.errorDisplay.innerHTML = `
      <h3>Error: ${error.error}</h3>
      <p>${error.details}</p>
      ${error.validationErrors ? `
        <h4>Validation Errors:</h4>
        <ul>
          ${error.validationErrors.map((e) => (
    `<li>Row ${e.row}, Column ${e.column}: ${e.message}</li>`
  )).join('')}
        </ul>
      ` : ''}
    `;
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
    this.uploadSection.classList.remove('hidden');
    this.resultsSection.classList.add('hidden');
    this.clearErrors();
    document.getElementById('fileInfo').classList.add('hidden');
    this.processButton.disabled = true;
    this.paymentModeSelect.value = 'individual';
    this.paymentMode = 'individual';
  }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // eslint-disable-next-line no-new
  new CostsplitterApp();
});
