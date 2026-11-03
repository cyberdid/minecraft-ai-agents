// programs/748-obtain-bucket-and-flint-and-steel.js
console.log('=== Program 748: Obtain Bucket & Flint and Steel ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

globalThis.isProgramCancelled = isCancelled;
const checkCancelled = () => (typeof globalThis.isProgramCancelled === 'function' ? globalThis.isProgramCancelled() : false);

// 1. Maintain offhand shield
try {
  const shield = bot.inventory.items().find(i => i.name === 'shield');
  if (shield && bot.inventory.slots[45]?.name !== 'shield') {
    await bot.equip(shield, 'off-hand');
  }
} catch (e) {}

bot.chat('alpha: Sourcing bucket and flint & steel via lib.obtain to repair and reignite Nether portal!');

// 2. Obtain bucket
if (lib.count('bucket') === 0 && lib.count('water_bucket') === 0 && lib.count('lava_bucket') === 0) {
  console.log('Obtaining bucket (needs 3 iron ingots)...');
  try {
    const res = await lib.obtain('bucket', 1);
    console.log('Obtain bucket result:', JSON.stringify(res));
    bot.chat('alpha: Bucket successfully obtained!');
  } catch (err) {
    console.log('Obtain bucket note:', err.message);
  }
}

// 3. Obtain flint_and_steel (Alpha already holds 1 flint!)
if (lib.count('flint_and_steel') === 0) {
  console.log('Obtaining flint_and_steel (Alpha holds flint x1)...');
  try {
    const res = await lib.obtain('flint_and_steel', 1);
    console.log('Obtain flint_and_steel result:', JSON.stringify(res));
    bot.chat('alpha: Flint and steel successfully obtained!');
  } catch (err) {
    console.log('Obtain flint_and_steel note:', err.message);
  }
}

console.log('Final tools inventory:', {
  bucket: lib.count('bucket'),
  water_bucket: lib.count('water_bucket'),
  lava_bucket: lib.count('lava_bucket'),
  flint_and_steel: lib.count('flint_and_steel'),
  iron_ingot: lib.count('iron_ingot'),
  inv: lib.inv()
});

bot.chat(`alpha: Portal repair tools: Bucket=${lib.count('bucket') + lib.count('water_bucket') + lib.count('lava_bucket')}, Flint&Steel=${lib.count('flint_and_steel')}, HP=${bot.health.toFixed(1)}/20`);

return {
  bucket: lib.count('bucket') + lib.count('water_bucket') + lib.count('lava_bucket'),
  flintAndSteel: lib.count('flint_and_steel'),
  inv: lib.inv()
};
