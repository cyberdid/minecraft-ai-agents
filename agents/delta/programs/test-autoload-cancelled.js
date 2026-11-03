globalThis.isCancelled = isCancelled;
try {
  console.log("globalThis.isCancelled():", globalThis.isCancelled());
  const fn = new Function('return typeof isCancelled');
  console.log("unqualified typeof isCancelled in Function:", fn());
} catch (e) {
  console.log("Error:", e);
}
