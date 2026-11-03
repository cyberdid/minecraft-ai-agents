// programs/554-bunker-scout-and-mine-gold.js
globalThis.isProgramCancelled = isCancelled;
console.log('=== DELTA: BUNKER INTERIOR & GOLD ORE SCOUT ===');
console.log(`Starting pos: ${lib.fmt(bot.entity.position)}, HP: ${bot.health}, Food: ${bot.food}`);

// Step inside bunker room (44, 65, -130)
try {
  await bot.pathfinder.goto(new goals.GoalNear(44.0, 65.0, -130.0, 1.0));
} catch (e) {}

console.log(`Inside bunker at: ${lib.fmt(bot.entity.position)}`);

// Scan for nether gold ore within 24m
const goldOres = bot.findBlocks({
  matching: b => b && (b.name === 'nether_gold_ore' || b.name === 'gilded_blackstone'),
  maxDistance: 24,
  count: 20
});

console.log(`Nether gold ores found within 24m: ${goldOres.length}`);
for (const gp of goldOres) {
  console.log(`  Gold ore at ${lib.fmt(gp)} (dist: ${bot.entity.position.distanceTo(gp).toFixed(1)})`);
}

// Scan for Endermen or Piglins nearby
const hostiles = Object.values(bot.entities).filter(e =>
  e !== bot.entity && ['enderman', 'piglin'].includes(e.name) &&
  bot.entity.position.distanceTo(e.position) < 32
).map(e => `${e.name} at ${lib.fmt(e.position)} (dist: ${bot.entity.position.distanceTo(e.position).toFixed(1)})`);

console.log(`Piglins / Endermen nearby: ${hostiles.length}`);
console.log(hostiles.join('\n') || 'None in 32m');

// Check Crafting Table at (44, 65, -134)
const ct = bot.findBlock({ matching: b => b && b.name === 'crafting_table', maxDistance: 10 });
console.log('Crafting table in bunker:', ct ? lib.fmt(ct.position) : 'none');

// If safe gold ore is reachable (<= 4m and y >= 64), mine 1-2 blocks with iron pickaxe
const safeGold = goldOres.find(gp => bot.entity.position.distanceTo(gp) <= 4.5 && gp.y >= 64);
if (safeGold) {
  console.log(`Mining safe nether gold ore at ${lib.fmt(safeGold)} with iron pickaxe...`);
  try {
    await lib.equipTool('iron_pickaxe');
    const gb = bot.blockAt(safeGold);
    if (gb) await bot.dig(gb);
    await sleep(400);
    await lib.pickup(3.5);
    console.log(`Gold mined! Nuggets in inventory: ${lib.count('gold_nugget')}`);
  } catch (e) {
    console.log('Gold mining notice:', e.message);
  }
}

// Check for gold nuggets to craft ingots
if (lib.count('gold_nugget') >= 9) {
  try {
    console.log('Crafting gold_ingot from 9 nuggets...');
    await lib.craft('gold_ingot', Math.floor(lib.count('gold_nugget') / 9));
    console.log(`Gold ingots now: ${lib.count('gold_ingot')}`);
  } catch (e) {}
}

bot.chat(`delta: Stationed inside Fortress Bunker (44, 65, -130). HP: ${bot.health.toFixed(1)}, Food: ${bot.food}. Gold nuggets: ${lib.count('gold_nugget')}, Ingots: ${lib.count('gold_ingot')}. Supporting team!`);

console.log('=== STATUS ===');
console.log(`HP: ${bot.health}, Food: ${bot.food}`);
console.log(`Inventory:`, JSON.stringify(lib.inv()));

return {
  hp: bot.health,
  food: bot.food,
  nuggets: lib.count('gold_nugget'),
  ingots: lib.count('gold_ingot'),
  inv: lib.inv()
};
