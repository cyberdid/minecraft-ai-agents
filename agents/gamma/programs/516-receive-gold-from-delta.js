// programs/516-receive-gold-from-delta.js
console.log('=== GAMMA: RECEIVE GOLD FROM DELTA AT FORTRESS BUNKER ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);

bot.chat('delta: Gamma is inside Fortress Bunker (44, 65, -127) with golden_boots equipped! Ready to receive your 2 gold ingots for bartering!');

const startWait = Date.now();
let deltaMet = false;

// Stand securely inside bunker doorway facing south towards (50, 65, -115)
await bot.lookAt(new Vec3(44.5, 65.5, -125.0));

while (Date.now() - startWait < 30000 && !isCancelled()) {
  const delta = Object.values(bot.entities).find(e =>
    e.type === 'player' && e.username === 'delta' && bot.entity.position.distanceTo(e.position) <= 8
  );

  if (delta) {
    deltaMet = true;
    console.log(`Delta arrived at bunker! Pos: ${lib.fmt(delta.position)}`);
    bot.chat('gamma: Delta arrived! Tossing or dropping gold ingots now!');
    await sleep(2500);
    break;
  }

  // Vacuum any drops
  const picked = await lib.pickup(4.0);
  if (picked > 0) {
    console.log(`Picked up ${picked} items!`);
  }

  await sleep(1000);
}

// Final pickup
await lib.pickup(5.0);

// Check if any nuggets can be crafted into ingots at the bunker crafting table
if (lib.count('gold_nugget') >= 9) {
  try {
    await lib.craft('gold_ingot', Math.floor(lib.count('gold_nugget') / 9));
    console.log(`Crafted ingots! Total gold_ingot: ${lib.count('gold_ingot')}`);
  } catch (e) {}
}

const currentIngots = lib.count('gold_ingot');
const currentPearls = lib.count('ender_pearl');

bot.chat(`gamma: Holding ${currentIngots} gold ingots for bartering! Pearls: ${currentPearls}/12. Ready to advance to Piglins at (18, 57, -176)!`);

return {
  deltaMet,
  ingots: currentIngots,
  pearls: currentPearls,
  hp: bot.health,
  food: bot.food,
  pos: bot.entity.position,
  inv: lib.inv()
};
