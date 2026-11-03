// programs/549-tower-into-portal.js
globalThis.isProgramCancelled = isCancelled;

console.log('=== PROGRAM 549: TOWER DIRECTLY INTO NETHER PORTAL ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// Step 1: Ensure holding cobblestone
const cobble = bot.inventory.items().find(i => i.name === 'cobblestone');
if (!cobble) {
  console.log('Error: no cobblestone');
  return { error: 'No cobblestone' };
}
await bot.equip(cobble, 'hand');

// Step 2: Tower straight up at (299.5, -53.5) from y=60 to y=73
console.log(`Towering up from y=${bot.entity.position.y.toFixed(1)} to y=73.0...`);

while (bot.entity.position.y < 72.8 && !isCancelled() && bot.game.dimension === 'overworld') {
  // Clear block above head if obstructed
  const up = bot.blockAt(bot.entity.position.offset(0, 2, 0));
  if (up && up.name !== 'air' && up.name !== 'nether_portal') {
    try {
      const pick = bot.inventory.items().find(i => i.name.includes('pickaxe'));
      if (pick) await bot.equip(pick, 'hand');
      await bot.dig(up);
      await bot.equip(cobble, 'hand');
    } catch (e) {}
  }

  // Jump and place underfoot
  bot.setControlState('jump', true);
  await sleep(350);
  bot.setControlState('jump', false);

  const floorBlock = bot.blockAt(bot.entity.position.offset(0, -1, 0));
  if (floorBlock && floorBlock.boundingBox === 'block') {
    try {
      await bot.placeBlock(floorBlock, new Vec3(0, 1, 0));
    } catch (e) {}
  }
  await sleep(150);
}

bot.clearControlStates();
console.log('Reached height y=73! Pos:', lib.fmt(bot.entity.position));

// Step 3: Stand inside portal frame and wait for Nether warp
bot.chat('gamma: Reached portal frame at (299.5, 73, -53.5)! Awaiting Nether warp...');
const warpStart = Date.now();
while (bot.game.dimension !== 'the_nether' && Date.now() - warpStart < 25000 && !isCancelled()) {
  await sleep(300);
}

if (bot.game.dimension === 'the_nether') {
  console.log('WARP SUCCESS! Inside the_nether at pos:', lib.fmt(bot.entity.position));
  await sleep(500);
  // Step forward into bunker
  await bot.lookAt(new Vec3(46.0, 65.0, -7.0), true);
  bot.setControlState('forward', true);
  await sleep(1000);
  bot.setControlState('forward', false);
  bot.chat(`gamma: Inside the_nether at ${lib.fmt(bot.entity.position)}! HP: ${bot.health}/20.`);
}

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  cobblestone: lib.count('cobblestone'),
  inv: lib.inv()
};
