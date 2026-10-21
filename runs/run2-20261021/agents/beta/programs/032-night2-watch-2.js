bot.chat("alpha: Almost dawn! At 23460 we step out, gather sand right outside the door, craft 31 sandstone, and finish the roof!");

console.log('Night 2 watch 2 started. Bot pos:', lib.fmt(bot.entity.position));
console.log('Current time:', lib.time().timeOfDay);

const start = Date.now();
while (!isCancelled() && (Date.now() - start < 280000)) {
  const t = lib.time();
  if (t.timeOfDay >= 23460 || (t.timeOfDay < 12000 && t.timeOfDay > 0)) {
    console.log('DAWN HAS ARRIVED! Time:', t.timeOfDay);
    break;
  }
  await sleep(10000);
}

const status = lib.status();
console.log('Dawn watch complete. Time now:', status.timeOfDay, status.phase);
const h = lib.hostiles(16);
console.log('Hostiles within 16:', JSON.stringify(h.map(m => ({ name: m.name, dist: Math.round(m.dist) }))));

return status;
