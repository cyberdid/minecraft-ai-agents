bot.chat("alpha: Safely sheltered. Waiting for dawn (23460) to build the 5x5 house at (10, 67, -25).");

console.log('Starting shelter watch 1. Bot pos:', lib.fmt(bot.entity.position));
console.log('Current time:', lib.time().timeOfDay, lib.time().phase);

// Monitor time for up to 140s or until dawn (23460)
const startTime = Date.now();
while (!isCancelled() && (Date.now() - startTime < 140000)) {
  const t = lib.time();
  if (t.timeOfDay >= 23460 || (t.timeOfDay < 12000 && t.timeOfDay > 0)) {
    console.log('Dawn has arrived! Tick:', t.timeOfDay);
    break;
  }
  await sleep(10000);
}

const status = lib.status();
console.log('Watch 1 complete. Time now:', status.timeOfDay, status.phase);
const h = lib.hostiles(16);
console.log('Hostiles within 16:', JSON.stringify(h.map(m => ({ name: m.name, dist: Math.round(m.dist) }))));

return status;
