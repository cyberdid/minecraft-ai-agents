// programs/732-mine-full-gold-vein-and-craft-boots.js
console.log('=== Program 732: Dig Forward into Gold Vein, Mine All Ores & Craft Boots ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

globalThis.isProgramCancelled = isCancelled;
const checkCancelled = () => (typeof globalThis.isProgramCancelled === 'function' ? globalThis.isProgramCancelled() : false);

// 1. Equip iron_pickaxe
const pick = bot.inventory.items().find(i => i.name === 'iron_pickaxe') ||
             bot.inventory.items().find(i => i.name.includes('pickaxe'));
if (pick) await bot.equip(pick, 'hand');

// 2. Clear 2-high pathway forward from x=37 to x=35 at y=71..73, z=-134
console.log('Digging 2-high tunnel forward into vein...');
for (let targetX = 37; targetX >= 35 && !checkCancelled(); targetX--) {
  for (let dy = 0; dy <= 2; dy++) {
    const b = bot.blockAt(new Vec3(targetX, 71 + dy, -134));
    if (b && b.name !== 'air' && b.name !== 'nether_gold_ore' && b.boundingBox === 'block') {
      try {
        if (pick) await bot.equip(pick, 'hand');
        await bot.dig(b);
      } catch (e) {}
    }
  }
}

// 3. Step forward to (35.5, 71.0, -134.5)
console.log('Stepping forward to (35.5, 71.0, -134.5)...');
try {
  await bot.lookAt(new Vec3(35.5, 71.0, -134.5), true);
  bot.setControlState('forward', true);
  if (bot.entity.position.y < 71) bot.setControlState('jump', true);
  await sleep(600);
  bot.setControlState('jump', false);
  bot.setControlState('forward', false);
} catch (e) {}

console.log('Pos inside vein pocket:', lib.fmt(bot.entity.position));

// 4. Find all nether_gold_ore blocks within 6m
const ores = bot.findBlocks({
  matching: b => b && (b.name === 'nether_gold_ore' || b.name === 'gold_block'),
  maxDistance: 6,
  count: 15
});

console.log(`Found ${ores.length} gold ores within 6m of pocket:`);
for (const p of ores) {
  const d = bot.entity.position.distanceTo(p).toFixed(1);
  console.log(` - gold ore at ${lib.fmt(p)} (dist: ${d}m)`);
}

// 5. Mine all gold ores with iron pickaxe
let minedCount = 0;
for (const p of ores) {
  if (checkCancelled()) break;
  console.log(`Mining gold ore at ${lib.fmt(p)}...`);
  try {
    const b = bot.blockAt(p);
    if (b && b.name === 'nether_gold_ore') {
      if (pick) await bot.equip(pick, 'hand');
      await bot.dig(b);
      minedCount++;
      await sleep(200);
      await lib.pickup(4.0);
    }
  } catch (err) {
    console.log(`Mine error at ${lib.fmt(p)}:`, err.message);
  }
}

// 6. Vacuum all drops thoroughly
await sleep(400);
await lib.pickup(6.0);

console.log(`Mined ${minedCount} gold ores! Inventory:`, lib.inv());
const nuggets = lib.count('gold_nugget');
console.log(`Total gold nuggets: ${nuggets}`);

// 7. Craft gold ingots from nuggets
if (nuggets >= 9) {
  try {
    const toCraft = Math.floor(nuggets / 9);
    await lib.craft('gold_ingot', toCraft);
    console.log(`Crafted ${toCraft} gold ingots! Total ingots: ${lib.count('gold_ingot')}`);
    bot.chat(`alpha: Crafted ${toCraft} gold ingots! Total ingots: ${lib.count('gold_ingot')}`);
  } catch (e) {
    console.log('Craft ingots note:', e.message);
  }
}

// 8. Craft golden_boots if 4+ ingots and equip in slot 8
const ingots = lib.count('gold_ingot');
if (ingots >= 4 && bot.inventory.slots[8]?.name !== 'golden_boots') {
  try {
    await lib.craft('golden_boots', 1);
    const gb = bot.inventory.items().find(i => i.name === 'golden_boots');
    if (gb) await bot.equip(gb, 'feet');
    bot.chat('alpha: [SUIT UP] golden_boots crafted and equipped! 100% Piglin neutrality ACTIVE!');
    console.log('*** golden_boots EQUIPPED on feet! ***');
  } catch (e) {
    console.log('Craft boots note:', e.message);
  }
}

bot.chat(`alpha: Vein mining complete! Ingots: ${lib.count('gold_ingot')}, Nuggets: ${lib.count('gold_nugget')}, Boots: ${bot.inventory.slots[8]?.name || 'none'}, HP: ${bot.health.toFixed(1)}/20`);

return {
  pos: bot.entity.position,
  dim: bot.game.dimension,
  hp: bot.health,
  food: bot.food,
  minedCount,
  goldIngots: lib.count('gold_ingot'),
  goldNuggets: lib.count('gold_nugget'),
  boots: bot.inventory.slots[8]?.name,
  inv: lib.inv()
};
