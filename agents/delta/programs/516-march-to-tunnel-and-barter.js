// programs/516-march-to-tunnel-and-barter.js
globalThis.isProgramCancelled = isCancelled;

const checkCancelled = () => (typeof globalThis.isProgramCancelled === 'function' ? globalThis.isProgramCancelled() : false);

console.log('=== DELTA: MARCH TO COVERED TUNNEL & ASSIST BARTERING ===');
console.log(`Starting pos: ${lib.fmt(bot.entity.position)}, Dim: ${bot.game.dimension}, HP: ${bot.health}`);

bot.clearControlStates();
bot.pathfinder.stop();
bot.pathfinder.setGoal(null);

// Local safe clearFireAhead helper
const clearFireAhead = async function () {
  const fires = bot.findBlocks({
    matching: b => b && (b.name === 'fire' || b.name === 'soul_fire'),
    maxDistance: 4.5,
    count: 5
  });
  for (const fp of fires) {
    try {
      const b = bot.blockAt(fp);
      if (b) await bot.dig(b, true);
    } catch (e) {}
  }
};

// Equip offhand shield and weapon
try {
  const shield = bot.inventory.items().find(i => i.name === 'shield');
  if (shield && bot.inventory.slots[45]?.name !== 'shield') {
    await bot.equip(shield, 'off-hand');
  }
  await lib.equipWeapon();
} catch (e) {}

// Movement configuration
const moves = new Movements(bot, mcData);
if (mcData.blocksByName.fire) moves.blocksToAvoid.add(mcData.blocksByName.fire.id);
if (mcData.blocksByName.soul_fire) moves.blocksToAvoid.add(mcData.blocksByName.soul_fire.id);
if (mcData.blocksByName.lava) moves.blocksToAvoid.add(mcData.blocksByName.lava.id);
moves.canDig = true;
moves.allowParkour = false;
bot.pathfinder.setMovements(moves);

// Nether waypoints to Covered Tunnel WP 16: (44, 65, -145)
const WAYPOINTS = [
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
  { x: 44, y: 65, z: -127 }, // Fortress Outpost Bunker
  { x: 44, y: 65, z: -145 }  // Covered Tunnel (Beta & Piglin)
];

// Find closest starting waypoint
let startIdx = 0;
for (let i = 0; i < WAYPOINTS.length; i++) {
  const wp = WAYPOINTS[i];
  if (bot.entity.position.distanceTo(new Vec3(wp.x, wp.y, wp.z)) < 4.5) {
    startIdx = i + 1;
  }
}

console.log(`Starting march from waypoint index ${startIdx}/${WAYPOINTS.length}...`);
bot.chat(`delta: Marching along safe waypoints to Covered Tunnel (44, 65, -145) to assist Beta & Gamma with Piglin bartering!`);

let pearlsHeld = lib.count('ender_pearl');

for (let i = startIdx; i < WAYPOINTS.length && !checkCancelled(); i++) {
  if (bot.game.dimension !== 'the_nether') break;

  const wp = WAYPOINTS[i];
  console.log(`--> Moving to WP ${i + 1}/${WAYPOINTS.length}: (${wp.x}, ${wp.y}, ${wp.z})...`);

  await clearFireAhead();

  // Pitch gaze low to avoid Enderman aggro while walking
  await bot.lookAt(new Vec3(wp.x, 64.0, wp.z));

  bot.deactivateItem();
  bot.setControlState('sneak', false);

  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 1.8));
  } catch (e) {
    try {
      await clearFireAhead();
      await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2.5));
    } catch (e2) {}
  }

  // Vacuum drops along the trail
  try { await lib.pickup(3.5); } catch (e) {}

  // Check for teammates nearby
  for (const name of ['beta', 'gamma', 'alpha']) {
    const p = bot.players[name];
    if (p && p.entity) {
      const d = bot.entity.position.distanceTo(p.entity.position);
      if (d <= 8.0) {
        console.log(`Teammate ${name} within 8m at ${lib.fmt(p.entity.position)}!`);
      }
    }
  }

  // Check for newly acquired pearls
  const curPearls = lib.count('ender_pearl');
  if (curPearls > pearlsHeld) {
    pearlsHeld = curPearls;
    bot.chat(`delta: Acquired Ender Pearl! Total held: ${pearlsHeld}/12!`);
  }

  if (bot.health <= 8) {
    console.log(`Delta HP low (${bot.health}), taking shelter.`);
    bot.activateItem(true);
    break;
  }
}

console.log(`=== ARRIVED AT COVERED TUNNEL AREA ===`);
console.log(`Current pos: ${lib.fmt(bot.entity.position)}, HP: ${bot.health}`);

// Once in Covered Tunnel area, conduct 45-second bartering support loop
const supportStart = Date.now();
while (Date.now() - supportStart < 45000 && bot.game.dimension === 'the_nether' && !checkCancelled()) {
  // Check for nearby dropped items to vacuum (bartered goods, pearls)
  const items = Object.values(bot.entities).filter(e =>
    e.name === 'item' &&
    bot.entity.position.distanceTo(e.position) <= 8.0
  );

  for (const it of items) {
    try {
      await bot.pathfinder.goto(new goals.GoalNear(it.position.x, it.position.y, it.position.z, 0.5));
    } catch (e) {}
  }

  // Check for Enderman in melee reach to safely attack from under covered 2-high roof
  const endermen = Object.values(bot.entities).filter(e =>
    e.name === 'enderman' &&
    e.isValid &&
    bot.entity.position.distanceTo(e.position) <= 4.0
  );
  if (endermen.length > 0) {
    const target = endermen[0];
    console.log(`Enderman in reach at ${lib.fmt(target.position)}! Striking safely from under covered roof...`);
    await bot.lookAt(target.position.offset(0, 0.8, 0), true);
    await lib.equipWeapon();
    bot.attack(target);
    await sleep(400);
  }

  // Check pearl count update
  const curPearls = lib.count('ender_pearl');
  if (curPearls > pearlsHeld) {
    pearlsHeld = curPearls;
    bot.chat(`delta: Acquired Ender Pearl! Total held: ${pearlsHeld}/12!`);
  }

  await sleep(1000);
}

const finalPearls = lib.count('ender_pearl');
console.log(`=== COVERED TUNNEL PATROL COMPLETE ===`);
console.log(`Pos: ${lib.fmt(bot.entity.position)}, HP: ${bot.health}`);
console.log(`Ender Pearls: ${finalPearls}/12, Inv:`, lib.inv());

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  pearls: finalPearls,
  inv: lib.inv()
};
