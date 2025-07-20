const { DocumentGenerator } = require('./dist/core/document-generator');
const path = require('path');

async function testPythonSupport() {
  const generator = new DocumentGenerator();
  
  try {
    await generator.generateDocumentation(
      path.join(__dirname, 'src/plugins/python/__tests__/fixtures'),
      {
        outputDir: './test-output',
        outputFormat: 'markdown',
        includePrivate: false
      }
    );
    
    console.log('✅ Python support test completed successfully!');
    console.log('Check ./test-output/README.md for generated documentation');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await generator.cleanup();
  }
}

testPythonSupport();