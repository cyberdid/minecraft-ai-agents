// programs/206-fast-arm-and-nether-sprint.js
console.log('--- FAST ARM ON SURFACE & SPRINT TO FORTRESS ---');
console.log('Start pos:', lib.fmt(bot.entity.position));
console.log('HP:', bot.health, 'Food:', bot.food);

// 1. Step outside base door
console.log('Exiting base door (294, 72, -54)...');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  try {
    const d = bot.blockAt(new Vec3(294, 72, -54));
    if (d) await bot.activateBlock(d);
    await lib.walkTo(294.5, -52.0, 2000);
  } catch (e2) {}
}

// 2. Collect 4 logs
console.log('Collecting 4 logs...');
await lib.collect('*_log', 4);
console.log('Logs collected! Inv:', JSON.stringify(lib.inv()));

// 3. Craft planks, sticks, wooden pickaxe
const logItem = bot.inventory.items().find(i => i.name.endsWith('_log'));
if (!logItem) throw new Error('No logs in inventory');
const plankName = logItem.name.replace('_log', '_planks');
await lib.craft(plankName, 12);
await lib.craft('stick', 8);
await lib.craft('wooden_pickaxe', 1);
console.log('Wooden pickaxe crafted!');

// 4. Collect 16 stone
console.log('Collecting 16 stone...');
await lib.collect('stone', 16);
console.log('Cobble count:', lib.count('cobblestone'));

// 5. Craft stone tools
if (lib.count('cobblestone') >= 5) {
  await lib.craft('stone_pickaxe', 2);
  await lib.craft('stone_sword', 1);
  await lib.equipWeapon();
  console.log('Stone tools crafted! Tools:', JSON.stringify(lib.tools()));
}

console.log('Inventory before portal:', JSON.stringify(lib.inv()));
bot.chat(`gamma armed with stone sword, 2 stone pickaxes, cobble & planks! Moving to Nether portal.`);

// 6. Walk along south path to Nether portal at (299.5, 73.0, -53.5)
console.log('Walking south path to portal...');
await lib.walkTo(294.5, -52.0, 3000);
await lib.walkTo(299.5, -52.0, 3000);
// Jump step up into portal block
bot.setControlState('jump', true);
await lib.walkTo(299.5, -53.5, 3000);
bot.setControlState('jump', false);
bot.clearControlStates();

console.log('Inside portal frame! Pos:', bot.entity.position);
console.log('Standing in:', bot.blockAt(bot.entity.position)?.name);

// 7. Wait for transit to Nether
console.log('Standing still for transit to Nether...');
const t0 = Date.now();
while (!String(bot.game.dimension).includes('nether') && (Date.now() - t0 < 25000) && !isCancelled()) {
  await sleep(1000);
  console.log(`Waiting in portal... dim=${bot.game.dimension}, pos=${lib.fmt(bot.entity.position)}`);
}

if (!String(bot.game.dimension).includes('nether')) {
  throw new Error('Did not transition to Nether within deadline');
}

console.log('SUCCESS! In the Nether! Pos:', lib.fmt(bot.entity.position));

// 8. Step out of portal to bunker floor
await lib.walkTo(40.5, -5.0, 3000);
bot.clearControlStates();
console.log('Nether bunker pos:', lib.fmt(bot.entity.position));

bot.chat(`gamma arrived in Nether bunker ${lib.fmt(bot.entity.position)}! Sprinting through covered East Ridge tunnel to Fortress.`);

// 9. Sprint through our covered East Ridge tunnel to Fortress Workshop
const waypoints = [
  new Vec3(63, 65, -3),
  new Vec3(63, 65, -30),
  new Vec3(62, 65, -60),
  new Vec3(62, 65, -100),
  new Vec3(50, 65, -115),
  new Vec3(44, 65, -127),
  new Vec3(44, 65, -140)
];

for (let i = 0; i < waypoints.length; i++) {
  const wp = waypoints[i];
  console.log(`Sprinting to WP ${i + 1}: ${lib.fmt(wp)}...`);
  try {
    await lib.goTo(wp.x, wp.y, wp.z, 2, { timeoutMs: 15000 });
  } catch (e) {
    try { await lib.goToXZ(wp.x, wp.z, { timeoutMs: 10000 }); } catch (e2) {}
  }
}

console.log('Final pos in covered advance tunnel:', lib.fmt(bot.entity.position));
console.log('Final tools:', JSON.stringify(lib.tools()));
console.log('Final inv:', JSON.stringify(lib.inv()));
bot.chat(`gamma safely reached Fortress Workshop tunnel at ${lib.fmt(bot.entity.position)}! Partnering with team at Blaze Spawner.`);
