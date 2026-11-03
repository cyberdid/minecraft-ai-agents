console.log("type of isCancelled:", typeof isCancelled);
console.log("type of globalThis.isCancelled:", typeof globalThis.isCancelled);
try {
  console.log("globalThis.marchToSpawnerPillbox toString has isCancelled?:", globalThis.marchToSpawnerPillbox.toString().includes('isCancelled'));
} catch (e) {
  console.log("march error:", e);
}
