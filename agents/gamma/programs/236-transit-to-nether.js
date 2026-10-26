// programs/236-transit-to-nether.js
console.log('=== TRANSIT TO THE NETHER ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension);

// 1. Craft planks from log
if (lib.count('birch_log') > 0) {
  console.log('Crafting planks from birch_log...');
  try { await lib.craft('birch_planks', 4); } catch (e) {}
}
console.log('Inv before transit:', JSON.stringify(lib.inv()));

// 2. Walk to portal entrance
console.log('Approaching Nether portal at (298, 72, -54)...');
await lib.goTo(298, 72, -54, 1, { timeoutMs: 15000 });

// 3. Step up onto sill and stand inside portal block at (299.5, 73.0, -53.5)
console.log('Stepping into purple portal blocks...');
bot.setControlState('jump', true);
await lib.walkTo(299.5, -53.5, 4000);
bot.clearControlStates();

// Wait for dimension change
console.log('Waiting for dimension change to the_nether (up to 20s)...');
const startDim = bot.game.dimension;
const startWait = Date.now();
while (!isCancelled() && bot.game.dimension === startDim && (Date.now() - startWait < 20000)) {
  bot.setControlState('forward', true);
  await sleep(500);
  bot.clearControlStates();
  await sleep(500);
}

console.log('Dimension now:', bot.game.dimension);
console.log('Pos now:', lib.fmt(bot.entity.position));

if (bot.game.dimension === 'minecraft:the_nether') {
  // Step out of portal hitbox to clear cooldown
  console.log('Clearing portal cooldown: walking to bunker floor (40.5, 65.0, -5.0)...');
  await lib.walkTo(40.5, -5.0, 3000);
  bot.clearControlStates();

  console.log('In Nether bunker! Pos:', lib.fmt(bot.entity.position));
  console.log('Health:', bot.health, 'Food:', bot.food);
  console.log('Cobblestone in inv:', lib.count('cobblestone'));
  
  // Teammates status
  for (const p of Object.values(bot.players)) {
    if (p.username !== bot.username) {
      const ent = p.entity;
      console.log(`Teammate ${p.username}: ${ent ? `${lib.fmt(ent.position)} (dist: ${bot.entity.position.distanceTo(ent.position).toFixed(1)}m)` : 'other dim/far'}`);
    }
  }

  bot.chat(`gamma in Nether at (40, 65, -5)! Carrying 38 cobble & stone gear. Advancing to Blaze Spawner front!`);
} else {
  console.log('Failed to transit into the Nether!');
}
