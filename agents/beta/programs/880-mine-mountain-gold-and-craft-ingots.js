// programs/880-mine-mountain-gold-and-craft-ingots.js
console.log('=== Program 880: Mine Mountain Gold Vein & Craft Ingots ===');
globalThis.isProgramCancelled = isCancelled;

const checkCancelled = () => (typeof isCancelled === 'function' ? isCancelled() : false);

bot.clearControlStates();
bot.pathfinder.stop();

// Ensure golden boots on feet
if (bot.inventory.slots[8]?.name !== 'golden_boots') {
  const gb = bot.inventory.items().find(i => i.name === 'golden_boots');
  if (gb) await bot.equip(gb, 'feet');
}

// Equip iron pickaxe
const pick = bot.inventory.items().find(i => i.name === 'iron_pickaxe') || bot.inventory.items().find(i => i.name.endsWith('_pickaxe'));
if (pick) await bot.equip(pick, 'hand');

// 1. Walk along walkway to base of mountain stairs at (46, 65, -114)
console.log('Walking to base of mountain stairs (46, 65, -114)...');
try {
  await lib.goTo(46, 65, -114, 1.5, { timeoutMs: 6000, dig: false });
} catch (e) {
  try { await bot.pathfinder.goto(new goals.GoalNear(46, 65, -114, 1.5)); } catch (e2) {}
}

console.log(`At base of stairs: ${lib.fmt(bot.entity.position)}`);

// 2. Climb staircase to gold vein at (39, 75, -114)
const stairWps = [
  new Vec3(44, 67, -114),
  new Vec3(42, 70, -114),
  new Vec3(40, 73, -114),
  new Vec3(39, 75, -114)
];

for (let i = 0; i < stairWps.length; i++) {
  if (checkCancelled()) break;
  const wp = stairWps[i];
  console.log(`Climbing to stair WP ${i + 1}/${stairWps.length}: ${lib.fmt(wp)}...`);
  try {
    await lib.goTo(wp.x, wp.y, wp.z, 1.5, { dig: true, timeoutMs: 8000 });
  } catch (e) {
    console.log(`Stair WP note: ${e.message}`);
    try { await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 1.5)); } catch (e2) {}
  }
}

console.log(`At gold vein elevation! Pos: ${lib.fmt(bot.entity.position)}`);

// 3. Scan and mine all gold ores within 8m
const goldOres = bot.findBlocks({
  matching: b => b && (b.name === 'nether_gold_ore' || b.name === 'gilded_blackstone' || b.name === 'gold_block'),
  maxDistance: 8.0,
  count: 20
});

console.log(`Found ${goldOres.length} gold ores within 8m:`);
let mined = 0;
for (const op of goldOres) {
  if (checkCancelled()) break;
  const b = bot.blockAt(op);
  if (b && (b.name.includes('gold') || b.name.includes('gilded'))) {
    console.log(`Mining gold ore at ${lib.fmt(op)} (${b.name})...`);
    try {
      if (pick) await bot.equip(pick, 'hand');
      await lib.goTo(op.x, op.y, op.z, 2.0, { dig: true, timeoutMs: 4000 });
      await bot.dig(b, true);
      mined++;
      await sleep(200);
    } catch (e) {
      console.log(`Mine error at ${lib.fmt(op)}: ${e.message}`);
    }
  }
}

// Vacuum all dropped nuggets
await lib.pickup(6.0);
console.log(`Mined ${mined} ores. Gold nuggets in inventory: ${lib.count('gold_nugget')}`);
bot.chat(`Beta: Mined ${mined} gold ores! Nuggets in inventory: ${lib.count('gold_nugget')}`);

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

// Craft gold ingots from nuggets
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

return {
  pos: bot.entity.position,
  mined_ores: mined,
  gold_nuggets: lib.count('gold_nugget'),
  gold_ingots: lib.count('gold_ingot'),
  ender_pearls: lib.count('ender_pearl')
};
