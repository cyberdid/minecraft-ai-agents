// programs/507-march-to-covered-tunnel.js
console.log('=== GAMMA: MARCH TO COVERED TUNNEL (44, 65, -145) & BARTER ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

if (bot.game.dimension !== 'the_nether') {
  throw new Error('Not in the_nether!');
}

// Local robust fire clearing helper
const clearFireAround = async (dist = 5.0) => {
  const fires = bot.findBlocks({
    matching: b => b && (b.name === 'fire' || b.name === 'soul_fire'),
    maxDistance: dist,
    count: 10
  });
  for (const fp of fires) {
    try {
      const b = bot.blockAt(fp);
      if (b) {
        console.log(`Clearing ${b.name} at ${lib.fmt(b.position)}`);
        await bot.dig(b, true);
      }
    } catch (e) {}
  }
};

// Configure pathfinder movements to strictly avoid fire, soul_fire, and lava
const moves = new Movements(bot, mcData);
if (mcData.blocksByName.fire) moves.blocksToAvoid.add(mcData.blocksByName.fire.id);
if (mcData.blocksByName.soul_fire) moves.blocksToAvoid.add(mcData.blocksByName.soul_fire.id);
if (mcData.blocksByName.lava) moves.blocksToAvoid.add(mcData.blocksByName.lava.id);
moves.canDig = false;
moves.allowParkour = false;
bot.pathfinder.setMovements(moves);

try { await lib.equipArmor(); } catch (e) {}
try { await lib.equipWeapon(); } catch (e) {}

// Waypoints to march from Nether Portal Camp to Covered Tunnel (WP 0 to 15)
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
  { x: 44, y: 65, z: -127 }, // Fortress Workshop Bunker
  { x: 44, y: 65, z: -145 }  // Covered Tunnel
];

let startIdx = 0;
for (let i = 0; i < WAYPOINTS.length; i++) {
  const wp = WAYPOINTS[i];
  if (bot.entity.position.distanceTo(new Vec3(wp.x, wp.y, wp.z)) < 3.5) {
    startIdx = i + 1;
  }
}

console.log(`Starting march from WP index ${startIdx}/${WAYPOINTS.length}...`);
bot.chat(`gamma: Marching along safe East Ridge to Covered Tunnel (44, 65, -145) to barter! Golden boots equipped.`);

for (let i = startIdx; i < WAYPOINTS.length; i++) {
  if (isCancelled()) break;
  if (bot.game.dimension !== 'the_nether') break;

  await clearFireAround(5.0);

  const wp = WAYPOINTS[i];
  const target = new Vec3(wp.x, wp.y, wp.z);

  // Skip if already within range
  if (bot.entity.position.distanceTo(target) < 2.0) continue;

  console.log(`Advancing to WP ${i + 1}/${WAYPOINTS.length}: (${wp.x}, ${wp.y}, ${wp.z})`);

  // Low gaze to avoid Enderman aggro
  await bot.lookAt(new Vec3(wp.x, 64.0, wp.z));

  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 1.8));
  } catch (e) {
    try {
      await clearFireAround(5.0);
      await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2.5));
    } catch (e2) {}
  }

  await clearFireAround(5.0);
  try { await lib.pickup(3.0); } catch (e) {}

  // If reached covered tunnel at z <= -140, stop march
  if (bot.entity.position.z <= -140) {
    console.log(`Arrived at covered tunnel area! Pos: ${lib.fmt(bot.entity.position)}`);
    break;
  }

  if (bot.health <= 7) {
    console.log(`HP low (${bot.health}), pausing march in cover!`);
    break;
  }
}

console.log('March complete. Final pos:', lib.fmt(bot.entity.position));

// Check nearby players
const nearbyTeammates = Object.values(bot.entities).filter(e =>
  e.type === 'player' && e.username !== bot.username && bot.entity.position.distanceTo(e.position) <= 20
).map(p => `${p.username} (${bot.entity.position.distanceTo(p.position).toFixed(1)}m)`);
console.log('Teammates nearby:', nearbyTeammates.join(', ') || 'none');

// Look for Piglins to barter with
let initialPearls = lib.count('ender_pearl');
let barteredCount = 0;

const getPiglins = () => {
  return Object.values(bot.entities).filter(e =>
    e.name === 'piglin' &&
    e.isValid &&
    bot.entity.position.distanceTo(e.position) <= 14
  ).sort((a, b) => bot.entity.position.distanceTo(a.position) - bot.entity.position.distanceTo(b.position));
};

let piglins = getPiglins();
console.log(`Piglins within 14m: ${piglins.length}`);

while (lib.count('gold_ingot') > 0 && piglins.length > 0 && !isCancelled()) {
  const p = piglins[0];
  const dist = bot.entity.position.distanceTo(p.position);
  console.log(`Bartering with Piglin at ${lib.fmt(p.position)} (dist: ${dist.toFixed(1)}m)...`);

  // Move to comfortable 3m distance
  if (dist > 4.0) {
    try {
      await bot.pathfinder.goto(new goals.GoalNear(p.position.x, p.position.y, p.position.z, 3.0));
    } catch (e) {}
  }

  const goldItem = bot.inventory.items().find(i => i.name === 'gold_ingot');
  if (!goldItem) break;

  await bot.lookAt(p.position.offset(0, 1.2, 0), true);
  await bot.toss(goldItem.type, null, 1);
  barteredCount++;
  bot.chat(`gamma: Tossed gold_ingot #${barteredCount} to Piglin! Waiting 8s for loot...`);

  // Wait 8s for inspection
  await sleep(8000);

  // Vacuum drops
  await lib.pickup(6.0);

  const curPearls = lib.count('ender_pearl');
  if (curPearls > initialPearls) {
    bot.chat(`gamma: GOT ENDER PEARL! Team total: ${curPearls}/12!`);
    console.log(`*** GOT ENDER PEARL! COUNT: ${curPearls}/12 ***`);
    initialPearls = curPearls;
  }

  piglins = getPiglins();
}

const finalPearls = lib.count('ender_pearl');
const finalIngots = lib.count('gold_ingot');
bot.chat(`gamma: At ${lib.fmt(bot.entity.position)}. Bartered: ${barteredCount}, Ingots: ${finalIngots}, Pearls: ${finalPearls}/12, HP: ${bot.health.toFixed(1)}`);

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  ingots: finalIngots,
  pearls: finalPearls,
  bartered: barteredCount,
  teammates: nearbyTeammates,
  inv: lib.inv()
};
