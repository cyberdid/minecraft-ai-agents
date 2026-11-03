console.log('=== DELTA: MARCH EAST RIDGE & HUNT ENDERMEN / BARTER ===');
console.log(`Starting pos: ${lib.fmt(bot.entity.position)}, HP: ${bot.health}`);

configureFireAvoidance();
try { await lib.equipArmor(); } catch (e) {}
try { await lib.equipWeapon(); } catch (e) {}

const waypoints = [
  { x: 46, y: 65, z: -7 },
  { x: 54, y: 65, z: -7 },
  { x: 63, y: 64, z: -7 },
  { x: 63, y: 65, z: -20 },
  { x: 63, y: 66, z: -35 },
  { x: 62, y: 67, z: -50 },
  { x: 61.5, y: 67, z: -55 },
  { x: 61.5, y: 67, z: -60 },
  { x: 61.5, y: 67, z: -65 },
  { x: 61.5, y: 67, z: -70 },
  { x: 61.5, y: 67, z: -75 },
  { x: 62.0, y: 67, z: -80 },
  { x: 61, y: 66, z: -100 },
  { x: 50, y: 65, z: -115 },
  { x: 44, y: 65, z: -127 }
];

let startIdx = 0;
for (let i = 0; i < waypoints.length; i++) {
  if (bot.entity.position.distanceTo(new Vec3(waypoints[i].x, waypoints[i].y, waypoints[i].z)) < 3.5) {
    startIdx = i + 1;
  }
}

console.log(`Starting march from WP ${startIdx}/${waypoints.length}...`);

let lastPearls = lib.count('ender_pearl');

for (let i = startIdx; i < waypoints.length && !isCancelled(); i++) {
  const wp = waypoints[i];
  const target = new Vec3(wp.x, wp.y, wp.z);
  if (bot.entity.position.distanceTo(target) < 2.0) continue;

  console.log(`Advancing to WP ${i + 1}/${waypoints.length}: (${wp.x}, ${wp.y}, ${wp.z})...`);
  await clearFireAhead();

  // Low pitch to avoid looking at Enderman eyes
  await bot.lookAt(new Vec3(wp.x, bot.entity.position.y - 0.5, wp.z));

  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 1.8));
  } catch (e) {
    try {
      await clearFireAhead();
      await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2.2));
    } catch (e2) {}
  }

  await clearFireAhead();
  try { await lib.pickup(3.5); } catch (e) {}

  // 1. Scan for Endermen
  const nearbyEndermen = Object.values(bot.entities).filter(e =>
    e.name === 'enderman' && e.isValid && bot.entity.position.distanceTo(e.position) <= 8.0
  );

  for (const ender of nearbyEndermen) {
    if (bot.health < 8) break;
    console.log(`Engaging Enderman at ${lib.fmt(ender.position)}!`);
    await bot.lookAt(ender.position.offset(0, 0.4, 0), true);
    if (bot.entity.position.distanceTo(ender.position) <= 4.2) {
      try { await lib.equipWeapon(); } catch (e) {}
      bot.attack(ender);
      await sleep(650);
      try { await lib.pickup(4.0); } catch (e) {}
    }
  }

  // 2. Scan for Piglins to barter
  const nearbyPiglins = Object.values(bot.entities).filter(e =>
    e.name === 'piglin' && e.isValid && bot.entity.position.distanceTo(e.position) <= 6.0
  );

  if (nearbyPiglins.length > 0 && lib.count('gold_ingot') > 0) {
    const pig = nearbyPiglins[0];
    console.log(`Piglin within 6m at ${lib.fmt(pig.position)}! Tossing gold ingot...`);
    await bot.lookAt(pig.position, true);
    const ingot = bot.inventory.items().find(it => it.name === 'gold_ingot');
    if (ingot) {
      try {
        await bot.toss(ingot.type, null, 1);
        bot.chat('delta: Tossed gold ingot to neutral Piglin for barter!');
        await sleep(6500);
        await lib.pickup(6.0);
      } catch (e) {
        console.log('Barter toss error:', e.message);
      }
    }
  }

  const curPearls = lib.count('ender_pearl');
  if (curPearls > lastPearls) {
    bot.chat(`delta: Obtained Ender Pearl! Total: ${curPearls}/12`);
    console.log(`Obtained Ender Pearl! Total: ${curPearls}/12`);
    lastPearls = curPearls;
  }

  if (bot.health <= 6) {
    console.log(`Health critical (${bot.health}), holding position.`);
    break;
  }
}

console.log(`Arrived at destination! Pos: ${lib.fmt(bot.entity.position)}, Pearls: ${lib.count('ender_pearl')}/12`);
bot.chat(`delta: Trail march complete. Ender Pearls: ${lib.count('ender_pearl')}/12, Gold: ${lib.count('gold_ingot')}, HP: ${bot.health}/20.`);

return {
  pos: bot.entity.position,
  hp: bot.health,
  pearls: lib.count('ender_pearl'),
  gold: lib.count('gold_ingot')
};
