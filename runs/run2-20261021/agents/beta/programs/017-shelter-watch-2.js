bot.chat("alpha: Agreed! At dawn I will harvest 14 logs for roof & door, while you place sandstone walls at (10, 67, -25).");

console.log('Starting shelter watch 2. Bot pos:', lib.fmt(bot.entity.position));
console.log('Current time:', lib.time().timeOfDay, lib.time().phase);

// Wait until dawn (23460) or 280 seconds
const start = Date.now();
while (!isCancelled() && (Date.now() - start < 280000)) {
  const t = lib.time();
  if (t.timeOfDay >= 23460 || (t.timeOfDay < 12000 && t.timeOfDay > 0)) {
    console.log('DAWN HAS ARRIVED! Tick:', t.timeOfDay);
    break;
  }
  await sleep(10000);
}

const status = lib.status();
console.log('Watch 2 finished. Time now:', status.timeOfDay, status.phase);
const h = lib.hostiles(16);
console.log('Hostiles within 16:', JSON.stringify(h.map(m => ({ name: m.name, dist: Math.round(m.dist) }))));

return status;
