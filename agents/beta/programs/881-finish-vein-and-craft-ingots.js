// programs/881-finish-vein-and-craft-ingots.js
console.log('=== Program 881: Finish Mining Mountain Gold Vein & Craft Ingots ===');
globalThis.isProgramCancelled = isCancelled;

const checkCancelled = () => (typeof isCancelled === 'function' ? isCancelled() : false);

bot.clearControlStates();
bot.pathfinder.stop();

console.log('Beta pos:', lib.fmt(bot.entity.position), 'gold_nuggets:', lib.count('gold_nugget'));

// 1. Equip iron pickaxe
const pick = bot.inventory.items().find(i => i.name === 'iron_pickaxe') || bot.inventory.items().find(i => i.name.endsWith('_pickaxe'));
if (pick) await bot.equip(pick, 'hand');

// 2. Scan and mine remaining gold ores within 6m
const ores = bot.findBlocks({
  matching: b => b && (b.name === 'nether_gold_ore' || b.name === 'gilded_blackstone'),
  maxDistance: 6.0,
  count: 10
});

console.log(`Found ${ores.length} gold ores within 6m:`);
let mined = 0;
for (const op of ores) {
  if (checkCancelled()) break;
  const b = bot.blockAt(op);
  if (b && b.name.includes('gold')) {
    console.log(`Mining ${b.name} at ${lib.fmt(op)}...`);
    try {
      if (pick) await bot.equip(pick, 'hand');
      await bot.dig(b, true);
      mined++;
      await sleep(150);
    } catch (e) {
      console.log(`Dig error at ${lib.fmt(op)}: ${e.message}`);
    }
  }
}

// 3. Vacuum all dropped nuggets
await lib.pickup(5.0);
console.log(`Mined ${mined} ores. Total nuggets now: ${lib.count('gold_nugget')}`);
bot.chat(`Beta: Mined ${mined} more gold ores! Total nuggets: ${lib.count('gold_nugget')}`);

// 4. Descend staircase back to walkway
console.log('Descending staircase back to walkway (46, 65, -114)...');
const descWps = [
  new Vec3(40, 73, -114),
  new Vec3(42, 70, -114),
  new Vec3(44, 67, -114),
  new Vec3(46, 65, -114)
];

for (const wp of descWps) {
  if (checkCancelled()) break;
  try {
    await lib.goTo(wp.x, wp.y, wp.z, 1.5, { dig: false, timeoutMs: 5000 });
  } catch (e) {
    try { await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 1.5)); } catch (e2) {}
  }
}

// 5. Walk to Crafting Table at (44, 65, -134)
console.log('Walking to team Crafting Table at (44, 65, -134)...');
try {
  await lib.goTo(44, 65, -134, 1.2, { timeoutMs: 6000, dig: false });
} catch (e) {
  try { await bot.pathfinder.goto(new goals.GoalNear(44, 65, -134, 1.2)); } catch (e2) {}
}

console.log(`At crafting table: ${lib.fmt(bot.entity.position)}`);

// 6. Craft gold ingots from nuggets
const nuggets = lib.count('gold_nugget');
if (nuggets >= 9) {
  const ingotsToCraft = Math.floor(nuggets / 9);
  console.log(`Crafting ${ingotsToCraft} gold ingots at Crafting Table...`);
  try {
    await lib.craft('gold_ingot', ingotsToCraft);
    console.log(`Total gold ingots now: ${lib.count('gold_ingot')}`);
    bot.chat(`Beta: Crafted ${ingotsToCraft} gold ingots! Total ingots ready: ${lib.count('gold_ingot')}`);
  } catch (e) {
    console.log('Craft gold_ingot notice:', e.message);
  }
}

// Ensure golden_boots are worn
if (bot.inventory.slots[8]?.name !== 'golden_boots') {
  const gb = bot.inventory.items().find(i => i.name === 'golden_boots');
  if (gb) await bot.equip(gb, 'feet');
}

return {
  pos: bot.entity.position,
  mined: mined,
  gold_nuggets: lib.count('gold_nugget'),
  gold_ingots: lib.count('gold_ingot')
};
