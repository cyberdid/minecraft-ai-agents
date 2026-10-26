// programs/177-fast-arm-and-nether-entry.js
console.log('--- FAST SURFACE RE-ARM & NETHER ENTRY ---');
console.log('Start pos:', lib.fmt(bot.entity.position));
console.log('HP:', bot.health, 'Food:', bot.food);

// 1. Step outside base door to surface
console.log('Exiting base door (294, 72, -54)...');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  try {
    const door = bot.blockAt(new Vec3(294, 72, -54));
    if (door) await bot.activateBlock(door);
    await lib.walkTo(294.5, -52.5);
  } catch (e2) {}
}

console.log('Outside on surface at:', lib.fmt(bot.entity.position));

// 2. Find nearest tree trunk at surface (y >= 71)
const logBlock = bot.findBlock({
  matching: b => b.name.endsWith('_log') && b.position.y >= 71,
  maxDistance: 16
});

if (logBlock) {
  console.log(`Found log at ${lib.fmt(logBlock.position)} (${logBlock.name})`);
  try { await lib.goTo(logBlock.position.x, logBlock.position.y, logBlock.position.z, 2, { timeoutMs: 10000 }); } catch (e) {}
  
  // Dig 3 logs
  const logs = bot.findBlocks({ matching: b => b.name.endsWith('_log'), maxDistance: 4, count: 3 });
  for (const lp of logs) {
    try {
      await lib.dig(lp.x, lp.y, lp.z);
      await sleep(100);
      await lib.pickup(3);
    } catch (e) {}
  }
} else {
  console.log('No tree found with y >= 71, collecting logs via lib.collect...');
  await lib.collect('*_log', 3);
}

console.log('Logs in inv:', lib.count('*_log'));

// 3. Craft planks, sticks, table, wooden_pickaxe
const logItem = bot.inventory.items().find(i => i.name.endsWith('_log'));
if (logItem) {
  const plankName = logItem.name.replace('_log', '_planks');
  await lib.craft(plankName, 12);
  await lib.craft('stick', 4);
  await lib.craft('wooden_pickaxe', 1);
  console.log('Wooden pickaxe crafted!');
}

// 4. Mine 16 stone on surface (y >= 71)
console.log('Mining stone on surface...');
const pick = bot.inventory.items().find(i => i.name.includes('pickaxe'));
if (pick) await bot.equip(pick, 'hand');

const stoneBlocks = bot.findBlocks({
  matching: b => ['stone', 'cobblestone', 'andesite', 'diorite'].includes(b.name) && b.position.y >= 70,
  maxDistance: 12,
  count: 16
});

console.log(`Found ${stoneBlocks.length} surface stone blocks`);
for (const sp of stoneBlocks) {
  if (lib.count('cobblestone') >= 16) break;
  try {
    await lib.dig(sp.x, sp.y, sp.z);
    await sleep(100);
    await lib.pickup(3);
  } catch (e) {}
}

console.log('Cobblestone mined:', lib.count('cobblestone'));

// 5. Craft stone tools
if (lib.count('cobblestone') >= 5) {
  await lib.craft('stone_pickaxe', 1);
  await lib.craft('stone_sword', 1);
  await lib.equipWeapon();
  console.log('Stone tools crafted! Tools:', JSON.stringify(lib.tools()));
}

console.log('Inventory before portal:', JSON.stringify(lib.inv()));
bot.chat(`gamma armed on surface with stone tools & ${lib.count('cobblestone')} cobble! Walking to Nether portal.`);

// 6. Walk along surface to Nether portal at (299, 73, -54)
console.log('Walking to Nether portal at (299, 73, -54)...');
try {
  await lib.walkTo(298.5, -54.0, 4000);
  await lib.walkTo(299.0, -54.0, 3000);
} catch (e) {
  try { await bot.pathfinder.goto(new goals.GoalBlock(299, 73, -54)); } catch (e2) {}
}

bot.clearControlStates();
console.log('Inside portal frame! Pos:', lib.fmt(bot.entity.position));

// 7. Wait for transit to Nether
const t0 = Date.now();
while (!String(bot.game.dimension).includes('nether') && (Date.now() - t0 < 25000) && !isCancelled()) {
  await sleep(1000);
  console.log(`Waiting in portal... dim=${bot.game.dimension}, pos=${lib.fmt(bot.entity.position)}`);
}

if (!String(bot.game.dimension).includes('nether')) {
  // Retry walkTo center
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
  // Step out of portal to bunker floor
  await lib.walkTo(40.5, -5.0, 3000);
  bot.clearControlStates();
  bot.chat(`gamma arrived in Nether bunker ${lib.fmt(bot.entity.position)}! Advancing to Fortress Workshop.`);
} else {
  console.log('Transit note: Still in', bot.game.dimension);
}

console.log('Final pos:', lib.fmt(bot.entity.position));
console.log('Final tools:', JSON.stringify(lib.tools()));
console.log('Final inv:', JSON.stringify(lib.inv()));
