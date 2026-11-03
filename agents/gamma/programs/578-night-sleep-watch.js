// programs/578-night-sleep-watch.js
globalThis.isProgramCancelled = isCancelled;
console.log('=== NIGHT SLEEP WATCH & PORTAL MONITOR ===');
console.log('Start time:', bot.time.timeOfDay, 'canSleep:', bot.time.isNight);

// Check portal block
const sill = bot.blockAt(new Vec3(299, 72, -54));
const p1 = bot.blockAt(new Vec3(299, 73, -54));
console.log('Sill (299, 72, -54):', sill ? sill.name : 'null');
console.log('Portal block (299, 73, -54):', p1 ? p1.name : 'null');

// Monitor for up to 60 seconds
const start = Date.now();
while (Date.now() - start < 45000 && !isCancelled()) {
  const t = lib.time();
  if (t.canSleep) {
    console.log('Night reached! Attempting to sleep in bed at (294, 72, -55)...');
    const bed = bot.blockAt(new Vec3(294, 72, -55));
    if (bed) {
      try {
        await bot.sleep(bed);
        console.log('Sleeping peacefully in base bed!');
        bot.chat('gamma: In bed skipping night with team!');
        await sleep(5000);
      } catch (e) {
        console.log('Sleep note:', e.message);
      }
    }
    break;
  }
  
  // Check if portal lit
  const portalBlock = bot.blockAt(new Vec3(299, 73, -54));
  if (portalBlock && portalBlock.name === 'nether_portal') {
    console.log('PORTAL IS LIT!');
    bot.chat('gamma: Nether portal is LIT at (299, 73, -54)!');
    break;
  }
  
  await sleep(3000);
}

for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity) {
    console.log(`Player ${name} at ${lib.fmt(p.entity.position)}, held: ${p.entity.heldItem ? p.entity.heldItem.name : 'empty'}`);
  }
}

return {
  time: bot.time.timeOfDay,
  canSleep: lib.time().canSleep,
  portal: bot.blockAt(new Vec3(299, 73, -54))?.name,
  hp: bot.health,
  food: bot.food
};
