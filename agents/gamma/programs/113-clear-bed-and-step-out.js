// programs/113-clear-bed-and-step-out.js
console.log('--- CLEAR BED PATHWAY & EXIT BASE ---');
console.log('Starting pos:', lib.fmt(bot.entity.position));

// 1. Dig the bed at (293, 72, -55) that blocks the doorway
const bed = bot.blockAt(new Vec3(293, 72, -55));
console.log(`Block at (293, 72, -55) is: ${bed?.name}`);
if (bed && bed.name.includes('bed')) {
  console.log('Digging bed to open clear pathway...');
  await lib.dig(293, 72, -55);
  await lib.pickup(4);
  console.log('Bed cleared and collected!');
}

// 2. Walk straight out through the clear doorway to (293, 72, -50)
console.log('Walking straight out to exterior (293, 72, -50)...');
await lib.goTo(293, 72, -50, 1, { timeoutMs: 15000 });
console.log('OUTSIDE BASE ON OPEN SURFACE! Pos:', lib.fmt(bot.entity.position));

// 3. Collect 6 logs
console.log('Collecting 6 logs...');
const logs = await lib.collect('*_log', 6);
const logType = Object.keys(logs)[0] || 'birch_log';
console.log('Logs collected:', JSON.stringify(logs));

// 4. Craft planks, sticks, wooden pickaxe
await lib.craft(logType.replace('_log', '_planks'), 16);
await lib.craft('stick', 8);
await lib.craft('wooden_pickaxe', 1);

// 5. Mine 20 stone for cobblestone
console.log('Mining 20 stone...');
await lib.collect('stone', 20);

// 6. Craft stone tools
console.log('Crafting stone tools...');
await lib.craft('stone_sword', 1);
await lib.craft('stone_pickaxe', 1);
await lib.craft('stone_axe', 1);
await bot.equip(mcData.itemsByName.stone_sword.id, 'hand');

console.log('Cobblestone count:', lib.count('cobblestone'));
console.log('Equipped tools:', JSON.stringify(lib.tools()));
bot.chat(`gamma armed with stone tools and ${lib.count('cobblestone')} cobble! Heading to Nether portal.`);

// 7. Walk to Nether portal at (299, 73, -54)
console.log('Approaching Nether portal...');
await lib.goTo(299, 73, -53, 1, { timeoutMs: 15000 });
await bot.pathfinder.goto(new goals.GoalBlock(299, 73, -54));

console.log('Waiting for Nether transit...');
const t0 = Date.now();
while (!String(bot.game.dimension).includes('nether') && (Date.now() - t0 < 30000) && !isCancelled()) {
  await sleep(1000);
}

if (!String(bot.game.dimension).includes('nether')) {
  throw new Error('Did not transition to Nether within 30s');
}

console.log('SUCCESS! In the Nether at:', lib.fmt(bot.entity.position));
bot.chat(`gamma in the Nether with ${lib.count('cobblestone')} cobblestone! Advancing along safe East Ridge to Fortress Workshop.`);
