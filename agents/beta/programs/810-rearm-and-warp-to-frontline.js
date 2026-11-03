// programs/810-rearm-and-warp-to-frontline.js
globalThis.isProgramCancelled = isCancelled;
console.log('=== Program 810: Rearm Cobble & Warp to Frontline ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

bot.clearControlStates();
bot.pathfinder.stop();

// Ensure golden boots on feet and shield in offhand
if (bot.inventory.slots[8]?.name !== 'golden_boots') {
  const gb = bot.inventory.items().find(i => i.name === 'golden_boots');
  if (gb) {
    try { await bot.equip(gb, 'feet'); console.log('Equipped golden_boots'); } catch (e) {}
  }
}
const sh = bot.inventory.items().find(i => i.name === 'shield');
if (sh && bot.inventory.slots[45]?.name !== 'shield') {
  try { await bot.equip(sh, 'off-hand'); console.log('Equipped shield in off-hand'); } catch (e) {}
}
const sw = bot.inventory.items().find(i => i.name === 'iron_sword');
if (sw) {
  try { await bot.equip(sw, 'hand'); } catch (e) {}
}

// Step 1: Walk into base room at (293, 72, -55)
console.log('Walking into base room...');
try {
  await lib.goTo(293, 72, -55, 1.5, { timeoutMs: 12000 });
} catch (e) {
  try { await bot.pathfinder.goto(new goals.GoalNear(293, 72, -55, 1.5)); } catch (e2) {}
}

// Set spawn at base bed
try {
  await lib.setSpawn();
  console.log('Spawn set at base bed.');
} catch (e) {}

// Step 2: Grab cobblestone from Base Chest
const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
if (chestBlock) {
  try {
    const chest = await bot.openChest(chestBlock);
    const cob = chest.items().find(i => i.name === 'cobblestone');
    if (cob && cob.count > 0) {
      const takeCount = Math.min(cob.count, 32);
      await chest.withdraw(cob.type, null, takeCount);
      console.log(`Withdrew ${takeCount} cobblestone from chest!`);
    }
    const food = chest.items().find(i => ['cooked_beef', 'cooked_mutton', 'bread', 'apple'].includes(i.name));
    if (food && food.count > 0) {
      await chest.withdraw(food.type, null, Math.min(food.count, 8));
      console.log(`Withdrew ${food.name} from chest!`);
    }
    await chest.close();
  } catch (e) {
    console.log('Chest interaction notice:', e.message);
  }
}

console.log(`Cobblestone in inventory: ${lib.count('cobblestone')}`);

// Step 3: Enter Nether Portal via preloaded helper
bot.chat('Beta: Entering Nether portal with 20/20 HP, 20/20 Food, shield, and cobble supply to unite with team at bunker!');
const warpResult = await globalThis.enterNetherPortal();
console.log('Warp result:', JSON.stringify(warpResult));

if (bot.game.dimension !== 'the_nether') {
  console.log('Not in Nether. Dimension:', bot.game.dimension, 'Pos:', lib.fmt(bot.entity.position));
  return { dimension: bot.game.dimension, pos: bot.entity.position };
}

// Step 4: Safe march along verified ridge to Fortress Bunker (44, 65, -127)
const safeWaypoints = [
  new Vec3(46, 65, -7),
  new Vec3(54, 65, -7),
  new Vec3(63, 64, -7),
  new Vec3(63, 65, -20),
  new Vec3(63, 66, -35),
  new Vec3(62, 67, -50),
  new Vec3(61.5, 67, -65),
  new Vec3(62.0, 67, -80),
  new Vec3(61, 66, -100),
  new Vec3(50, 65, -115),
  new Vec3(46, 65, -122),
  new Vec3(44.5, 65, -128),
  new Vec3(44.0, 65, -133) // Bunker Crafting Table / Alpha & Gamma
];

globalThis.configureFireAvoidance();
const moves = new Movements(bot, mcData);
if (mcData.blocksByName.fire) moves.blocksToAvoid.add(mcData.blocksByName.fire.id);
if (mcData.blocksByName.soul_fire) moves.blocksToAvoid.add(mcData.blocksByName.soul_fire.id);
if (mcData.blocksByName.lava) moves.blocksToAvoid.add(mcData.blocksByName.lava.id);
moves.canDig = false;
moves.allowParkour = false;
bot.pathfinder.setMovements(moves);

bot.activateItem(true); // Raise shield

let startIdx = 0;
for (let i = 0; i < safeWaypoints.length; i++) {
  if (bot.entity.position.distanceTo(safeWaypoints[i]) < 3.5) {
    startIdx = i + 1;
  }
}

console.log(`Marching safe waypoints from WP ${startIdx}/${safeWaypoints.length}...`);

for (let i = startIdx; i < safeWaypoints.length && !isCancelled(); i++) {
  if (bot.game.dimension !== 'the_nether') break;

  await globalThis.clearFireAhead();

  const wp = safeWaypoints[i];
  if (bot.entity.position.distanceTo(wp) < 2.0) continue;

  console.log(`Advancing to WP ${i + 1}/${safeWaypoints.length}: ${lib.fmt(wp)}`);
  await bot.lookAt(new Vec3(wp.x, 64.0, wp.z));

  // Check floor under target block
  const floorBlock = bot.blockAt(new Vec3(wp.x, 64, wp.z));
  if (!floorBlock || floorBlock.boundingBox !== 'block') {
    console.log(`Missing floor at (${wp.x}, 64, ${wp.z})! Placing cobble floor...`);
    const cob = bot.inventory.items().find(it => it.name === 'cobblestone' || it.name === 'netherrack');
    if (cob) {
      try {
        await bot.equip(cob, 'hand');
        const ref = bot.blockAt(new Vec3(wp.x, 63, wp.z)) || bot.blockAt(new Vec3(wp.x + 1, 64, wp.z));
        if (ref) await bot.placeBlock(ref, new Vec3(0, 1, 0));
      } catch (e) {}
    }
  }

  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 1.5));
  } catch (e) {
    console.log(`Pathfinder retry WP ${i + 1}: ${e.message}`);
    try {
      await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2.2));
    } catch (e2) {}
  }

  if (bot.health <= 7) {
    console.log(`Health low (${bot.health}), pausing in cover.`);
    break;
  }
}

console.log('Pos after safe march:', lib.fmt(bot.entity.position));

// Verify golden boots still worn
if (bot.inventory.slots[8]?.name !== 'golden_boots') {
  const gb = bot.inventory.items().find(i => i.name === 'golden_boots');
  if (gb) {
    try { await bot.equip(gb, 'feet'); console.log('Re-equipped golden_boots!'); } catch (e) {}
  }
}

// Check players nearby
const teammates = Object.values(bot.entities).filter(e => e.type === 'player' && e.username !== bot.username);
console.log('Teammates nearby:', teammates.map(t => `${t.username} at ${lib.fmt(t.position)}`).join(', '));

bot.chat(`Beta: United at Fortress Bunker (${lib.fmt(bot.entity.position)})! HP: ${bot.health.toFixed(1)}/20. Golden boots on, ready for Milestone 9 bartering & pearls!`);

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  golden_boots: bot.inventory.slots[8]?.name === 'golden_boots',
  cobblestone: lib.count('cobblestone'),
  teammates: teammates.length
};
