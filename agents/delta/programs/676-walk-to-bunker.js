console.log('=== DELTA: MARCH TO FORTRESS BUNKER ===');
console.log(`Starting pos: ${lib.fmt(bot.entity.position)}, HP: ${bot.health}, Food: ${bot.food}`);

configureFireAvoidance();
try { await lib.equipArmor(); } catch (e) {}
try { await lib.equipWeapon(); } catch (e) {}

const waypoints = [
  { x: 63, y: 65, z: -20 },
  { x: 63, y: 66, z: -35 },
  { x: 62, y: 67, z: -50 },
  { x: 61.5, y: 67, z: -60 },
  { x: 61.5, y: 67, z: -70 },
  { x: 62.0, y: 67, z: -80 },
  { x: 61, y: 66, z: -100 },
  { x: 50, y: 65, z: -115 },
  { x: 44, y: 65, z: -127 },
  { x: 44, y: 65, z: -131 } // Bunker core
];

for (let i = 0; i < waypoints.length && !isCancelled(); i++) {
  const wp = waypoints[i];
  const target = new Vec3(wp.x, wp.y, wp.z);
  if (bot.entity.position.distanceTo(target) < 2.0) continue;

  console.log(`Advancing to WP ${i + 1}/${waypoints.length}: (${wp.x}, ${wp.y}, ${wp.z})...`);
  await clearFireAhead();

  // Keep gaze low
  await bot.lookAt(new Vec3(wp.x, bot.entity.position.y - 0.4, wp.z));

  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 1.8));
  } catch (e) {
    try {
      await clearFireAhead();
      await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2.4));
    } catch (e2) {}
  }

  await clearFireAhead();
  try { await lib.pickup(3.5); } catch (e) {}

  // Check Endermen
  const nearbyEndermen = Object.values(bot.entities).filter(e =>
    e.name === 'enderman' && e.isValid && bot.entity.position.distanceTo(e.position) <= 6.0
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

  if (bot.health <= 6) {
    console.log(`Health low (${bot.health}), taking shelter.`);
    break;
  }
}

console.log(`Arrived at Fortress Bunker! Pos: ${lib.fmt(bot.entity.position)}`);

// Scan for Alpha and teammates
const teammates = Object.values(bot.entities).filter(e => e.type === 'player' && e.username !== bot.username);
console.log(`Teammates at Bunker (${teammates.length}):`);
for (const tm of teammates) {
  console.log(`  ${tm.username} at ${lib.fmt(tm.position)}`);
}

// Check nearby Piglins to barter
const piglins = Object.values(bot.entities).filter(e =>
  e.name === 'piglin' && e.isValid && bot.entity.position.distanceTo(e.position) <= 8.0
);
console.log(`Piglins at Bunker: ${piglins.length}`);

for (let b = 0; b < 2 && lib.count('gold_ingot') > 0 && piglins.length > 0; b++) {
  const pig = piglins[0];
  console.log(`Bartering gold ingot with Piglin at ${lib.fmt(pig.position)}...`);
  await bot.lookAt(pig.position, true);
  const ingot = bot.inventory.items().find(it => it.name === 'gold_ingot');
  if (ingot) {
    try {
      await bot.toss(ingot.type, null, 1);
      bot.chat('delta: Tossed gold ingot to neutral Piglin for barter!');
      await sleep(6500);
      await lib.pickup(6.0);
    } catch (e) {
      console.log('Barter error:', e.message);
    }
  }
}

const curPearls = lib.count('ender_pearl');
console.log(`Delta Ender Pearls: ${curPearls}/12`);
bot.chat(`delta: United at Bunker (44, 65, -131)! Pearls: ${curPearls}/12, Gold: ${lib.count('gold_ingot')}, HP: ${bot.health}/20.`);

return {
  pos: bot.entity.position,
  hp: bot.health,
  pearls: curPearls,
  gold: lib.count('gold_ingot'),
  teammates: teammates.map(t => t.username)
};
