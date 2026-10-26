// programs/125-full-morning-rearm-and-nether-advance.js
console.log('--- MORNING RE-ARM & NETHER BLAZE EXPEDITION ---');
console.log('Starting pos:', lib.fmt(bot.entity.position));
console.log('Health:', bot.health, 'Food:', bot.food);

// 1. Walk straight out through open doorway to open surface (293, 70, -50)
console.log('Stepping outside base to (293, 70, -50)...');
await lib.walkTo(293, -50);
console.log('Outside base at:', lib.fmt(bot.entity.position));

// 2. Gather 6 logs
console.log('Collecting 6 logs outside...');
const logs = await lib.collect('*_log', 6);
const logType = Object.keys(logs)[0] || 'birch_log';
console.log('Logs collected:', JSON.stringify(logs));

// 3. Craft planks, sticks, wooden pickaxe
await lib.craft(logType.replace('_log', '_planks'), 16);
await lib.craft('stick', 8);
await lib.craft('wooden_pickaxe', 1);

// 4. Mine 20 stone for cobblestone
console.log('Mining 20 stone...');
await lib.collect('stone', 20);

// 5. Craft stone tools
console.log('Crafting stone tools...');
await lib.craft('stone_sword', 1);
await lib.craft('stone_pickaxe', 1);
await lib.craft('stone_axe', 1);
await bot.equip(mcData.itemsByName.stone_sword.id, 'hand');

console.log('Cobblestone count:', lib.count('cobblestone'));
console.log('Equipped tools:', JSON.stringify(lib.tools()));
bot.chat(`gamma armed with stone tools and ${lib.count('cobblestone')} cobble! Heading to Nether portal.`);

// 6. Approach Nether portal at (299, 73, -54)
console.log('Approaching Nether portal...');
try {
  await lib.goTo(299, 73, -53, 1, { timeoutMs: 15000 });
} catch (e) {
  await lib.goToXZ(299, -53, { timeoutMs: 10000 });
}

// Step directly into purple portal block and stand still
console.log('Stepping into purple portal block (299, 73, -54)...');
await bot.pathfinder.goto(new goals.GoalBlock(299, 73, -54));
bot.clearControlStates();

console.log('Standing completely still for Nether transit...');
const t0 = Date.now();
while (!String(bot.game.dimension).includes('nether') && (Date.now() - t0 < 25000) && !isCancelled()) {
  await sleep(1000);
}

if (!String(bot.game.dimension).includes('nether')) {
  throw new Error('Did not transition to Nether within 25s');
}

console.log('SUCCESS! In the Nether at:', lib.fmt(bot.entity.position));
bot.chat(`gamma in the Nether with ${lib.count('cobblestone')} cobble! Advancing along safe East Ridge (x=63) to Fortress tunnel.`);

// 7. Safe East Ridge Trail to Fortress Workshop (44, 65, -128)
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
} catch (e) {}

// Move to Delta inside advance hallway (44, 65, -133)
console.log('Joining Delta at advance hallway (44, 65, -133)...');
try {
  await lib.goTo(44, 65, -133, 1, { timeoutMs: 15000 });
  console.log('UNITED WITH DELTA AT ADVANCE HALLWAY!');
} catch (e) {}

for (const [name, p] of Object.entries(bot.players)) {
  if (name !== 'gamma' && p.entity) {
    console.log(`Teammate ${name} at: ${lib.fmt(p.entity.position)}`);
  }
}

bot.chat(`gamma united with Delta at Fortress advance tunnel ${lib.fmt(bot.entity.position)}! Ready to breach Blaze Spawner (32, 68, -190).`);
console.log('Final pos:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);
