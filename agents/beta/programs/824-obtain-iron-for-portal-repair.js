// programs/824-obtain-iron-for-portal-repair.js
globalThis.isProgramCancelled = isCancelled;
console.log('=== Program 824: Obtain Iron to Repair Portal ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

bot.clearControlStates();
bot.pathfinder.stop();

// Ensure golden boots stay on feet
if (bot.inventory.slots[8]?.name !== 'golden_boots') {
  const gb = bot.inventory.items().find(i => i.name === 'golden_boots');
  if (gb) { try { await bot.equip(gb, 'feet'); } catch (e) {} }
}

bot.chat('Beta: Sourcing 4 iron ingots to craft bucket and flint & steel to fix the Nether portal!');

// Step 1: Obtain 4 iron ingots using lib.obtain
try {
  console.log('Running lib.obtain for iron_ingot...');
  const res = await lib.obtain('iron_ingot', 4);
  console.log('lib.obtain iron result:', JSON.stringify(res));
  bot.chat(`Beta: Successfully obtained ${lib.count('iron_ingot')} iron ingots!`);
} catch (e) {
  console.log('lib.obtain iron error:', e.message);
}

console.log(`Iron ingots in inventory: ${lib.count('iron_ingot')}`);

// Step 2: Craft bucket if we have 3 iron ingots
if (lib.count('iron_ingot') >= 3 && lib.count('bucket') === 0 && lib.count('water_bucket') === 0 && lib.count('lava_bucket') === 0) {
  console.log('Crafting bucket at Crafting Table...');
  try {
    await lib.craft('bucket', 1);
    console.log('Bucket crafted successfully!');
    bot.chat('Beta: Crafted bucket for lava casting!');
  } catch (e) {
    console.log('Craft bucket error:', e.message);
  }
}

// Step 3: Check for flint to craft flint_and_steel
if (lib.count('flint') === 0 && lib.count('flint_and_steel') === 0) {
  // Check Base Chest
  const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
  if (chestBlock) {
    try {
      const chest = await bot.openChest(chestBlock);
      const flint = chest.items().find(i => i.name === 'flint');
      if (flint) await chest.withdraw(flint.type, null, 1);
      const fas = chest.items().find(i => i.name === 'flint_and_steel');
      if (fas) await chest.withdraw(fas.type, null, 1);
      await chest.close();
    } catch (e) {}
  }
}

// Craft flint_and_steel if we have iron + flint
if (lib.count('flint_and_steel') === 0 && lib.count('iron_ingot') >= 1 && lib.count('flint') >= 1) {
  console.log('Crafting flint_and_steel...');
  try {
    await lib.craft('flint_and_steel', 1);
    console.log('Flint and steel crafted!');
    bot.chat('Beta: Crafted flint_and_steel ready to reignite the portal!');
  } catch (e) {
    console.log('Craft flint_and_steel error:', e.message);
  }
}

console.log('=== Program 824 Summary ===');
console.log('Iron ingots:', lib.count('iron_ingot'));
console.log('Bucket:', lib.count('bucket') + lib.count('water_bucket') + lib.count('lava_bucket'));
console.log('Flint & Steel:', lib.count('flint_and_steel'));
console.log('Inventory:', lib.inv());

return {
  iron_ingots: lib.count('iron_ingot'),
  bucket: lib.count('bucket'),
  flint_and_steel: lib.count('flint_and_steel'),
  hp: bot.health,
  food: bot.food
};
