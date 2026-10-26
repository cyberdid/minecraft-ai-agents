// programs/178-arm-and-nether.js
console.log('--- ARM AND NETHER ENTRY ---');
console.log('Start pos:', lib.fmt(bot.entity.position));
console.log('HP:', bot.health, 'Food:', bot.food);

// 1. Collect 4 logs
console.log('Collecting 4 logs...');
await lib.collect('*_log', 4);
console.log('Logs collected! Inv:', JSON.stringify(lib.inv()));

// 2. Craft planks, sticks, wooden pickaxe
const logItem = bot.inventory.items().find(i => i.name.endsWith('_log'));
if (!logItem) throw new Error('No logs in inventory');
const plankName = logItem.name.replace('_log', '_planks');
await lib.craft(plankName, 12);
await lib.craft('stick', 4);
await lib.craft('wooden_pickaxe', 1);
console.log('Wooden pickaxe crafted!');

// 3. Collect 16 stone
console.log('Collecting 16 stone...');
await lib.collect('stone', 16);
console.log('Cobble count:', lib.count('cobblestone'));

// 4. Craft stone tools
if (lib.count('cobblestone') >= 5) {
  await lib.craft('stone_pickaxe', 1);
  await lib.craft('stone_sword', 1);
  await lib.equipWeapon();
  console.log('Stone tools crafted! Tools:', JSON.stringify(lib.tools()));
}

console.log('Inventory before portal:', JSON.stringify(lib.inv()));
bot.chat(`gamma armed with stone tools & ${lib.count('cobblestone')} cobble! Walking to Nether portal.`);

// 5. Walk to Nether portal at (299, 73, -54)
console.log('Walking to Nether portal at (299, 73, -54)...');
try {
  await lib.walkTo(298.5, -54.0, 4000);
  await lib.walkTo(299.0, -54.0, 3000);
} catch (e) {
  try { await bot.pathfinder.goto(new goals.GoalBlock(299, 73, -54)); } catch (e2) {}
}

bot.clearControlStates();
console.log('Inside portal frame! Pos:', lib.fmt(bot.entity.position));

// 6. Wait for transit to Nether
const t0 = Date.now();
while (!String(bot.game.dimension).includes('nether') && (Date.now() - t0 < 25000) && !isCancelled()) {
  await sleep(1000);
  console.log(`Waiting in portal... dim=${bot.game.dimension}, pos=${lib.fmt(bot.entity.position)}`);
}

if (!String(bot.game.dimension).includes('nether')) {
  console.log('Retrying walk into portal center (299.5, -54.0)...');
  await lib.walkTo(299.5, -54.0, 3000);
  bot.clearControlStates();
  const t1 = Date.now();
  while (!String(bot.game.dimension).includes('nether') && (Date.now() - t1 < 20000) && !isCancelled()) {
    await sleep(1000);
  }
}

if (String(bot.game.dimension).includes('nether')) {
  console.log('SUCCESS! In the Nether at:', lib.fmt(bot.entity.position));
  await lib.walkTo(40.5, -5.0, 3000);
  bot.clearControlStates();
  bot.chat(`gamma arrived in Nether bunker ${lib.fmt(bot.entity.position)}! Advancing along East Ridge trail.`);
}

console.log('Final pos:', lib.fmt(bot.entity.position));
console.log('Final tools:', JSON.stringify(lib.tools()));
console.log('Final inv:', JSON.stringify(lib.inv()));
