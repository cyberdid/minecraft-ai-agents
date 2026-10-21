bot.chat("alpha: Safe inside our house for Night 2! At dawn we will gather 124 sand and finish the remaining 31 roof blocks.");

console.log('Night 2 watch 1 started. Bot pos:', lib.fmt(bot.entity.position));
const start = Date.now();
while (!isCancelled() && (Date.now() - start < 270000)) {
  const t = lib.time();
  if (t.timeOfDay >= 23460 || (t.timeOfDay < 12000 && t.timeOfDay > 0)) {
    console.log('Dawn has broken! Time:', t.timeOfDay);
    break;
  }
  await sleep(10000);
}

const status = lib.status();
console.log('Watch 1 complete. Time:', status.timeOfDay, status.phase);
const h = lib.hostiles(16);
console.log('Hostiles within 16:', JSON.stringify(h.map(m => ({ name: m.name, dist: Math.round(m.dist) }))));

return status;
