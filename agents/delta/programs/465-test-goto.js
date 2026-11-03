globalThis.isProgramCancelled = () => false;

console.log("Current pos:", lib.fmt(bot.entity.position));
console.log("Trying lib.goTo to (38, 65, -176)...");
try {
  await lib.goTo(38, 65, -176, 2, { dig: false, timeoutMs: 8000 });
  console.log("lib.goTo success! Pos:", lib.fmt(bot.entity.position));
} catch (e) {
  console.log("lib.goTo error:", e.message);
}
