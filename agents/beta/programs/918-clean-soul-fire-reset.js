console.log('=== Program 918: Clean Soul Fire Reset & Full Return ===');
globalThis.isProgramCancelled = isCancelled;
const checkCancelled = () => (typeof globalThis.isProgramCancelled === 'function' ? globalThis.isProgramCancelled() : false);

console.log('Beta start pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);

// 1. Find nearest soul_fire block
const fires = bot.findBlocks({
  matching: b => b && (b.name === 'soul_fire' || b.name === 'fire'),
  maxDistance: 24,
  count: 5
});

if (fires.length > 0) {
  const f = fires[0];
  console.log(`Walking into fire at ${lib.fmt(f)} to trigger full 20/20 reset...`);
  bot.chat('Beta: Resetting to full 20/20 HP & Food via clean respawn, then re-entering Nether portal!');
  
  await bot.lookAt(f, true);
  bot.setControlState('forward', true);
  await sleep(1500);
  
  // Wait until dead / respawned in overworld
  const deathStart = Date.now();
  while (bot.game.dimension === 'the_nether' && bot.health > 0 && Date.now() - deathStart < 15000 && !checkCancelled()) {
    await sleep(250);
  }
  bot.clearControlStates();
}

// 2. Wait for respawn in Overworld
console.log('Waiting for respawn in Overworld...');
const respawnStart = Date.now();
while (bot.game.dimension !== 'overworld' && Date.now() - respawnStart < 15000 && !checkCancelled()) {
  await sleep(300);
}

console.log('Respawned! Dim:', bot.game.dimension, 'Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);

// 3. If in Overworld, equip golden boots and enter Nether portal
if (bot.game.dimension === 'overworld') {
  // Re-equip armor and ensure golden boots on slot 8
  try {
    await lib.equipArmor();
  } catch (e) {}

  const gb = bot.inventory.items().find(i => i.name === 'golden_boots');
  if (gb) {
    await bot.equip(gb, 'feet');
    console.log('Golden boots locked on feet!');
  }

  try {
    await lib.equipWeapon();
  } catch (e) {}

  console.log('Entering Nether Portal at (299.5, 73.0, -54.0)...');
  const res = await enterNetherPortal(25000);
  console.log('Nether portal enter result:', JSON.stringify(res));

  if (bot.game.dimension === 'the_nether') {
    bot.chat('Beta: Re-entered Nether at full 20/20 HP & 20/20 Food! Marching to Fortress Workshop Bunker!');
  }
}

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  inv: lib.inv()
};
