// programs/752-chat-and-scout-gold.js
// Announce Milestone 8 victory to teammates & scout Nether Gold Ore for Milestone 9
console.log('=== Program 752: Announce Victory & Scout Gold ===');
console.log('Beta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health);

// Announce to team in chat
bot.chat('Beta: 8 BLAZE RODS SAFELY DEPOSITED IN BASE CHEST! MILESTONE 8 IS 100% COMPLETE!');
bot.chat('Beta: Starting Milestone 9: Gathering gold for golden boots & Piglin bartering / Enderman pearl hunting!');

// Verify base chest rods
const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
if (chestBlock && chestBlock.name.includes('chest')) {
  const chest = await bot.openChest(chestBlock);
  const rods = chest.containerItems().find(i => i.name === 'blaze_rod')?.count || 0;
  console.log('Verified base chest Blaze Rods:', rods);
  await chest.close();
}

// Step into Nether Portal at (299.5, 73.0, -54.0)
console.log('Stepping into Nether Portal to scout nether gold ore...');
try {
  await bot.pathfinder.goto(new goals.GoalNear(299.5, 73.0, -54.0, 0.8));
} catch (e) {}

const portalBlock = new Vec3(299.5, 73.0, -54.0);
if (bot.entity.position.distanceTo(portalBlock) > 0.8) {
  await bot.lookAt(portalBlock.offset(0, 0.5, 0), true);
  bot.setControlState('forward', true);
  if (bot.entity.position.y < 72.8) bot.setControlState('jump', true);
  await sleep(800);
  bot.setControlState('jump', false);
  bot.setControlState('forward', false);
}

const warpStart = Date.now();
while (bot.game.dimension !== 'the_nether' && Date.now() - warpStart < 25000 && !isCancelled()) {
  const cur = bot.entity.position;
  if (Math.abs(cur.x - 299.5) > 0.6 || Math.abs(cur.z - (-54.0)) > 0.6 || cur.y < 72.8) {
    await bot.lookAt(portalBlock, true);
    bot.setControlState('forward', true);
    if (cur.y < 72.8) bot.setControlState('jump', true);
    await sleep(300);
    bot.setControlState('jump', false);
    bot.setControlState('forward', false);
  }
  await sleep(300);
}

if (bot.game.dimension === 'the_nether') {
  console.log('In Nether! Pos:', lib.fmt(bot.entity.position));
  
  // Step out of portal bunker to (46, 65, -7)
  try {
    await bot.pathfinder.goto(new goals.GoalNear(46, 65, -7, 1.5));
  } catch (e) {}

  // Scan for nether_gold_ore within 24 blocks
  const goldOres = bot.findBlocks({
    matching: b => b && (b.name === 'nether_gold_ore' || b.name === 'gilded_blackstone'),
    maxDistance: 24,
    count: 30
  });

  console.log(`Found ${goldOres.length} nether gold ore blocks within 24m of Nether base camp:`);
  for (const gp of goldOres.slice(0, 10)) {
    const d = bot.entity.position.distanceTo(gp).toFixed(1);
    console.log(` - Nether gold ore at ${lib.fmt(gp)}, dist: ${d}m`);
  }
}

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health
};
