// programs/730-bunker-gold-mine-and-pearl-harvest.js
console.log('=== Program 730: Bunker Gold Mining & Pearl Harvesting ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

globalThis.isProgramCancelled = isCancelled;
const checkCancelled = () => (typeof globalThis.isProgramCancelled === 'function' ? globalThis.isProgramCancelled() : false);

// 1. Maintain active shield in offhand and iron sword/pickaxe
try {
  const shield = bot.inventory.items().find(i => i.name === 'shield');
  if (shield && bot.inventory.slots[45]?.name !== 'shield') {
    await bot.equip(shield, 'off-hand');
  }
} catch (e) {}

try {
  const pick = bot.inventory.items().find(i => i.name === 'iron_pickaxe');
  if (pick) await bot.equip(pick, 'hand');
} catch (e) {}

// 2. Vacuum any items on bunker floor
await lib.pickup(5.0);

// 3. Scan nearby players (Beta, Gamma, Delta)
for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity) {
    const d = bot.entity.position.distanceTo(p.entity.position).toFixed(1);
    console.log(`Player ${name} at ${lib.fmt(p.entity.position)} (${d}m), held: ${p.entity.heldItem?.name}`);
  }
}

// 4. Scan nearby nether_gold_ore blocks
const goldOres = bot.findBlocks({
  matching: b => b && (b.name === 'nether_gold_ore' || b.name === 'gold_block'),
  maxDistance: 20,
  count: 15
});

console.log(`Found ${goldOres.length} gold ores within 20m:`);
for (const p of goldOres) {
  const d = bot.entity.position.distanceTo(p).toFixed(1);
  console.log(` - ore at ${lib.fmt(p)} (dist: ${d}m)`);
}

// 5. Mine any safe gold ores within 5.5m reach without falling
const reachableOres = goldOres.filter(p => bot.entity.position.distanceTo(p) <= 5.5 && p.y >= 63);
console.log(`Reachable gold ores: ${reachableOres.length}`);
for (const p of reachableOres) {
  if (checkCancelled()) break;
  console.log(`Mining gold ore at ${lib.fmt(p)}...`);
  try {
    const pick = bot.inventory.items().find(i => i.name === 'iron_pickaxe');
    if (pick) await bot.equip(pick, 'hand');
    await lib.dig(p.x, p.y, p.z);
    await sleep(200);
    await lib.pickup(4.0);
  } catch (err) {
    console.log(`Mine error at ${lib.fmt(p)}:`, err.message);
  }
}

// 6. Craft gold ingots from nuggets
const nuggets = lib.count('gold_nugget');
console.log(`Gold nuggets: ${nuggets}`);
if (nuggets >= 9) {
  try {
    const toCraft = Math.floor(nuggets / 9);
    await lib.craft('gold_ingot', toCraft);
    console.log(`Crafted ${toCraft} gold ingots! Total ingots: ${lib.count('gold_ingot')}`);
    bot.chat(`alpha: Crafted ${toCraft} gold ingots from mined ore! Total ingots: ${lib.count('gold_ingot')}`);
  } catch (e) {
    console.log('Craft ingots note:', e.message);
  }
}

// 7. Check for neutral Piglins within 16m for bartering
const piglins = Object.values(bot.entities).filter(e =>
  e.name === 'piglin' && e.isValid && bot.entity.position.distanceTo(e.position) <= 16
);
console.log(`Nearby Piglins: ${piglins.length}`);

// If we have gold ingots and a Piglin is nearby, toss gold ingot to barter!
const ingots = lib.count('gold_ingot');
if (ingots > 0 && piglins.length > 0) {
  const piglin = piglins[0];
  console.log(`Bartering with Piglin at ${lib.fmt(piglin.position)}...`);
  try {
    await bot.lookAt(piglin.position.offset(0, 1.0, 0), true);
    const goldItem = bot.inventory.items().find(i => i.name === 'gold_ingot');
    if (goldItem) {
      await bot.toss(goldItem.type, null, 1);
      bot.chat(`alpha: Tossed gold_ingot to Piglin at ${lib.fmt(piglin.position)} for bartering!`);
      // Wait for barter animation (6 seconds)
      await sleep(6500);
      await lib.pickup(6.0);
    }
  } catch (e) {
    console.log('Barter error:', e.message);
  }
}

// 8. Check for Endermen within 16m
const endermen = Object.values(bot.entities).filter(e =>
  e.name === 'enderman' && e.isValid && bot.entity.position.distanceTo(e.position) <= 16
);
console.log(`Nearby Endermen: ${endermen.length}`);
for (const em of endermen) {
  console.log(` - Enderman at ${lib.fmt(em.position)} (${bot.entity.position.distanceTo(em.position).toFixed(1)}m)`);
}

// 9. Report status
const pearls = lib.count('ender_pearl');
bot.chat(`alpha: Bunker operations update: Gold ingots: ${lib.count('gold_ingot')}, Pearls: ${pearls}/12, HP: ${bot.health.toFixed(1)}/20, Food: ${bot.food}/20`);

return {
  pos: bot.entity.position,
  dim: bot.game.dimension,
  hp: bot.health,
  food: bot.food,
  goldIngots: lib.count('gold_ingot'),
  goldNuggets: lib.count('gold_nugget'),
  pearls,
  inv: lib.inv()
};
