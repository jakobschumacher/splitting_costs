/**
 * Frontend/UI Tests for CostsplitterApp
 * Tests DOM manipulation, user interactions, and UI state management
 */

// Mock the HTML structure that the app expects
const mockHTML = `
<!DOCTYPE html>
<html>
<head>
  <title>Test</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="container">
    <input type="file" id="csvFile" accept=".csv" class="hidden">
    <div id="dropZone" class="drop-zone"></div>
    <input type="checkbox" id="paymentModeToggle">
    <span id="individualLabel">Individual</span>
    <span id="groupLabel">Group</span>
    <p id="paymentModeDescription">Individual: Each person's expenses are tracked separately</p>
    <input type="checkbox" id="roundingToggle">
    <span id="exactLabel">Exact</span>
    <span id="roundToFiveLabel">Round to 5€</span>
    <p id="roundingDescription">Exact: Keep precise amounts down to cents</p>
    <div id="step1" class="step-section"></div>
    <div id="step2" class="step-section"></div>
    <div id="step3" class="step-section hidden"></div>
    <input type="checkbox" id="roundToFiveEuros">
    <div id="errorDisplay" class="hidden"></div>
    <div id="loadingDisplay" class="hidden"></div>
    <button id="helpButton" class="btn">?</button>
    <div id="csvHelp" class="hidden"></div>
    <button id="downloadPdfButton" class="btn">Download PDF</button>
    <button id="resetButton" class="btn">Reset</button>
    <button id="languageButton" class="btn">EN</button>
    <div id="uploadDefaultState"></div>
    <div id="uploadedState" class="hidden">
      <span id="uploadedFileNameBottom"></span>
    </div>
    <div id="progressSteps" class="hidden">
      <div id="progressTitle">Processing</div>
      <div class="progress-step-horizontal" data-step="parsing"></div>
      <div class="progress-step-horizontal" data-step="security"></div>
      <div class="progress-step-horizontal" data-step="validation"></div>
      <div class="progress-step-horizontal" data-step="transformation"></div>
      <div class="progress-step-horizontal" data-step="calculation"></div>
      <div class="progress-step-horizontal" data-step="reporting"></div>
    </div>
    <div id="summaryContent"></div>
    <div id="instructionsContent"></div>
    <div id="matrixContent"></div>
    <div id="activitiesContent"></div>
  </div>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
  <script type="module" src="src/ui/app.js"></script>
</body>
</html>
`;

// Setup DOM environment for each test
function setupDOM() {
  // Extract and set up the head and body content from mock HTML
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
      setFont: jest.fn(),
      setTextColor: jest.fn(),
      addPage: jest.fn(),
      save: jest.fn()
    }))
  };
}

// Mock the dependencies that CostsplitterApp imports
jest.mock('../src/pipeline.js', () => ({
  costsplitterPipeline: jest.fn()
}));

jest.mock('../src/ui/errorClassification.js', () => ({
  classifyError: jest.fn(() => ({
    type: 'general-error',
    severity: 'high',
    category: 'processing',
    primaryMessage: undefined,
    helpText: undefined
  })),
  generateErrorSuggestions: jest.fn(() => ['Check your file format']),
  generateHelpResources: jest.fn(() => ['Help resource 1'])
}));

// Import the app class after mocking
import { costsplitterPipeline } from '../src/pipeline.js';

describe('CostsplitterApp Frontend Tests', () => {
  let CostsplitterApp;
  let app;

  beforeEach(async () => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup fresh DOM
    setupDOM();

    // Dynamically import the app class to ensure fresh instance
    const module = await import('../src/ui/app.js');
    CostsplitterApp = module.default;

    // Create app instance
    app = new CostsplitterApp();
  });

  afterEach(() => {
    // Clear DOM
    document.head.innerHTML = '';
    document.body.innerHTML = '';
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
      expect(app.errorDisplay).toBeTruthy();
      expect(app.loadingDisplay).toBeTruthy();
      expect(app.helpButton).toBeTruthy();
      expect(app.csvHelp).toBeTruthy();
      expect(app.downloadPdfButton).toBeTruthy();
      expect(app.resetButton).toBeTruthy();
      expect(app.uploadDefaultState).toBeTruthy();
      expect(app.uploadedState).toBeTruthy();
    });

    test('sets initial payment mode to individual', () => {
      expect(app.paymentMode).toBe('individual');
    });

    test('shows step 1 and 2 by default', () => {
      expect(app.step1.classList.contains('hidden')).toBe(false);
      expect(app.step2.classList.contains('hidden')).toBe(false);
      expect(app.step3.classList.contains('hidden')).toBe(true);
    });

    test('CSS stylesheet is properly linked in HTML', () => {
      const cssLink = document.querySelector('link[rel="stylesheet"][href="styles.css"]');
      expect(cssLink).toBeTruthy();
      expect(cssLink.getAttribute('href')).toBe('styles.css');
    });

    test('JavaScript module is properly loaded and app initializes', () => {
      // Check that the script tag for the main app module exists
      const scriptTag = document.querySelector('script[type="module"][src="src/ui/app.js"]');
      expect(scriptTag).toBeTruthy();
      expect(scriptTag.getAttribute('src')).toBe('src/ui/app.js');
      expect(scriptTag.getAttribute('type')).toBe('module');

      // Verify that the app instance was created and initialized properly
      expect(app).toBeDefined();
      expect(app.paymentMode).toBe('individual');
      expect(app.selectedFile).toBeNull();

      // Verify core functionality is available
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
        enumerable: true
      });

      app.fileInput.dispatchEvent(event);
      expect(app.selectedFile).toBe(mockFile);
    });

    test('binds payment mode toggle event', () => {
      const event = new Event('change');
      Object.defineProperty(event, 'target', {
        value: { checked: true },
        enumerable: true
      });

      app.paymentModeToggle.dispatchEvent(event);
      expect(app.paymentMode).toBe('group');
    });

    test('binds rounding toggle event', () => {
      const event = new Event('change');
      Object.defineProperty(event, 'target', {
        value: { checked: true },
        enumerable: true
      });

      app.roundingToggle.dispatchEvent(event);
      expect(app.roundingMode).toBe('roundToFive');
    });

    test('binds help button click event', () => {
      expect(app.csvHelp.classList.contains('hidden')).toBe(true);

      app.helpButton.click();
      expect(app.csvHelp.classList.contains('hidden')).toBe(false);

      app.helpButton.click();
      expect(app.csvHelp.classList.contains('hidden')).toBe(true);
    });
  });

  describe('File Upload Functionality', () => {
    test('handles file selection correctly', () => {
      const mockFile = new File(['test,content'], 'test.csv', { type: 'text/csv' });

      app.handleFileSelect({
        target: { files: [mockFile] }
      });

      expect(app.selectedFile).toBe(mockFile);
      expect(app.uploadDefaultState.classList.contains('hidden')).toBe(true);
      expect(app.uploadedState.classList.contains('hidden')).toBe(false);
      expect(app.step2.classList.contains('hidden')).toBe(false);
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
      event.dataTransfer = {
        files: [mockFile]
      };

      app.handleDrop(event);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(app.selectedFile).toBe(mockFile);
      expect(app.dropZone.classList.contains('dragover')).toBe(false);
    });

    test('validates file type', () => {
      const invalidFile = new File(['test content'], 'test.txt', { type: 'text/plain' });

      app.handleFileSelect({
        target: { files: [invalidFile] }
      });

      expect(app.selectedFile).toBeNull();
      expect(app.errorDisplay.classList.contains('hidden')).toBe(false);
      expect(app.errorDisplay.textContent).toContain('CSV');
    });

    test('validates file size', () => {
      // Mock a file larger than 10MB
      const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large.csv', { type: 'text/csv' });
      Object.defineProperty(largeFile, 'size', { value: 11 * 1024 * 1024 });

      app.handleFileSelect({
        target: { files: [largeFile] }
      });

      expect(app.selectedFile).toBeNull();
      expect(app.errorDisplay.classList.contains('hidden')).toBe(false);
      expect(app.errorDisplay.textContent).toContain('10MB');
    });
  });

  describe('Step Navigation', () => {
    test('showStep method controls step visibility', () => {
      app.showStep(2);

      expect(app.step1.classList.contains('hidden')).toBe(false);
      expect(app.step2.classList.contains('hidden')).toBe(false);
      expect(app.step3.classList.contains('hidden')).toBe(true);
    });

    test('showStep method handles step 3', () => {
      app.showStep(3);

      expect(app.step1.classList.contains('hidden')).toBe(false);
      expect(app.step2.classList.contains('hidden')).toBe(false);
      expect(app.step3.classList.contains('hidden')).toBe(false);
    });
  });

  describe('Error Handling', () => {
    test('displayError shows error message', () => {
      const errorResult = {
        error: 'Test error',
        details: 'Test details'
      };

      app.displayError(errorResult);

      expect(app.errorDisplay.classList.contains('hidden')).toBe(false);
      expect(app.errorDisplay.textContent).toContain('Test error');
    });

    test('clearErrors hides error display', () => {
      app.errorDisplay.classList.remove('hidden');
      app.errorDisplay.textContent = 'Some error';

      app.clearErrors();

      expect(app.errorDisplay.classList.contains('hidden')).toBe(true);
      // Note: clearErrors only hides the display, doesn't clear textContent
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
      // Add some classes to existing progress steps
      const steps = document.querySelectorAll('[data-step]');
      steps.forEach(step => {
        step.classList.add('active', 'completed');
      });

      CostsplitterApp.resetProgress();

      steps.forEach(step => {
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

      // Mock successful pipeline result
      costsplitterPipeline.mockResolvedValue({
        success: true,
        report: {
          summary: { totalParticipants: 2, totalPaid: 100, activities: [] },
          instructions: [],
          paymentMatrix: []
        }
      });

      // Mock FileReader
      const mockFileReader = {
        onload: null,
        onerror: null,
        readAsText: jest.fn(function() {
          setTimeout(() => {
            this.onload({ target: { result: 'test,content' } });
          }, 0);
        })
      };
      global.FileReader = jest.fn(() => mockFileReader);

      await app.processFile();

      expect(costsplitterPipeline).toHaveBeenCalledWith(
        mockFile,
        'test,content',
        'individual',
        'exact'
      );
    });

    test('processFile handles errors gracefully', async () => {
      const mockFile = new File(['test,content'], 'test.csv', { type: 'text/csv' });
      app.selectedFile = mockFile;

      // Mock failed pipeline result
      costsplitterPipeline.mockResolvedValue({
        success: false,
        error: 'Processing failed',
        details: 'Invalid data'
      });

      // Mock FileReader
      const mockFileReader = {
        onload: null,
        onerror: null,
        readAsText: jest.fn(function() {
          setTimeout(() => {
            this.onload({ target: { result: 'test,content' } });
          }, 0);
        })
      };
      global.FileReader = jest.fn(() => mockFileReader);

      await app.processFile();

      expect(app.errorDisplay.classList.contains('hidden')).toBe(false);
      expect(app.errorDisplay.textContent).toContain('An error occurred');
    });
  });

  describe('Reset Functionality', () => {
    test('reset method clears all state', () => {
      // Set some state
      app.selectedFile = new File(['test'], 'test.csv', { type: 'text/csv' });
      app.paymentMode = 'group';
      app.currentResults = { some: 'data' };
      app.showStep(3);

      app.reset();

      expect(app.selectedFile).toBeNull();
      expect(app.paymentMode).toBe('individual');
      expect(app.currentResults).toBeNull();
      expect(app.step1.classList.contains('hidden')).toBe(false);
      expect(app.step2.classList.contains('hidden')).toBe(false);
      expect(app.step3.classList.contains('hidden')).toBe(true);
      expect(app.uploadDefaultState.classList.contains('hidden')).toBe(false);
      expect(app.uploadedState.classList.contains('hidden')).toBe(true);
    });
  });

  describe('Display Methods', () => {
    test('displaySummary renders summary correctly', () => {
      const summary = {
        totalParticipants: 3,
        totalPaid: 150.50,
        activities: [{ name: 'Dinner' }, { name: 'Hotel' }]
      };

      CostsplitterApp.displaySummary(summary);

      const summaryEl = document.getElementById('summaryContent');
      expect(summaryEl.textContent).toContain('3');
      expect(summaryEl.textContent).toContain('€150.50');
      expect(summaryEl.textContent).toContain('2');
    });

    test('displayInstructions handles empty instructions', () => {
      CostsplitterApp.displayInstructions([]);

      const instructionsEl = document.getElementById('instructionsContent');
      expect(instructionsEl.textContent).toContain('No payments needed');
    });

    test('displayInstructions renders payment instructions', () => {
      const instructions = ['John pays €25.00 to Alice', 'Bob pays €15.00 to Charlie'];

      CostsplitterApp.displayInstructions(instructions);

      const instructionsEl = document.getElementById('instructionsContent');
      expect(instructionsEl.textContent).toContain('John pays €25.00 to Alice');
      expect(instructionsEl.textContent).toContain('Bob pays €15.00 to Charlie');
    });
  });
});