// programs/695-craft-boots-and-barter.js
console.log('=== Program 695: Craft Ingots & Step to Portal ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// 1. Craft gold ingot from nuggets if we have 9+
if (lib.count('gold_nugget') >= 9) {
  console.log('Crafting gold_ingot from nuggets...');
  try {
    await lib.craft('gold_ingot', 1);
    console.log(`Crafted gold_ingot! Now holding ${lib.count('gold_ingot')} ingots, ${lib.count('gold_nugget')} nuggets.`);
    bot.chat(`alpha: Crafted gold ingot! Total ingots: ${lib.count('gold_ingot')}`);
  } catch (e) {
    console.log('Craft note:', e.message);
  }
}

// 2. Walk to portal at (45, 75, -16)
console.log('Walking east along y=75 to portal at (45, 75, -16)...');
const portalTarget = new Vec3(45.0, 75.0, -16.0);
try {
  await lib.goTo(45, 75, -16, 1.5, { timeoutMs: 10000 });
} catch (e) {
  try {
    await bot.lookAt(portalTarget, true);
    bot.setControlState('forward', true);
    await sleep(1500);
    bot.setControlState('forward', false);
  } catch (e2) {}
}

console.log('Pos after move:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health);

// If warped to Overworld, enter base house
if (bot.game.dimension === 'overworld') {
  console.log('In Overworld Base!');
  try { await lib.goTo(293, 72, -55, 2, { timeoutMs: 8000 }); } catch (e) {}
}

console.log('=== Program 695 Complete ===');
console.log('Status: Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Inv:', lib.inv());
