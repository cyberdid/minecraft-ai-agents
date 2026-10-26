// programs/419-enter-nether-and-reach-base-camp.js
console.log('=== Program 419: Enter Nether Portal & Reach Nether Base Camp ===');
console.log('Alpha start pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension);

// 1. Pass through door outside base
console.log('Exiting base door (294, 72, -54)...');
try {
  await globalThis.passDoorOut();
  console.log('Outside base at:', lib.fmt(bot.entity.position));
} catch (e) {
  try { await lib.goThroughDoor(294, 72, -54); } catch (e2) {}
}

// 2. Walk to Nether portal at (298.5, 72.0, -54.0)
console.log('Walking to Nether portal at (298.5, 72.0, -54.0)...');
try {
  await lib.goTo(298.5, 72.0, -54.0, 0, { timeoutMs: 15000 });
} catch (e) {
  console.log('goTo portal note:', e.message);
  // Direct approach
  await bot.lookAt(new Vec3(298.5, 72.0, -54.0));
  bot.setControlState('forward', true);
  await sleep(1500);
  bot.setControlState('forward', false);
}

console.log('Stepping inside portal block...');
bot.setControlState('forward', false);
bot.setControlState('back', false);
bot.setControlState('left', false);
bot.setControlState('right', false);

// 3. Stand stationary inside portal block for dimension change (80 ticks = 4.0s)
console.log('Waiting inside portal for Nether transit...');
for (let wait = 0; wait < 30; wait++) {
  if (bot.game.dimension === 'the_nether') {
    console.log('*** TRANSIT SUCCESSFUL! ARRIVED IN THE NETHER! ***');
    break;
  }
  await sleep(500);
}

console.log('Current dimension:', bot.game.dimension);
console.log('Alpha at:', lib.fmt(bot.entity.position));

// 4. If in Nether, announce to team and inspect portal bunker
if (bot.game.dimension === 'the_nether') {
  bot.chat(`team: Alpha entered the Nether! Pos=${lib.fmt(bot.entity.position)}, HP=${bot.health}, Food=${bot.food}, Cobble=${lib.count('cobblestone')}. Advancing along East Ridge trail to Fortress Workshop!`);
  
  // Inspect bunker blocks around portal (40, 65, -7)
  const bunkerChests = bot.findBlocks({ matching: mcData.blocksByName.chest?.id, maxDistance: 8, count: 2 });
  console.log(`Chests in Nether bunker: ${bunkerChests.length}`);
  for (const cp of bunkerChests) {
    try {
      const items = await lib.chestContents(cp.x, cp.y, cp.z);
      console.log(`Bunker chest at ${lib.fmt(cp)}:`, JSON.stringify(items));
    } catch (err) {}
  }
} else {
  console.log('Warning: Still in overworld! Position:', lib.fmt(bot.entity.position));
}

console.log('Alpha status:', JSON.stringify(lib.status()));
console.log('Alpha inventory:', JSON.stringify(lib.inv()));
