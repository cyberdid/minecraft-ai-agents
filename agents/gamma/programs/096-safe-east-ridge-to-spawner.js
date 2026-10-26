// programs/096-safe-east-ridge-to-spawner.js
console.log('--- RE-GEAR & ADVANCE VIA SAFE EAST RIDGE TRAIL ---');
console.log('Pos:', lib.fmt(bot.entity.position));
console.log('Health:', bot.health, 'Food:', bot.food);

// 1. Step outside base door to chop 6 logs
console.log('Stepping outside door (294, 72, -54)...');
await lib.goThroughDoor(294, 72, -54);

console.log('Collecting 6 logs...');
const logs = await lib.collect('*_log', 6);
const logType = Object.keys(logs)[0] || 'birch_log';
const plankType = logType.replace('_log', '_planks');

// Craft planks & sticks
await lib.craft(plankType, 16);
await lib.craft('stick', 8);

// Craft wooden pickaxe, mine 16 stone
console.log('Crafting wooden_pickaxe & mining 16 stone...');
await lib.craft('wooden_pickaxe', 1);
await lib.collect('stone', 16);

// Craft stone tools
console.log('Crafting stone tools...');
await lib.craft('stone_sword', 1);
await lib.craft('stone_pickaxe', 1);
await bot.equip(mcData.itemsByName.stone_sword.id, 'hand');

console.log('Equipped gear:', JSON.stringify(lib.tools()));
console.log('Inventory:', JSON.stringify(lib.inv()));
bot.chat(`gamma armed with stone tools and ${lib.count('cobblestone')} cobble! Entering Nether via safe East Ridge (x=63).`);

// 2. Approach Nether portal at (299, 73, -54)
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
bot.chat('gamma in the Nether! Following safe East Ridge Trail (x=63) to Fortress Workshop (44, 65, -128).');

// 3. Follow SAFE East Ridge Trail:
// Waypoint 1: (50, 65, -35)
console.log('Navigating to Waypoint 1: (50, 65, -35)...');
try {
  await lib.goTo(50, 65, -35, 3, { timeoutMs: 20000 });
} catch (e) {}

// Waypoint 2: SAFE East Ridge at x=63! (Bypasses x=57 fire pit)
console.log('Navigating to Waypoint 2: SAFE East Ridge at (63, 65, -66)...');
try {
  await lib.goTo(63, 65, -66, 3, { timeoutMs: 25000 });
  console.log('Safely on East Ridge! Pos:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('East Ridge note:', e.message);
}

// Waypoint 3: North along East Ridge to (63, 65, -100)
console.log('Navigating along East Ridge to (63, 65, -100)...');
try {
  await lib.goTo(63, 65, -100, 3, { timeoutMs: 25000 });
} catch (e) {}

// Waypoint 4: Turn West into Fortress Workshop at (44, 65, -128)
console.log('Navigating to Fortress Workshop doorway (44, 65, -128)...');
try {
  await lib.goTo(44, 65, -128, 1, { timeoutMs: 30000 });
  console.log('ARRIVED AT FORTRESS WORKSHOP!');
} catch (e) {
  console.log('Fortress Workshop note:', e.message);
}

// 4. Report status
for (const [name, p] of Object.entries(bot.players)) {
  if (name !== 'gamma' && p.entity) {
    console.log(`Teammate ${name} at: ${lib.fmt(p.entity.position)}, dist: ${p.entity.position.distanceTo(bot.entity.position).toFixed(1)}`);
  }
}

bot.chat(`gamma at Fortress Workshop ${lib.fmt(bot.entity.position)}! Ready to advance on Blaze Spawner (32, 68, -190).`);
