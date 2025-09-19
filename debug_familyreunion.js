// Debug script to test familyreunion.csv and document failure points
const fs = require('fs');

// Simple test without importing the pipeline to avoid ES module issues
console.log('🔍 DEBUGGING FAMILYREUNION.CSV');
console.log('='.repeat(50));

function debugCsvStructure() {
  try {
    const csvContent = fs.readFileSync('./testdata/familyreunion.csv', 'utf8');

    console.log('📄 File info:');
    console.log(`- Size: ${csvContent.length} bytes`);
    console.log(`- Lines: ${csvContent.split('\n').length}`);
    console.log('');

    const lines = csvContent.split('\n');
    console.log('📊 Header row:');
    console.log(lines[0]);
    console.log('');

    console.log('📋 First 3 data rows:');
    for (let i = 1; i <= 3; i++) {
      if (lines[i]) {
        console.log(`Row ${i}: ${lines[i]}`);
      }
    }
    console.log('');

    // Check column structure
    const headers = lines[0].split(',');
    console.log('🏷️  Column analysis:');
    console.log(`- Total columns: ${headers.length}`);
    console.log(`- Headers: ${headers.join(', ')}`);

    const payColumns = headers.filter(h => h.startsWith('pay_'));
    const costColumns = headers.filter(h => h.startsWith('cost_'));

    console.log(`- Pay columns: ${payColumns.join(', ')}`);
    console.log(`- Cost columns: ${costColumns.join(', ')}`);
    console.log('');

    // Check for common issues
    console.log('🔍 Potential issues:');

    if (payColumns.length === 0) {
      console.log('❌ No pay_ columns found');
    } else {
      console.log(`✅ Found ${payColumns.length} pay_ columns`);
    }

    if (costColumns.length === 0) {
      console.log('❌ No cost_ columns found');
    } else {
      console.log(`✅ Found ${costColumns.length} cost_ columns`);
    }

    if (!headers.includes('name')) {
      console.log('❌ Missing required "name" column');
    } else {
      console.log('✅ "name" column present');
    }

    // Check for empty rows or malformed data
    let emptyRows = 0;
    let shortRows = 0;

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) {
        emptyRows++;
      } else if (lines[i].split(',').length !== headers.length) {
        shortRows++;
      }
    }

    if (emptyRows > 0) {
      console.log(`⚠️  ${emptyRows} empty rows found`);
    }

    if (shortRows > 0) {
      console.log(`❌ ${shortRows} rows with wrong column count`);
    }

    console.log('');
    console.log('📝 ANALYSIS COMPLETE');

  } catch (error) {
    console.error('💥 Error reading file:', error.message);
  }
}

debugCsvStructure();

console.log('🔍 DEBUGGING FAMILYREUNION.CSV');
console.log('='.repeat(50));

try {
  // Read the CSV file
  const csvContent = fs.readFileSync('./testdata/familyreunion.csv', 'utf8');
  const file = { size: csvContent.length };

  console.log('📄 File info:');
  console.log(`- Size: ${file.size} bytes`);
  console.log(`- Lines: ${csvContent.split('\n').length}`);
  console.log('');

  // Test with individual mode
  console.log('🔄 Testing with INDIVIDUAL payment mode...');
  const individualResult = costsplitterPipeline(file, csvContent, 'individual');

  console.log('📊 INDIVIDUAL MODE RESULT:');
  console.log(`- Success: ${individualResult.success}`);
  console.log(`- Error: ${individualResult.error || 'None'}`);

  if (individualResult.steps) {
    console.log('- Processing steps:');
    Object.entries(individualResult.steps).forEach(([step, status]) => {
      const statusEmoji = status === 'passed' || status === 'completed' ? '✅' :
                         status === 'failed' ? '❌' : '🔄';
      console.log(`  ${statusEmoji} ${step}: ${status}`);
    });
  }

  if (individualResult.validationErrors) {
    console.log('- Validation errors:');
    individualResult.validationErrors.forEach(error => {
      console.log(`  ❌ Row ${error.row}, Column ${error.column}: ${error.message}`);
    });
  }

  if (individualResult.details) {
    console.log('- Details:', individualResult.details);
  }

  console.log('');

  // Test with group mode
  console.log('🔄 Testing with GROUP payment mode...');
  const groupResult = costsplitterPipeline(file, csvContent, 'group');

  console.log('📊 GROUP MODE RESULT:');
  console.log(`- Success: ${groupResult.success}`);
  console.log(`- Error: ${groupResult.error || 'None'}`);

  if (groupResult.steps) {
    console.log('- Processing steps:');
    Object.entries(groupResult.steps).forEach(([step, status]) => {
      const statusEmoji = status === 'passed' || status === 'completed' ? '✅' :
                         status === 'failed' ? '❌' : '🔄';
      console.log(`  ${statusEmoji} ${step}: ${status}`);
    });
  }

  if (groupResult.validationErrors) {
    console.log('- Validation errors:');
    groupResult.validationErrors.forEach(error => {
      console.log(`  ❌ Row ${error.row}, Column ${error.column}: ${error.message}`);
    });
  }

  console.log('');

  // Summary
  console.log('📝 SUMMARY:');
  console.log(`- Individual mode: ${individualResult.success ? 'SUCCESS ✅' : 'FAILED ❌'}`);
  console.log(`- Group mode: ${groupResult.success ? 'SUCCESS ✅' : 'FAILED ❌'}`);

  if (!individualResult.success && !groupResult.success) {
    console.log('');
    console.log('🚨 BOTH MODES FAILED - Investigation needed!');
  }

} catch (error) {
  console.error('💥 Script error:', error.message);
}