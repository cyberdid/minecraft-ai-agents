console.log('=== DELTA: ADVANCE TO CROSS BRIDGE & BARTER PIGLINS ===');
console.log(`Starting pos: ${lib.fmt(bot.entity.position)}, HP: ${bot.health}`);

// Configure fire avoidance
configureFireAvoidance();
try { await lib.equipArmor(); } catch (e) {}

// March waypoints to Cross Bridge (38, 65, -176)
const bridgeWaypoints = [
  { x: 44, y: 65, z: -145 },
  { x: 44, y: 65, z: -160 },
  { x: 44, y: 65, z: -169 },
  { x: 38, y: 65, z: -176 }
];

for (let i = 0; i < bridgeWaypoints.length && !isCancelled(); i++) {
  await clearFireAhead();
  const wp = bridgeWaypoints[i];
  console.log(`Marching to stage ${i + 1}/${bridgeWaypoints.length}: (${wp.x}, ${wp.y}, ${wp.z})...`);

  // Past z=-165: sneak + shield defense
  if (wp.z <= -165) {
    bot.setControlState('sneak', true);
    bot.activateItem(true);
  } else {
    bot.setControlState('sneak', false);
    bot.deactivateItem();
  }

  // Keep gaze low
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

bot.setControlState('sneak', false);
bot.deactivateItem();

console.log(`Arrived near Cross Bridge! Pos: ${lib.fmt(bot.entity.position)}`);

// Search for neutral Piglins
const piglins = Object.values(bot.entities).filter(e =>
  e.name === 'piglin' && e.isValid && e.position.distanceTo(bot.entity.position) < 14
);
console.log(`Found ${piglins.length} Piglins near Cross Bridge:`);
for (const pig of piglins) {
  console.log(`  Piglin at ${lib.fmt(pig.position)} (dist ${bot.entity.position.distanceTo(pig.position).toFixed(1)}m)`);
}

// Barter with Piglin if we hold gold_ingot
for (let b = 0; b < 2 && lib.count('gold_ingot') > 0 && piglins.length > 0; b++) {
  if (isCancelled()) break;
  const target = piglins[0];
  console.log(`Bartering ingot ${b + 1} with Piglin at ${lib.fmt(target.position)}...`);
  await bot.lookAt(target.position, true);
  try {
    const ingot = bot.inventory.items().find(i => i.name === 'gold_ingot');
    if (ingot) {
      await bot.toss(ingot.type, null, 1);
      bot.chat('delta: Tossed gold ingot to neutral Piglin on Cross Bridge!');
      console.log('Tossed gold ingot! Waiting 6.5s for Piglin barter trade...');
      await sleep(6500);
      const picked = await lib.pickup(5.0);
      console.log(`Picked up barter drops: ${picked}`);
    }
  } catch (err) {
    console.log('Barter error:', err.message);
  }
}

// Pickup all nearby drops
try {
  await lib.pickup(6.0);
} catch (e) {}

console.log(`Delta ender_pearls: ${lib.count('ender_pearl')}`);
if (lib.count('ender_pearl') > 0) {
  bot.chat(`delta: Milestone 9 UPDATE — ${lib.count('ender_pearl')}/12 Ender Pearls acquired!`);
} else {
  bot.chat(`delta: Stationed at Cross Bridge with Beta! Neutrality active, searching for pearls.`);
}

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  pearls: lib.count('ender_pearl'),
  ingots: lib.count('gold_ingot'),
  inv: lib.inv()
};
