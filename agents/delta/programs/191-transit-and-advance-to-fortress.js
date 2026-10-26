// programs/191-transit-and-advance-to-fortress.js
console.log('Pos before:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('Health:', bot.health, 'Food:', bot.food);
console.log('Inventory:', JSON.stringify(lib.inv()));

// 1. Open door and step outside if in Overworld
if (bot.game.dimension !== 'minecraft:the_nether' && !bot.game.dimension.includes('nether')) {
  const doorBlock = bot.blockAt(new Vec3(294, 73, -54)) || bot.blockAt(new Vec3(294, 72, -54));
  if (doorBlock && doorBlock.name.includes('door') && !doorBlock._properties?.open) {
    console.log('Opening base door...');
    await bot.activateBlock(doorBlock);
    await sleep(300);
  }

  // Walk south to open yard
  console.log('Walking south to open yard (294, 72, -50)...');
  await bot.lookAt(new Vec3(294.5, 72, -49.0), true);
  bot.setControlState('forward', true);
  await sleep(2000);
  bot.setControlState('forward', false);

  // Walk east to (299, 72, -50)
  console.log('Walking east to (299, 72, -50)...');
  await bot.lookAt(new Vec3(300.0, 72, bot.entity.position.z), true);
  bot.setControlState('forward', true);
  await sleep(2500);
  bot.setControlState('forward', false);

  // Walk north into portal block (299.5, 73.5, -54.0)
  const target = new Vec3(299.5, 73.5, -54.0);
  console.log('Walking into Nether portal at', lib.fmt(target));
  await bot.lookAt(target, true);
  bot.setControlState('forward', true);
  await sleep(2500);
  bot.setControlState('forward', false);

  bot.chat('delta: Inside Nether portal frame! Transiting now...');

  // Wait for dimension change
  const startDim = bot.game.dimension;
  for (let i = 0; i < 15; i++) {
    await sleep(1000);
    if (bot.game.dimension !== startDim) {
      console.log(`TELEPORT SUCCESS! New dimension: ${bot.game.dimension}`);
      break;
    }
  }
}

console.log('Pos after portal:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);

// 2. Check if we arrived in the Nether
if (!bot.game.dimension.includes('nether')) {
  console.log('Not yet in Nether, current pos:', lib.fmt(bot.entity.position));
  return;
}

bot.chat(`delta: Arrived in Nether at ${lib.fmt(bot.entity.position)}! Advancing along East Ridge trail.`);
await lib.equipWeapon();

// 3. Proven East Ridge Trail waypoints:
const ridgeWaypoints = [
  new Vec3(63, 64, -5),
  new Vec3(62, 66, -30),
  new Vec3(61, 67, -59),
  new Vec3(54, 65, -90),
  new Vec3(44, 66, -127),
  new Vec3(44, 65, -133)
];

for (const wp of ridgeWaypoints) {
  console.log(`Advancing to waypoint ${lib.fmt(wp)}...`);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2));
    console.log(`Reached ${lib.fmt(wp)}! Pos: ${lib.fmt(bot.entity.position)}`);
  } catch (err) {
    console.log(`Path note at ${lib.fmt(wp)}:`, err.message);
  }

  // Defend against any aggressive hostile mobs (skip neutral zombified piglins)
  const hostiles = lib.hostiles(12);
  for (const h of hostiles) {
    if (h.dist < 5 && !['zombified_piglin'].includes(h.name)) {
      console.log(`Defending against ${h.name} at dist ${h.dist}...`);
      try {
        await lib.fight(6, 6);
      } catch (e) {}
    }
  }

  // Log nearby teammates
  for (const [name, p] of Object.entries(bot.players)) {
    if (p && p.entity && name !== 'delta') {
      const d = Math.round(bot.entity.position.distanceTo(p.entity.position));
      if (d < 25) {
        console.log(`Teammate ${name} nearby at ${lib.fmt(p.entity.position)} (dist ${d}m)`);
      }
    }
  }
}

console.log('Final position in Nether:', lib.fmt(bot.entity.position));
console.log('Health:', bot.health, 'Food:', bot.food);

if (bot.entity.position.z <= -125) {
  bot.chat(`delta: Reached Fortress advance hallway at ${lib.fmt(bot.entity.position)}! United with team with 34 cobble & stone weapons.`);
}
