console.log('=== DELTA: RETREAT TO BUNKER & BARTER / HUNT PEARLS ===');
console.log(`Starting pos: ${lib.fmt(bot.entity.position)}, HP: ${bot.health}`);

configureFireAvoidance();
try { await lib.equipArmor(); } catch (e) {}

// Waypoints from Pillbox back to Bunker (44, 65, -132)
const returnWaypoints = [
  { x: 38, y: 65, z: -176 },
  { x: 44, y: 65, z: -169 },
  { x: 44, y: 65, z: -160 },
  { x: 44, y: 65, z: -145 },
  { x: 44, y: 65, z: -132 }
];

for (let i = 0; i < returnWaypoints.length && !isCancelled(); i++) {
  const wp = returnWaypoints[i];
  console.log(`Retreating to waypoint ${i + 1}/${returnWaypoints.length}: (${wp.x}, ${wp.y}, ${wp.z})...`);
  
  await clearFireAhead();
  await bot.lookAt(new Vec3(wp.x, 64.0, wp.z));

  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 1.8));
  } catch (e) {
    try {
      await clearFireAhead();
      await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2.5));
    } catch (e2) {}
  }

  try { await lib.pickup(3.0); } catch (e) {}
}

console.log(`Arrived at Bunker! Pos: ${lib.fmt(bot.entity.position)}`);

// Search for Piglins nearby within 16m
const piglins = Object.values(bot.entities).filter(e =>
  e.name === 'piglin' && e.isValid && e.position.distanceTo(bot.entity.position) < 16
);
console.log(`Piglins near Bunker: ${piglins.length}`);

// If Piglins found and we hold gold_ingot, barter!
for (let b = 0; b < 2 && lib.count('gold_ingot') > 0 && piglins.length > 0; b++) {
  if (isCancelled()) break;
  const target = piglins[0];
  console.log(`Bartering gold ingot ${b + 1} with Piglin at ${lib.fmt(target.position)}...`);
  await bot.lookAt(target.position, true);
  try {
    const ingot = bot.inventory.items().find(i => i.name === 'gold_ingot');
    if (ingot) {
      await bot.toss(ingot.type, null, 1);
      bot.chat('delta: Tossed gold ingot to neutral Piglin for barter!');
      console.log('Tossed gold ingot! Waiting 6.5s for Piglin barter trade...');
      await sleep(6500);
      const picked = await lib.pickup(6.0);
      console.log(`Picked up barter drops: ${picked}`);
    }
  } catch (err) {
    console.log('Barter error:', err.message);
  }
}

// Check for Endermen within 16m
const endermen = Object.values(bot.entities).filter(e =>
  e.name === 'enderman' && e.isValid && e.position.distanceTo(bot.entity.position) < 16
);
console.log(`Endermen near Bunker: ${endermen.length}`);
for (const ender of endermen) {
  console.log(`  Enderman at ${lib.fmt(ender.position)} (dist ${bot.entity.position.distanceTo(ender.position).toFixed(1)}m)`);
  // If close enough and under 2-high ceiling, strike legs
  if (bot.entity.position.distanceTo(ender.position) < 4.5) {
    await bot.lookAt(ender.position.offset(0, 0.4, 0), true);
    bot.attack(ender);
    await sleep(600);
  }
}

try { await lib.pickup(6.0); } catch (e) {}

const pearls = lib.count('ender_pearl');
console.log(`Delta ender_pearls: ${pearls}`);
bot.chat(`delta: Bunker barter/hunt check complete. Ender Pearls: ${pearls}/12, Gold Ingots: ${lib.count('gold_ingot')}, HP: ${bot.health}/20.`);

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  pearls,
  ingots: lib.count('gold_ingot'),
  inv: lib.inv()
};
