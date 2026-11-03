console.log('=== DELTA: SMOOTH MARCH TO FORTRESS BUNKER ===');
console.log(`Starting pos: ${lib.fmt(bot.entity.position)}, HP: ${bot.health}`);

// Configure movements: allow digging obstacle blocks, avoid fire and lava
const moves = new Movements(bot, mcData);
if (mcData.blocksByName.fire) moves.blocksToAvoid.add(mcData.blocksByName.fire.id);
if (mcData.blocksByName.soul_fire) moves.blocksToAvoid.add(mcData.blocksByName.soul_fire.id);
if (mcData.blocksByName.lava) moves.blocksToAvoid.add(mcData.blocksByName.lava.id);
moves.canDig = true;
moves.allowParkour = false;
bot.pathfinder.setMovements(moves);

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
  { x: 44, y: 65, z: -127 }
];

let lastPearls = lib.count('ender_pearl');

for (let i = 0; i < waypoints.length && !isCancelled(); i++) {
  const wp = waypoints[i];
  const target = new Vec3(wp.x, wp.y, wp.z);
  if (bot.entity.position.distanceTo(target) < 2.5) continue;

  console.log(`Advancing to WP ${i + 1}/${waypoints.length}: (${wp.x}, ${wp.y}, ${wp.z})...`);
  await clearFireAhead();
  await bot.lookAt(new Vec3(wp.x, bot.entity.position.y - 0.4, wp.z));

  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2.0));
  } catch (e) {
    try {
      await clearFireAhead();
      await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2.8));
    } catch (e2) {}
  }

  await clearFireAhead();
  try { await lib.pickup(3.5); } catch (e) {}

  // Check for nearby Endermen within 6m
  const nearbyEndermen = Object.values(bot.entities).filter(e =>
    e.name === 'enderman' && e.isValid && bot.entity.position.distanceTo(e.position) <= 6.0
  );

  for (const ender of nearbyEndermen) {
    if (bot.health < 8) break;
    console.log(`Enderman detected at ${lib.fmt(ender.position)}! Attacking legs...`);
    await bot.lookAt(ender.position.offset(0, 0.4, 0), true);
    if (bot.entity.position.distanceTo(ender.position) <= 4.2) {
      try { await lib.equipWeapon(); } catch (e) {}
      bot.attack(ender);
      await sleep(650);
      try { await lib.pickup(4.0); } catch (e) {}
    }
  }

  const curPearls = lib.count('ender_pearl');
  if (curPearls > lastPearls) {
    bot.chat(`delta: Picked up Ender Pearl! Total: ${curPearls}/12`);
    console.log(`Picked up Ender Pearl! Total: ${curPearls}/12`);
    lastPearls = curPearls;
  }

  if (bot.health <= 6) {
    console.log(`Health low (${bot.health}), pausing march.`);
    break;
  }
}

console.log(`Arrived at Bunker! Current pos: ${lib.fmt(bot.entity.position)}`);

// Look for Piglins nearby at Bunker to barter
const piglins = Object.values(bot.entities).filter(e =>
  e.name === 'piglin' && e.isValid && bot.entity.position.distanceTo(e.position) <= 8.0
);
console.log(`Piglins at Bunker: ${piglins.length}`);

for (let b = 0; b < 2 && lib.count('gold_ingot') > 0 && piglins.length > 0; b++) {
  const target = piglins[0];
  console.log(`Bartering gold ingot ${b + 1} with Piglin at ${lib.fmt(target.position)}...`);
  await bot.lookAt(target.position, true);
  const ingot = bot.inventory.items().find(i => i.name === 'gold_ingot');
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

const finalPearls = lib.count('ender_pearl');
console.log(`Delta Ender Pearls: ${finalPearls}/12`);
bot.chat(`delta: Arrived at Fortress Workshop Bunker (44, 65, -127)! Pearls: ${finalPearls}/12, Remaining Gold: ${lib.count('gold_ingot')}. United with Beta!`);

return {
  pos: bot.entity.position,
  hp: bot.health,
  pearls: finalPearls,
  gold: lib.count('gold_ingot'),
  inv: lib.inv()
};
