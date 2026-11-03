// programs/531-locate-ores-and-piglins.js
globalThis.isProgramCancelled = isCancelled;

console.log('=== PROGRAM 531: LOCATE ORES & PIGLINS ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// 1. Equip shield in offhand and hold gold_ingot in hand
try {
  const shield = bot.inventory.items().find(i => i.name === 'shield');
  if (shield && bot.inventory.slots[45]?.name !== 'shield') {
    await bot.equip(shield, 'off-hand');
  }
} catch (e) {}

try {
  await bot.equip(mcData.itemsByName.gold_ingot.id, 'hand');
  console.log('Holding gold_ingot in hand to attract Piglins!');
} catch (e) {}

// 2. Scan for nether_gold_ore blocks within 32m
const ores = bot.findBlocks({
  matching: b => b && (b.name === 'nether_gold_ore' || b.name === 'gold_block'),
  maxDistance: 32,
  count: 25
});
console.log(`Found ${ores.length} nether_gold_ore blocks within 32m:`);
for (const op of ores) {
  const d = bot.entity.position.distanceTo(op).toFixed(1);
  console.log(`  Ore at ${lib.fmt(op)} (dist: ${d}m)`);
}

// 3. Scan for Piglins within 48m
const piglins = Object.values(bot.entities).filter(e => e.name === 'piglin' && e.isValid);
console.log(`Piglins found (${piglins.length}):`);
for (const p of piglins) {
  const d = bot.entity.position.distanceTo(p.position).toFixed(1);
  console.log(`  Piglin at ${lib.fmt(p.position)} (dist: ${d}m)`);
}

// 4. Scan for Endermen within 64m
const endermen = Object.values(bot.entities).filter(e => e.name === 'enderman' && e.isValid);
console.log(`Endermen found (${endermen.length}):`);
for (const em of endermen) {
  const d = bot.entity.position.distanceTo(em.position).toFixed(1);
  console.log(`  Enderman at ${lib.fmt(em.position)} (dist: ${d}m)`);
}

// 5. Walk safely along the covered tunnel from (45, 65, -126) to (44, 65, -145)
console.log('Advancing along covered tunnel to (44, 65, -145)...');
try {
  await lib.goTo(44, 65, -135, 1.5, { dig: false, timeoutMs: 6000 });
} catch (e) {
  console.log('goTo -135 note:', e.message);
}

try {
  await lib.goTo(44, 65, -145, 1.5, { dig: false, timeoutMs: 6000 });
} catch (e) {
  console.log('goTo -145 note:', e.message);
}

console.log('Position after tunnel advance:', lib.fmt(bot.entity.position));

// 6. Re-scan Piglins and Endermen near (44, 65, -145)
const nearbyPiglins = Object.values(bot.entities).filter(e =>
  e.name === 'piglin' && e.isValid && bot.entity.position.distanceTo(e.position) <= 24
);
console.log(`Piglins near tunnel (${nearbyPiglins.length}):`);
for (const p of nearbyPiglins) {
  const d = bot.entity.position.distanceTo(p.position).toFixed(1);
  console.log(`  Piglin at ${lib.fmt(p.position)} (dist: ${d}m)`);
}

// 7. If Piglin is within 8m, toss gold ingot to barter!
const closePiglin = nearbyPiglins.find(p => bot.entity.position.distanceTo(p.position) <= 8.0);
if (closePiglin) {
  console.log(`Tossing gold ingot to Piglin at ${lib.fmt(closePiglin.position)}!`);
  bot.chat('gamma: Neutral Piglin right here in covered tunnel! Tossing gold ingot for bartering!');
  try {
    await bot.lookAt(closePiglin.position.offset(0, 1.0, 0), true);
    await bot.equip(mcData.itemsByName.gold_ingot.id, 'hand');
    bot.tossStack(bot.heldItem);
    console.log('Tossed! Waiting 8s for barter inspection...');
    await sleep(8000);
    const picked = await lib.pickup(5.0);
    console.log(`Picked up ${picked} barter items! Inventory:`, lib.inv());
  } catch (e) {
    console.log('Barter execution note:', e.message);
  }
}

return {
  hp: bot.health,
  food: bot.food,
  pos: bot.entity.position,
  oresCount: ores.length,
  piglinsCount: piglins.length,
  nearbyPiglinsCount: nearbyPiglins.length,
  pearls: lib.count('ender_pearl'),
  ingots: lib.count('gold_ingot'),
  inv: lib.inv()
};
