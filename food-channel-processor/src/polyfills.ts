// Polyfill for File API in Node.js environment
if (typeof global !== 'undefined' && !global.File) {
    const { File: NodeFile } = require('node:buffer');
    global.File = NodeFile;
  }
  
  // Polyfill for Blob API if needed
  if (typeof global !== 'undefined' && !global.Blob) {
    const { Blob: NodeBlob } = require('node:buffer');
    global.Blob = NodeBlob;
  }
  
  // Polyfill for FormData if needed
  if (typeof global !== 'undefined' && !global.FormData) {
    const { FormData } = require('formdata-node');
    global.FormData = FormData;
  }
  
  export {};