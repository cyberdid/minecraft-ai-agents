// programs/806-safe-march-to-gamma.js
globalThis.isProgramCancelled = isCancelled;
console.log('=== Program 806: Safe March to Gamma at Bunker Corridor ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

bot.clearControlStates();
bot.pathfinder.stop();

// Ensure golden boots on feet and shield in offhand
if (bot.inventory.slots[8]?.name !== 'golden_boots') {
  const gb = bot.inventory.items().find(i => i.name === 'golden_boots');
  if (gb) {
    try { await bot.equip(gb, 'feet'); console.log('Equipped golden_boots on feet'); } catch (e) {}
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

// Step 1: If in overworld, enter Nether portal
if (bot.game.dimension === 'overworld') {
  bot.chat('Beta: Warping through Nether portal to join Gamma at Bunker corridor (44, 65, -133)!');
  
  // Withdraw extra cobble from chest if passing base
  const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
  if (chestBlock && lib.count('cobblestone') < 16) {
    try {
      const chest = await bot.openChest(chestBlock);
      const cob = chest.items().find(i => i.name === 'cobblestone');
      if (cob) await chest.withdraw(cob.type, null, Math.min(cob.count, 20));
      await chest.close();
    } catch (e) {}
  }

  const result = await globalThis.enterNetherPortal();
  console.log('enterNetherPortal result:', JSON.stringify(result));
}

if (bot.game.dimension !== 'the_nether') {
  console.log('Not in Nether yet. Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
  return { dimension: bot.game.dimension, pos: bot.entity.position };
}

console.log('Successfully in the_nether at:', lib.fmt(bot.entity.position));

// Step 2: Safe waypoints avoiding cliff drops
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
  new Vec3(44.0, 65, -133) // Crafting table & Gamma
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

  // Check floor under target
  const floorBlock = bot.blockAt(new Vec3(wp.x, 64, wp.z));
  if (!floorBlock || floorBlock.boundingBox !== 'block') {
    console.log(`Warning: Floor not solid at (${wp.x}, 64, ${wp.z})! Bridging floor...`);
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

bot.chat(`Beta: Arrived at Fortress Bunker (${lib.fmt(bot.entity.position)})! HP: ${bot.health.toFixed(1)}/20. Teaming up with Gamma for Milestone 9 gold & pearls!`);

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  golden_boots: bot.inventory.slots[8]?.name === 'golden_boots',
  teammates: teammates.length
};
