globalThis.isCancelled = isCancelled;
console.log("type of globalThis.isCancelled:", typeof globalThis.isCancelled);
try {
  let count = 0;
  while (!globalThis.isCancelled() && count < 3) {
    count++;
  }
  console.log("Loop ran successfully, count:", count);
} catch (e) {
  console.log("Loop failed:", e);
}
