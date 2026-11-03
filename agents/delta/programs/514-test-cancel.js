// programs/514-test-cancel.js
console.log('isCancelled():', isCancelled());
console.log('globalThis.isProgramCancelled():', typeof globalThis.isProgramCancelled === 'function' ? globalThis.isProgramCancelled() : 'none');
globalThis.isProgramCancelled = isCancelled;
console.log('after set, globalThis.isProgramCancelled():', globalThis.isProgramCancelled());
