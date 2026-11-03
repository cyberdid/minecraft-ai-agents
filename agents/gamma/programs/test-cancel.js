// programs/test-cancel.js
console.log("isCancelled:", typeof isCancelled !== "undefined" ? isCancelled() : "undefined");
console.log("isProgramCancelled:", typeof globalThis.isProgramCancelled, globalThis.isProgramCancelled ? globalThis.isProgramCancelled() : "");
