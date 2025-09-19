import { costsplitterPipeline } from '../pipeline';
import {
  classifyError, generateErrorSuggestions, generateHelpResources,
} from './errorClassification';

class CostsplitterApp {
  constructor() {
    this.initializeElements();
    this.bindEvents();
    this.paymentMode = 'individual';
    this.showStep(1); // Initialize with step 1 visible
  }

  initializeElements() {
    this.fileInput = document.getElementById('csvFile');
    this.dropZone = document.getElementById('dropZone');
    this.step1 = document.getElementById('step1');
    this.step2 = document.getElementById('step2');
    this.step3 = document.getElementById('step3');
    this.paymentModeSelect = document.getElementById('paymentMode');
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

    // Payment mode selection
    this.paymentModeSelect.addEventListener('change', (e) => {
      this.paymentMode = e.target.value;
    });

    // Process button
    this.processButton.addEventListener('click', () => this.processFile());

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
      // Update file info display
      
      // Update the file info in the upload area
      document.getElementById('uploadedFileName').textContent = this.selectedFile.name;
      const sizeText = `${(this.selectedFile.size / 1024).toFixed(1)} KB`;
      document.getElementById('uploadedFileSize').textContent = sizeText;
      document.getElementById('uploadedFileNameBottom').textContent = this.selectedFile.name;

      // Switch upload area to success state
      this.uploadDefaultState.classList.add('hidden');
      this.uploadedState.classList.remove('hidden');
      this.dropZone.style.borderColor = '#059669';
      this.dropZone.style.backgroundColor = '#f0fdf4';

      // Move to step 2
      this.showStep(2);
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
    this.currentResults = result;
    // Move to step 3
    this.showStep(3);

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
    const errorTypeClass = classification.type.replace('-', '_');

    return `
      <div class="error-primary ${errorTypeClass}">
        <h3>${classification.primaryMessage}</h3>
        <p class="error-help">${classification.helpText}</p>
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
    doc.text('Costsplitter2 - Expense Report', 20, yPos);
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
    this.showStep(1);
    CostsplitterApp.showProgress(false);
    this.clearErrors();
    // File info section no longer exists
    this.paymentModeSelect.value = 'individual';
    this.paymentMode = 'individual';
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
        this.step1.classList.remove('hidden');
        break;
      case 2:
        this.step1.classList.remove('hidden'); // Keep step 1 visible
        this.step2.classList.remove('hidden');
        break;
      case 3:
        this.step1.classList.remove('hidden'); // Keep step 1 visible
        this.step2.classList.remove('hidden'); // Keep step 2 visible
        this.step3.classList.remove('hidden');
        break;
      default:
        this.step1.classList.remove('hidden');
    }
  }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // eslint-disable-next-line no-new
  new CostsplitterApp();
});
