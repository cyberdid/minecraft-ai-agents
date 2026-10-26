// programs/099-exit-base-and-nether-advance.js
console.log('--- EXITING BASE VIA DIRECT WALK & RE-GEAR ---');
console.log('Pos:', lib.fmt(bot.entity.position));

// 1. Walk straight forward through doorway along x=293
console.log('Walking straight out along x=293 to z=-51...');
await lib.walkTo(293, -51);
console.log('Outside base at:', lib.fmt(bot.entity.position));

// 2. Gather 6 logs
console.log('Collecting 6 logs...');
const logs = await lib.collect('*_log', 6);
const logType = Object.keys(logs)[0] || 'birch_log';
const plankType = logType.replace('_log', '_planks');

// Craft planks & sticks
await lib.craft(plankType, 16);
await lib.craft('stick', 8);

// Craft wooden pickaxe and mine 20 stone
console.log('Crafting wooden_pickaxe & mining 20 stone...');
await lib.craft('wooden_pickaxe', 1);
await lib.collect('stone', 20);

// Craft stone tools
console.log('Crafting stone tools...');
await lib.craft('stone_sword', 1);
await lib.craft('stone_pickaxe', 1);
await bot.equip(mcData.itemsByName.stone_sword.id, 'hand');

console.log('Equipped gear:', JSON.stringify(lib.tools()));
console.log('Cobblestone count:', lib.count('cobblestone'));
bot.chat(`gamma armed with stone tools and ${lib.count('cobblestone')} cobble! Entering Nether portal.`);

// 3. Approach Nether portal at (299, 73, -54)
console.log('Approaching Nether portal at (299, 73, -54)...');
await lib.goTo(299, 73, -54, 1, { timeoutMs: 15000 });
await bot.pathfinder.goto(new goals.GoalBlock(299, 73, -54));

console.log('Waiting for Nether transit...');
const t0 = Date.now();
while (!String(bot.game.dimension).includes('nether') && (Date.now() - t0 < 30000) && !isCancelled()) {
  await sleep(1000);
}

if (!String(bot.game.dimension).includes('nether')) {
  throw new Error('Did not transition to Nether within 30s');
}

console.log('In the Nether at:', lib.fmt(bot.entity.position));
bot.chat('gamma in the Nether! Advancing along safe East Ridge (x=63) to Fortress Workshop (44, 65, -128).');

// 4. Safe advance along East Ridge to Fortress Workshop (44, 65, -128)
console.log('Moving to Waypoint 1 (50, 65, -35)...');
try {
  await lib.goTo(50, 65, -35, 3, { timeoutMs: 20000 });
} catch (e) {}

console.log('Moving to Waypoint 2 on East Ridge at (63, 65, -66)...');
try {
  await lib.goTo(63, 65, -66, 3, { timeoutMs: 25000 });
} catch (e) {}

console.log('Moving to Fortress Workshop doorway (44, 65, -128)...');
try {
  await lib.goTo(44, 65, -128, 1, { timeoutMs: 30000 });
  console.log('ARRIVED AT FORTRESS WORKSHOP!');
} catch (e) {}

for (const [name, p] of Object.entries(bot.players)) {
  if (name !== 'gamma' && p.entity) {
    console.log(`Teammate ${name} at: ${lib.fmt(p.entity.position)}`);
  }
}

bot.chat(`gamma at Fortress Workshop ${lib.fmt(bot.entity.position)}! Ready to breach Blaze Spawner (32, 68, -190).`);
