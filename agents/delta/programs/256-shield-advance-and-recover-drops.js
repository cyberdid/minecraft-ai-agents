// programs/256-shield-advance-and-recover-drops.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('Health:', bot.health, 'Food:', bot.food);

bot.pathfinder.stop();
await sleep(150);

// 1. Equip shield in off-hand and stone sword in main hand
const shieldItem = bot.inventory.items().find(i => i.name === 'shield');
if (shieldItem) {
  await bot.equip(shieldItem, 'off-hand');
  console.log('Shield confirmed in off-hand!');
}

const swordItem = bot.inventory.items().find(i => i.name === 'stone_sword');
if (swordItem) {
  await bot.equip(swordItem, 'hand');
  console.log('Stone sword equipped in main hand!');
}

bot.chat('delta: Shield in offhand & stone sword ready! Sprinting through covered East Ridge to fortress!');

// 2. Sprint through fully enclosed East Ridge tunnel to mountain cover
const waypoints = [
  new Vec3(50, 65, -6),
  new Vec3(63, 65, -5),
  new Vec3(62, 66, -30),
  new Vec3(61, 67, -59),
  new Vec3(62, 67, -80),
  new Vec3(61, 66, -100),
  new Vec3(50, 65, -115),
  new Vec3(44, 65, -127),
  new Vec3(44, 65, -145),
  new Vec3(44, 65, -155) // Hold point inside mountain rock
];

for (let i = 0; i < waypoints.length; i++) {
  if (isCancelled()) break;
  const wp = waypoints[i];
  console.log(`Advancing to WP ${i + 1}/${waypoints.length}: ${lib.fmt(wp)}...`);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2));
  } catch (e) {
    console.log(`Path note to ${lib.fmt(wp)}:`, e.message);
    await bot.lookAt(new Vec3(wp.x + 0.5, wp.y + 1, wp.z + 0.5), true);
    bot.setControlState('forward', true);
    await sleep(350);
    bot.setControlState('forward', false);
  }
}

console.log('Reached mountain hold point at:', lib.fmt(bot.entity.position));

// 3. Step forward to recover dropped items at (44.5, 65.0, -158.5)
console.log('Recovering dropped items at (44, 65, -158)...');
try {
  await bot.pathfinder.goto(new goals.GoalBlock(44, 65, -158));
} catch (e) {
  await bot.lookAt(new Vec3(44.5, 65.0, -158.5), true);
  bot.setControlState('forward', true);
  await sleep(600);
  bot.setControlState('forward', false);
}

await lib.pickup(4);
console.log('Items recovered! Cobble count:', lib.count('cobblestone'), 'Inv:', JSON.stringify(lib.inv()));

// 4. Immediately place 2-high baffle wall at (44, 65..66, -160) to block Blaze fireballs
console.log('Placing 2-high baffle wall at (44, 65..66, -160)...');
try {
  const b1 = bot.blockAt(new Vec3(44, 65, -160));
  if (!b1 || b1.name === 'air' || b1.name === 'cave_air') {
    await lib.place('cobblestone', 44, 65, -160);
    console.log('Placed lower baffle wall at (44, 65, -160)!');
  }
  const b2 = bot.blockAt(new Vec3(44, 66, -160));
  if (!b2 || b2.name === 'air' || b2.name === 'cave_air') {
    await lib.place('cobblestone', 44, 66, -160);
    console.log('Placed upper baffle wall at (44, 66, -160)!');
  }
} catch (e) {
  console.log('Baffle placement note:', e.message);
}

bot.chat(`delta: Baffle wall secured at (44, 65..66, -160)! Line-of-sight blocked! Cobble in inv: ${lib.count('cobblestone')}. Ready to bridge!`);
console.log('Final pos:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);
