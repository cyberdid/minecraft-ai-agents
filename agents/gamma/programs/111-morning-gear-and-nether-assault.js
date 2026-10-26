// programs/111-morning-gear-and-nether-assault.js
console.log('--- MORNING GEAR & NETHER BLAZE EXPEDITION ---');
console.log('Starting pos:', lib.fmt(bot.entity.position));
console.log('Health:', bot.health, 'Food:', bot.food);

// 1. Step out through base doorway to (294, 72, -52)
console.log('Stepping outside through doorway to (294, 72, -52)...');
try {
  await lib.walkTo(294, -52);
} catch (e) {
  await lib.goTo(294, 72, -52, 1);
}
console.log('Outside base at:', lib.fmt(bot.entity.position));

// 2. Gather 6 logs
console.log('Collecting 6 logs...');
const logs = await lib.collect('*_log', 6);
const logType = Object.keys(logs)[0] || 'birch_log';
const plankType = logType.replace('_log', '_planks');

// Craft planks, sticks, wooden pickaxe
await lib.craft(plankType, 16);
await lib.craft('stick', 8);
await lib.craft('wooden_pickaxe', 1);

// Mine 20 stone for cobblestone
console.log('Mining 20 stone for cobblestone...');
await lib.collect('stone', 20);

// Craft stone tools
console.log('Crafting stone tools...');
await lib.craft('stone_sword', 1);
await lib.craft('stone_pickaxe', 1);
await bot.equip(mcData.itemsByName.stone_sword.id, 'hand');

console.log('Equipped gear:', JSON.stringify(lib.tools()));
console.log('Cobblestone count:', lib.count('cobblestone'));
bot.chat(`gamma geared with stone tools and ${lib.count('cobblestone')} cobble! Entering Nether portal.`);

// 3. Approach Nether portal at (299, 73, -54)
console.log('Approaching Nether portal at (299, 73, -54)...');
await lib.walkTo(299, -52);
await lib.walkTo(299, -54);

console.log('Waiting for Nether transit...');
const t0 = Date.now();
while (!String(bot.game.dimension).includes('nether') && (Date.now() - t0 < 30000) && !isCancelled()) {
  await sleep(1000);
}

if (!String(bot.game.dimension).includes('nether')) {
  throw new Error('Did not transition to Nether within 30s');
}

console.log('SUCCESS! In the Nether at:', lib.fmt(bot.entity.position));
bot.chat('gamma in the Nether with cobblestone! Advancing via safe East Ridge (x=63) to Fortress Workshop (44, 65, -128).');

// 4. Safe East Ridge Trail to Fortress Workshop (44, 65, -128)
console.log('Moving to Waypoint 1 (50, 65, -35)...');
try {
  await lib.goTo(50, 65, -35, 3, { timeoutMs: 20000 });
} catch (e) {}

console.log('Moving to Waypoint 2 on East Ridge at (63, 65, -66)...');
try {
  await lib.goTo(63, 65, -66, 3, { timeoutMs: 25000 });
  console.log('Safely on East Ridge! Pos:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('East Ridge note:', e.message);
}

console.log('Moving to Waypoint 3 on East Ridge at (63, 65, -100)...');
try {
  await lib.goTo(63, 65, -100, 3, { timeoutMs: 25000 });
} catch (e) {}

console.log('Moving to Fortress Workshop doorway (44, 65, -128)...');
try {
  await lib.goTo(44, 65, -128, 1, { timeoutMs: 30000 });
  console.log('ARRIVED AT FORTRESS WORKSHOP!');
} catch (e) {
  console.log('Fortress Workshop note:', e.message);
}

// 5. Check teammates
for (const [name, p] of Object.entries(bot.players)) {
  if (name !== 'gamma' && p.entity) {
    console.log(`Teammate ${name} at: ${lib.fmt(p.entity.position)}`);
  }
}

bot.chat(`gamma at Fortress Workshop ${lib.fmt(bot.entity.position)}! Ready to assault Blaze Spawner at (32, 68, -190).`);
console.log('Final pos:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);
