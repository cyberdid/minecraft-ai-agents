// programs/152-craft-pickaxe-and-advance-nether.js
console.log('--- CRAFT STICKS, STONE PICKAXE & ADVANCE TO NETHER ---');
console.log('Pos:', lib.fmt(bot.entity.position));
console.log('Inv:', JSON.stringify(lib.inv()));

// 1. Craft sticks and stone_pickaxe
console.log('Crafting sticks and stone_pickaxe...');
await lib.craft('stick', 4);
await lib.craft('stone_pickaxe', 1);

const sword = bot.inventory.items().find(i => i.name.includes('sword'));
if (sword) await bot.equip(sword, 'hand');

console.log('Gear now:', JSON.stringify(lib.tools()));
console.log('Inv now:', JSON.stringify(lib.inv()));
bot.chat(`gamma armed with stone sword & pickaxe, + ${lib.count('cobblestone')} cobble! Heading to Nether.`);

// 2. Walk to Nether portal at (299, 73, -54)
console.log('Navigating to Nether portal (299, 73, -54)...');
try {
  await lib.goTo(299, 73, -53, 1, { timeoutMs: 25000 });
} catch (e) {
  console.log('goTo portal note:', e.message);
  await lib.goToXZ(299, -53, { timeoutMs: 15000 });
}

// Step into portal and stand completely still
console.log('Stepping into purple portal frame...');
await bot.pathfinder.goto(new goals.GoalBlock(299, 73, -54));
bot.clearControlStates();

console.log('Waiting for Nether transit (standing still)...');
const t0 = Date.now();
while (!String(bot.game.dimension).includes('nether') && (Date.now() - t0 < 25000) && !isCancelled()) {
  await sleep(1000);
}

if (!String(bot.game.dimension).includes('nether')) {
  console.log('Dimension currently:', bot.game.dimension);
  throw new Error('Did not transition to Nether within 25s');
}

console.log('SUCCESS! In the Nether at:', lib.fmt(bot.entity.position));
bot.chat('gamma in the Nether! Following safe East Ridge trail to Fortress advance tunnel (44, 65, -141).');

// 3. Follow Delta tested East Ridge waypoints
const deltaWaypoints = [
  new Vec3(63, 64, -5),
  new Vec3(62, 66, -30),
  new Vec3(61, 67, -59),
  new Vec3(54, 65, -90),
  new Vec3(44, 65, -127),
  new Vec3(44, 65, -141)
];

for (let i = 0; i < deltaWaypoints.length; i++) {
  const wp = deltaWaypoints[i];
  console.log(`Navigating to Waypoint ${i + 1}: ${lib.fmt(wp)}...`);
  try {
    await lib.goTo(wp.x, wp.y, wp.z, 2, { timeoutMs: 25000 });
    console.log(`Reached Waypoint ${i + 1} at ${lib.fmt(bot.entity.position)}`);
  } catch (e) {
    console.log(`WP ${i + 1} note: ${e.message}`);
  }
}

console.log('Final position in Nether:', lib.fmt(bot.entity.position));
bot.chat(`gamma safely arrived at Fortress advance tunnel ${lib.fmt(bot.entity.position)}! Cobblestone=${lib.count('cobblestone')}. Ready to secure breach at z=-149.`);
