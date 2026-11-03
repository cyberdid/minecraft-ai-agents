// programs/600-check-portal-and-sleep.js
globalThis.isProgramCancelled = isCancelled;
console.log('=== CHECK PORTAL AND PREPARE SLEEP ===');
const sill = bot.blockAt(new Vec3(299, 72, -54));
const p1 = bot.blockAt(new Vec3(299, 73, -54));
console.log('Sill (299, 72, -54):', sill ? sill.name : 'null');
console.log('Portal (299, 73, -54):', p1 ? p1.name : 'null');

bot.chat('gamma: Standing by base bed (294, 72, -55). Night in ~80s. Let us sleep together to keep portal site safe!');

// Wait until canSleep
while (!bot.time.isNight && (bot.time.timeOfDay < 12542 || bot.time.timeOfDay > 23460) && !isCancelled()) {
  const pCheck = bot.blockAt(new Vec3(299, 73, -54));
  if (pCheck && pCheck.name === 'nether_portal') {
    console.log('PORTAL LIT!');
    break;
  }
  await sleep(1000);
}

if (!isCancelled() && (bot.time.timeOfDay >= 12542 && bot.time.timeOfDay <= 23460)) {
  console.log('Night reached! Sleeping...');
  const bed = bot.blockAt(new Vec3(294, 72, -55));
  if (bed) {
    try {
      await bot.sleep(bed);
      console.log('Sleeping peacefully in bed!');
      bot.chat('gamma: In bed skipping night with team!');
    } catch (e) {
      console.log('Sleep error:', e.message);
    }
  }

  while (bot.isSleeping && !isCancelled()) {
    await sleep(500);
  }
  console.log('Morning! New time:', bot.time.timeOfDay);
}

return {
  time: bot.time.timeOfDay,
  hp: bot.health,
  food: bot.food,
  sill: bot.blockAt(new Vec3(299, 72, -54))?.name,
  portal: bot.blockAt(new Vec3(299, 73, -54))?.name
};
