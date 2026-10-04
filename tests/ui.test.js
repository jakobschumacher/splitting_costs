/**
 * Frontend/UI Tests for CostsplitterApp
 * Tests DOM manipulation, user interactions, and UI state management
 */

// Mock HTML mirroring the structure public/index.html actually provides,
// since public/src/ui/app.js is what's really deployed.
const mockHTML = `
<!DOCTYPE html>
<html>
<head>
  <title>Test</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="container">
    <select id="languageSelector">
      <option value="en">EN</option>
      <option value="de">DE</option>
    </select>
    <button id="resetButton" class="btn">Reset</button>

    <section id="step1" class="step-section">
      <button class="step-help-button" data-step="1">?</button>
      <div id="dropZone" class="drop-zone">
        <div id="uploadDefaultState"></div>
        <div id="uploadedState" class="hidden">
          <span id="uploadedFileNameBottom"></span>
        </div>
      </div>
      <input type="file" id="csvFile" class="hidden" accept=".csv">
      <div id="helpContent1" class="step-help-content hidden">
        <button class="close-help-button" data-step="1">×</button>
      </div>
      <button class="btn" data-example="simple">Simple Dinner</button>
      <button class="btn" data-example="family">Family Trip</button>
      <button class="btn" data-example="business">Business Travel</button>
      <a href="#" id="csvFormatHelpLink">CSV help</a>
    </section>

    <section id="step2" class="step-section step-disabled">
      <button class="step-help-button" data-step="2">?</button>
      <div id="step2Disabled" class="step-disabled-message"></div>
      <div id="processingOptions" class="hidden">
        <span id="individualLabel">Individual</span>
        <input type="checkbox" id="paymentModeToggle">
        <span id="groupLabel">Group</span>
        <p id="paymentModeDescription">Individual: Each person's expenses are tracked separately</p>
        <span id="exactLabel">Exact</span>
        <input type="checkbox" id="roundingToggle">
        <span id="roundToFiveLabel">Round to 5€</span>
        <p id="roundingDescription">Exact: Keep precise amounts down to cents</p>
        <div id="columnMappingSection" class="hidden">
          <table>
            <tbody id="columnMappingBody"></tbody>
          </table>
        </div>
        <button id="processButton" class="btn btn-primary" disabled>Process File</button>
      </div>
      <div id="progressSteps" class="hidden">
        <h3 id="progressTitle">Processing Your File</h3>
        <div class="progress-step-horizontal" data-step="parsing"></div>
        <div class="progress-step-horizontal" data-step="security"></div>
        <div class="progress-step-horizontal" data-step="validation"></div>
        <div class="progress-step-horizontal" data-step="transformation"></div>
        <div class="progress-step-horizontal" data-step="calculation"></div>
        <div class="progress-step-horizontal" data-step="reporting"></div>
      </div>
      <div id="loadingDisplay" class="hidden"></div>
      <div id="errorDisplay" class="hidden"></div>
      <div id="helpContent2" class="step-help-content hidden">
        <button class="close-help-button" data-step="2">×</button>
      </div>
    </section>

    <section id="step3" class="step-section step-disabled">
      <button class="step-help-button" data-step="3">?</button>
      <div id="step3Disabled" class="step-disabled-message"></div>
      <div id="resultsContent" class="hidden">
        <div id="matrixContent"></div>
        <button id="downloadPdfButton" class="btn">Download PDF</button>
      </div>
      <div id="helpContent3" class="step-help-content hidden">
        <button class="close-help-button" data-step="3">×</button>
      </div>
    </section>
  </div>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
  <script type="module" src="src/ui/app.js"></script>
</body>
</html>
`;

// Setup DOM environment for each test
function setupDOM() {
  const parser = new DOMParser();
  const doc = parser.parseFromString(mockHTML, 'text/html');
  document.head.innerHTML = doc.head.innerHTML;
  document.body.innerHTML = doc.body.innerHTML;

  // Mock jsPDF
  global.window.jspdf = {
    jsPDF: jest.fn().mockImplementation(() => ({
      setFontSize: jest.fn(),
      text: jest.fn(),
      line: jest.fn(),
      rect: jest.fn(),
      setFont: jest.fn(),
      setTextColor: jest.fn(),
      setFillColor: jest.fn(),
      setDrawColor: jest.fn(),
      setLineWidth: jest.fn(),
      setPage: jest.fn(),
      addPage: jest.fn(),
      save: jest.fn(),
      internal: {
        pageSize: { getWidth: () => 210 },
        getNumberOfPages: () => 1,
      },
    })),
  };
}

// Mock the dependencies that CostsplitterApp imports
jest.mock('../public/src/pipeline.js', () => ({
  costsplitterPipeline: jest.fn(),
}));

jest.mock('../public/src/ui/errorClassification.js', () => ({
  classifyError: jest.fn(() => ({
    type: 'general-error',
    severity: 'high',
    category: 'processing',
    primaryMessage: undefined,
    helpText: undefined,
  })),
  generateErrorSuggestions: jest.fn(() => ['Check your file format']),
  generateHelpResources: jest.fn(() => []),
}));

// Import the app class after mocking
import { costsplitterPipeline } from '../public/src/pipeline.js';
import { i18n } from '../public/src/i18n/i18n.js';

describe('CostsplitterApp Frontend Tests', () => {
  let CostsplitterApp;
  let app;

  beforeEach(async () => {
    jest.clearAllMocks();
    localStorage.removeItem('costsplitter-language');
    i18n.setLanguage('en');

    setupDOM();

    const module = await import('../public/src/ui/app.js');
    CostsplitterApp = module.default;

    app = new CostsplitterApp();
  });

  afterEach(() => {
    document.head.innerHTML = '';
    document.body.innerHTML = '';
    localStorage.removeItem('costsplitter-language');
  });

  describe('DOM Element Initialization', () => {
    test('initializes all required DOM elements', () => {
      expect(app.fileInput).toBeTruthy();
      expect(app.dropZone).toBeTruthy();
      expect(app.step1).toBeTruthy();
      expect(app.step2).toBeTruthy();
      expect(app.step3).toBeTruthy();
      expect(app.paymentModeToggle).toBeTruthy();
      expect(app.individualLabel).toBeTruthy();
      expect(app.groupLabel).toBeTruthy();
      expect(app.paymentModeDescription).toBeTruthy();
      expect(app.roundingToggle).toBeTruthy();
      expect(app.exactLabel).toBeTruthy();
      expect(app.roundToFiveLabel).toBeTruthy();
      expect(app.roundingDescription).toBeTruthy();
      expect(app.processButton).toBeTruthy();
      expect(app.errorDisplay).toBeTruthy();
      expect(app.loadingDisplay).toBeTruthy();
      expect(app.downloadPdfButton).toBeTruthy();
      expect(app.resetButton).toBeTruthy();
      expect(app.uploadDefaultState).toBeTruthy();
      expect(app.uploadedState).toBeTruthy();
      expect(app.languageSelector).toBeTruthy();
    });

    test('sets initial payment mode to individual', () => {
      expect(app.paymentMode).toBe('individual');
    });

    test('step 1 is enabled, steps 2 and 3 are disabled by default', () => {
      expect(app.step1.classList.contains('step-disabled')).toBe(false);
      expect(app.step2.classList.contains('step-disabled')).toBe(true);
      expect(app.step3.classList.contains('step-disabled')).toBe(true);
      expect(app.processButton.disabled).toBe(true);
    });

    test('app instance initializes core functionality', () => {
      expect(app).toBeDefined();
      expect(app.paymentMode).toBe('individual');
      expect(app.selectedFile).toBeNull();
      expect(typeof app.handleFileSelect).toBe('function');
      expect(typeof app.processFile).toBe('function');
      expect(typeof app.reset).toBe('function');
    });
  });

  describe('Event Binding', () => {
    test('binds file input change event', () => {
      const mockFile = new File(['test content'], 'test.csv', { type: 'text/csv' });
      const event = new Event('change');
      Object.defineProperty(event, 'target', {
        value: { files: [mockFile] },
        enumerable: true,
      });

      app.fileInput.dispatchEvent(event);
      expect(app.selectedFile).toBe(mockFile);
    });

    test('binds payment mode toggle event', () => {
      const event = new Event('change');
      Object.defineProperty(event, 'target', {
        value: { checked: true },
        enumerable: true,
      });

      app.paymentModeToggle.dispatchEvent(event);
      expect(app.paymentMode).toBe('group');
    });

    test('binds rounding toggle event', () => {
      const event = new Event('change');
      Object.defineProperty(event, 'target', {
        value: { checked: true },
        enumerable: true,
      });

      app.roundingToggle.dispatchEvent(event);
      expect(app.roundingMode).toBe('roundToFive');
    });

    test('binds step help toggle buttons', () => {
      const helpButton = document.querySelector('.step-help-button[data-step="1"]');
      expect(app.helpContent1.classList.contains('hidden')).toBe(true);

      helpButton.click();
      expect(app.helpContent1.classList.contains('hidden')).toBe(false);

      const closeButton = document.querySelector('.close-help-button[data-step="1"]');
      closeButton.click();
      expect(app.helpContent1.classList.contains('hidden')).toBe(true);
    });

    test('binds language selector change event', () => {
      const event = new Event('change');
      Object.defineProperty(event, 'target', { value: { value: 'de' }, enumerable: true });

      app.languageSelector.dispatchEvent(event);
      expect(i18n.getCurrentLanguage()).toBe('de');
    });
  });

  describe('File Upload Functionality', () => {
    test('handles file selection correctly', () => {
      const mockFile = new File(['test,content'], 'test.csv', { type: 'text/csv' });

      app.handleFileSelect({ target: { files: [mockFile] } });

      expect(app.selectedFile).toBe(mockFile);
      expect(app.uploadDefaultState.classList.contains('hidden')).toBe(true);
      expect(app.uploadedState.classList.contains('hidden')).toBe(false);
      expect(app.step2.classList.contains('step-disabled')).toBe(false);
      expect(app.processButton.disabled).toBe(false);
    });

    test('handles drag over event', () => {
      const event = new Event('dragover');
      event.preventDefault = jest.fn();

      app.handleDragOver(event);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(app.dropZone.classList.contains('dragover')).toBe(true);
    });

    test('handles file drop', () => {
      const mockFile = new File(['test,content'], 'test.csv', { type: 'text/csv' });
      const event = new Event('drop');
      event.preventDefault = jest.fn();
      event.dataTransfer = { files: [mockFile] };

      app.handleDrop(event);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(app.selectedFile).toBe(mockFile);
      expect(app.dropZone.classList.contains('dragover')).toBe(false);
    });

    test('validates file type', () => {
      const invalidFile = new File(['test content'], 'test.txt', { type: 'text/plain' });

      app.handleFileSelect({ target: { files: [invalidFile] } });

      expect(app.selectedFile).toBeNull();
      expect(app.errorDisplay.classList.contains('hidden')).toBe(false);
      expect(app.errorDisplay.textContent).toContain('CSV');
    });

    test('validates file size', () => {
      const largeFile = new File(['x'], 'large.csv', { type: 'text/csv' });
      Object.defineProperty(largeFile, 'size', { value: 11 * 1024 * 1024 });

      app.handleFileSelect({ target: { files: [largeFile] } });

      expect(app.selectedFile).toBeNull();
      expect(app.errorDisplay.classList.contains('hidden')).toBe(false);
      expect(app.errorDisplay.textContent).toContain('10MB');
    });
  });

  describe('Step Navigation', () => {
    test('enableStep(2) enables processing options', () => {
      app.enableStep(2);

      expect(app.step2.classList.contains('step-disabled')).toBe(false);
      expect(app.step2Disabled.classList.contains('hidden')).toBe(true);
      expect(app.processingOptions.classList.contains('hidden')).toBe(false);
      expect(app.processButton.disabled).toBe(false);
    });

    test('enableStep(3) reveals results', () => {
      app.enableStep(3);

      expect(app.step3.classList.contains('step-disabled')).toBe(false);
      expect(app.step3Disabled.classList.contains('hidden')).toBe(true);
      expect(app.resultsContent.classList.contains('hidden')).toBe(false);
    });

    test('disableStep(2) hides processing options again', () => {
      app.enableStep(2);
      app.disableStep(2);

      expect(app.step2.classList.contains('step-disabled')).toBe(true);
      expect(app.processingOptions.classList.contains('hidden')).toBe(true);
      expect(app.processButton.disabled).toBe(true);
    });
  });

  describe('Error Handling', () => {
    test('displayError shows error message', () => {
      const errorResult = {
        error: 'Test error',
        details: 'Test details',
      };

      app.displayError(errorResult);

      expect(app.errorDisplay.classList.contains('hidden')).toBe(false);
      expect(app.errorDisplay.textContent).toContain('Test error');
    });

    test('clearErrors hides error display', () => {
      app.errorDisplay.classList.remove('hidden');
      app.displayError({ error: 'Some error' });

      app.clearErrors();

      expect(app.errorDisplay.classList.contains('hidden')).toBe(true);
    });
  });

  describe('Loading States', () => {
    test('showLoading controls loading display', () => {
      app.showLoading(true);
      expect(app.loadingDisplay.classList.contains('hidden')).toBe(false);

      app.showLoading(false);
      expect(app.loadingDisplay.classList.contains('hidden')).toBe(true);
    });
  });

  describe('Progress Indicators', () => {
    test('updateProgress method updates step status', () => {
      const progressStep = document.querySelector('[data-step="parsing"]');

      CostsplitterApp.updateProgress('parsing', 'active');

      expect(progressStep.classList.contains('active')).toBe(true);
      expect(progressStep.classList.contains('completed')).toBe(false);
      expect(progressStep.classList.contains('error')).toBe(false);
    });

    test('resetProgress clears all step statuses', () => {
      const steps = document.querySelectorAll('[data-step]');
      steps.forEach((step) => {
        step.classList.add('active', 'completed');
      });

      CostsplitterApp.resetProgress();

      steps.forEach((step) => {
        expect(step.classList.contains('active')).toBe(false);
        expect(step.classList.contains('completed')).toBe(false);
        expect(step.classList.contains('error')).toBe(false);
      });
    });
  });

  describe('File Processing', () => {
    test('processFile calls pipeline with correct parameters', async () => {
      const mockFile = new File(['test,content'], 'test.csv', { type: 'text/csv' });
      app.selectedFile = mockFile;
      app.paymentMode = 'individual';

      // costsplitterPipeline is synchronous in the real implementation
      costsplitterPipeline.mockReturnValue({
        success: true,
        report: {
          summary: { totalParticipants: 2, totalPaid: 100, activities: {} },
          instructions: [],
          paymentMatrix: [],
        },
      });

      const mockFileReader = {
        onload: null,
        onerror: null,
        readAsText: jest.fn(function readAsText() {
          setTimeout(() => {
            this.onload({ target: { result: 'test,content' } });
          }, 0);
        }),
      };
      global.FileReader = jest.fn(() => mockFileReader);

      await app.processFile();

      expect(costsplitterPipeline).toHaveBeenCalledWith(
        mockFile,
        'test,content',
        'individual',
        'exact',
        null,
      );
      expect(app.step3.classList.contains('step-disabled')).toBe(false);
    });

    test('processFile handles errors gracefully', async () => {
      const mockFile = new File(['test,content'], 'test.csv', { type: 'text/csv' });
      app.selectedFile = mockFile;

      costsplitterPipeline.mockReturnValue({
        success: false,
        error: 'Processing failed',
        details: 'Invalid data',
      });

      const mockFileReader = {
        onload: null,
        onerror: null,
        readAsText: jest.fn(function readAsText() {
          setTimeout(() => {
            this.onload({ target: { result: 'test,content' } });
          }, 0);
        }),
      };
      global.FileReader = jest.fn(() => mockFileReader);

      await app.processFile();

      expect(app.errorDisplay.classList.contains('hidden')).toBe(false);
      expect(app.errorDisplay.textContent).toContain('Processing failed');
    });
  });

  describe('Reset Functionality', () => {
    test('reset method clears all state', () => {
      app.selectedFile = new File(['test'], 'test.csv', { type: 'text/csv' });
      app.paymentMode = 'group';
      app.currentResults = { some: 'data' };
      app.enableStep(3);

      app.reset();

      expect(app.selectedFile).toBeNull();
      expect(app.paymentMode).toBe('individual');
      expect(app.currentResults).toBeNull();
      expect(app.step2.classList.contains('step-disabled')).toBe(true);
      expect(app.step3.classList.contains('step-disabled')).toBe(true);
      expect(app.uploadDefaultState.classList.contains('hidden')).toBe(false);
      expect(app.uploadedState.classList.contains('hidden')).toBe(true);
    });
  });

  describe('Display Methods', () => {
    test('displayPaymentMatrix shows the settled message when there is nothing to pay', () => {
      CostsplitterApp.displayPaymentMatrix([
        { element: 'Alice', shouldPay: 50, alreadyPaid: 50, netObligation: 0 },
      ], []);

      const matrixEl = document.getElementById('matrixContent');
      expect(matrixEl.textContent).toContain('Alice');
      expect(matrixEl.textContent).toContain(i18n.t('matrix.noPaymentsNeeded'));
    });

    test('displayPaymentMatrix renders payment instructions per person', () => {
      CostsplitterApp.displayPaymentMatrix(
        [
          { element: 'John', shouldPay: 25, alreadyPaid: 0, netObligation: 25 },
          { element: 'Alice', shouldPay: 0, alreadyPaid: 25, netObligation: -25 },
        ],
        ['John pays Alice €25.00'],
      );

      const matrixEl = document.getElementById('matrixContent');
      expect(matrixEl.textContent).toContain('John');
      expect(matrixEl.textContent).toContain('Alice');
    });
  });
});
