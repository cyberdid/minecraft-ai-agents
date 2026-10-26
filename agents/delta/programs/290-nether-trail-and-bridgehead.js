// programs/290-nether-trail-and-bridgehead.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('Health:', bot.health, 'Food:', bot.food);

bot.pathfinder.stop();
await sleep(100);

// 1. Move South (+Z) to z=-8 to clear soul fire hill
console.log('Moving South to z=-8 to bypass fire...');
try {
  await bot.pathfinder.goto(new goals.GoalNear(48, 65, -8, 1));
} catch (e) {
  console.log('South move note:', e.message);
  await bot.lookAt(new Vec3(48, 65, -8), true);
  bot.setControlState('forward', true);
  await sleep(600);
  bot.setControlState('forward', false);
}
console.log('At z<=-8 pos:', lib.fmt(bot.entity.position));

// 2. Move East (+X) to covered East Ridge entrance at (63, 65, -8)
console.log('Moving East to covered tunnel entrance at (63, 65, -8)...');
try {
  await bot.pathfinder.goto(new goals.GoalNear(63, 65, -8, 2));
} catch (e) {
  console.log('East move note:', e.message);
  await bot.lookAt(new Vec3(63, 65, -8), true);
  bot.setControlState('forward', true);
  await sleep(1500);
  bot.setControlState('forward', false);
}
console.log('At East Ridge entrance:', lib.fmt(bot.entity.position));

// 3. Move into tunnel at (63, 65, -15)
try {
  await bot.pathfinder.goto(new goals.GoalNear(63, 65, -15, 1));
} catch (e) {}

// 4. Dig 12 netherrack blocks from tunnel wall/ceiling to have building blocks
console.log('Gathering netherrack for wall building...');
const netherrackBlocks = bot.findBlocks({
  matching: b => b.name === 'netherrack',
  maxDistance: 4,
  count: 12
});
for (const p of netherrackBlocks) {
  // Only dig if it does not expose outside (e.g. wall/ceiling interior)
  const b = bot.blockAt(p);
  if (b) {
    try {
      await bot.dig(b);
    } catch (e) {}
  }
}
console.log('Netherrack gathered! Count:', lib.count('netherrack'));

// 5. Sprint through covered tunnel waypoints to frontline bunker (44, 65, -170)
const waypoints = [
  new Vec3(62, 66, -30),
  new Vec3(61, 67, -59),
  new Vec3(62, 67, -80),
  new Vec3(61, 66, -100),
  new Vec3(50, 65, -115),
  new Vec3(44, 65, -127),
  new Vec3(44, 65, -145),
  new Vec3(44, 65, -158),
  new Vec3(44, 65, -170)
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
    await sleep(400);
    bot.setControlState('forward', false);
  }
}

console.log('Arrived at bunker! Pos:', lib.fmt(bot.entity.position));
bot.chat(`delta: Arrived at frontline bunker ${lib.fmt(bot.entity.position)} with ${lib.count('netherrack')} netherrack!`);

// 6. Check dropped items near frontline
const drops = Object.values(bot.entities).filter(e => e && (e.name === 'item' || e.type === 'object') && bot.entity.position.distanceTo(e.position) < 20);
console.log(`Drops near frontline: ${drops.length}`);
for (const d of drops) {
  console.log(`  Drop at ${lib.fmt(d.position)} (dist: ${bot.entity.position.distanceTo(d.position).toFixed(1)}m)`);
  if (bot.entity.position.distanceTo(d.position) < 8) {
    try {
      await lib.pickup(8);
    } catch (e) {}
  }
}

// 7. Equip best weapon
const sword = bot.inventory.items().find(i => i.name.endsWith('_sword'));
if (sword) {
  await bot.equip(sword, 'hand');
  console.log('Equipped sword:', sword.name);
}

// 8. Summary of inventory
console.log('Current Inventory:');
for (const item of bot.inventory.items()) {
  console.log(`  ${item.name} x${item.count}`);
}
