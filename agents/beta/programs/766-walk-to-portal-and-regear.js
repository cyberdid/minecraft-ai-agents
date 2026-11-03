// programs/766-walk-to-portal-and-regear.js
console.log('=== Program 766: Walk to Nether Portal (41, 65, 2) & Overworld Regear ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

bot.clearControlStates();
bot.pathfinder.stop();

const moves = new Movements(bot, mcData);
moves.canDig = true;
moves.allowParkour = false;
if (mcData.blocksByName.fire) moves.blocksToAvoid.add(mcData.blocksByName.fire.id);
if (mcData.blocksByName.soul_fire) moves.blocksToAvoid.add(mcData.blocksByName.soul_fire.id);
if (mcData.blocksByName.lava) moves.blocksToAvoid.add(mcData.blocksByName.lava.id);
bot.pathfinder.setMovements(moves);

// Step 1: In the_nether, walk via safe waypoints to Nether portal at (41, 65, 2)
if (bot.game.dimension === 'the_nether') {
  const waypoints = [
    new Vec3(35, 68, -18),
    new Vec3(40, 65, -8),
    new Vec3(41.5, 65, 2)
  ];

  for (const wp of waypoints) {
    if (isCancelled()) break;
    console.log(`Walking toward WP ${lib.fmt(wp)}...`);
    if (typeof globalThis.clearFireAhead === 'function') await globalThis.clearFireAhead();
    try {
      await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 1.8));
    } catch (e) {
      console.log(`Goto WP ${lib.fmt(wp)} note:`, e.message);
      try {
        await bot.lookAt(wp.offset(0.5, 0.5, 0.5), true);
        bot.setControlState('forward', true);
        await sleep(800);
        bot.setControlState('forward', false);
      } catch (e2) {}
    }
  }

  // Find portal blocks around (41, 65, 2)
  const portals = bot.findBlocks({
    matching: b => b && b.name === 'nether_portal',
    maxDistance: 8,
    count: 10
  });
  console.log(`Found ${portals.length} nether_portal blocks near portal camp:`, portals.map(p => lib.fmt(p)).join(', '));

  if (portals.length > 0) {
    portals.sort((a, b) => a.y - b.y || bot.entity.position.distanceTo(a) - bot.entity.position.distanceTo(b));
    const targetPortal = portals[0];
    console.log('Entering portal block at:', lib.fmt(targetPortal));

    const pCenter = targetPortal.offset(0.5, 0.2, 0.5);
    await bot.lookAt(pCenter, true);
    bot.setControlState('forward', true);
    if (bot.entity.position.y < targetPortal.y) bot.setControlState('jump', true);
    await sleep(600);
    bot.setControlState('jump', false);
    bot.setControlState('forward', false);

    console.log('Standing in portal, waiting for warp to Overworld...');
    const warpStart = Date.now();
    while (bot.game.dimension !== 'overworld' && Date.now() - warpStart < 25000 && !isCancelled()) {
      const cur = bot.entity.position;
      if (Math.abs(cur.x - pCenter.x) > 0.4 || Math.abs(cur.z - pCenter.z) > 0.4) {
        await bot.lookAt(pCenter, true);
        bot.setControlState('forward', true);
        await sleep(150);
        bot.setControlState('forward', false);
      }
      await sleep(250);
    }
  }
}

if (bot.game.dimension !== 'overworld') {
  console.log('Warp not completed; current pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
  return { dimension: bot.game.dimension, pos: bot.entity.position, hp: bot.health };
}

console.log('Successfully warped to Overworld! Pos:', lib.fmt(bot.entity.position));

// Step 2: Step out of portal into base room
try {
  await lib.goTo(294, 72, -56, 1.0, { timeoutMs: 5000 });
} catch (e) {}

// Step 3: Sleep if night
if (lib.time().canSleep) {
  console.log('Sleeping in bed to skip night...');
  try {
    await lib.sleepInBed();
    await sleep(3000);
  } catch (e) {}
}

// Step 4: Secure food
// Check base chest first
const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
if (chestBlock) {
  try {
    const chest = await bot.openChest(chestBlock);
    for (const item of chest.containerItems()) {
      if (['cooked_beef', 'cooked_porkchop', 'cooked_mutton', 'bread', 'apple', 'baked_potato'].includes(item.name)) {
        await chest.withdraw(item.type, null, item.count);
      }
    }
    await chest.close();
  } catch (e) {}
}

let foodCount = lib.count('cooked_beef') + lib.count('cooked_porkchop') + lib.count('cooked_mutton') + lib.count('bread') + lib.count('apple');
console.log('Food available:', foodCount);

if (foodCount === 0 && bot.food < 18) {
  console.log('Hunting cows/sheep near base for food...');
  try {
    await lib.hunt('cow', 2);
  } catch (e) {
    try { await lib.hunt('sheep', 2); } catch (e2) {}
  }

  // Smelt raw meat in base furnace at (295, 72, -55)
  if (lib.count('raw_beef') > 0) {
    console.log('Smelting raw beef...');
    try { await lib.smelt('raw_beef', '*_planks', lib.count('raw_beef')); } catch (e) {}
  } else if (lib.count('raw_mutton') > 0) {
    console.log('Smelting raw mutton...');
    try { await lib.smelt('raw_mutton', '*_planks', lib.count('raw_mutton')); } catch (e) {}
  }
}

// Eat food to heal
try {
  await lib.eat();
  console.log('Ate food! Food level:', bot.food);
} catch (e) {}

// Wait for health regeneration if food >= 18
if (bot.food >= 18 && bot.health < 20) {
  console.log('Healing up to full HP...');
  const healStart = Date.now();
  while (bot.health < 19 && Date.now() - healStart < 10000 && !isCancelled()) {
    await sleep(500);
  }
}

// Collect stone for pickaxes & blocks
if (lib.count('cobblestone') < 16) {
  try { await lib.collect('stone', 16 - lib.count('cobblestone')); } catch (e) {}
}
if (lib.count('stone_pickaxe') < 2 && lib.count('cobblestone') >= 3) {
  try { await lib.craft('stone_pickaxe', 2); } catch (e) {}
}

// Re-verify golden_boots on feet
if (bot.inventory.slots[8]?.name !== 'golden_boots') {
  const gb = bot.inventory.items().find(i => i.name === 'golden_boots');
  if (gb) await bot.equip(gb, 'feet');
}
try { await lib.equipArmor(); } catch (e) {}
try { await lib.equipWeapon(); } catch (e) {}

console.log('=== Final Status ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('HP:', bot.health, 'Food:', bot.food);
console.log('Wearing:', bot.inventory.slots[8]?.name);
console.log('Inventory:', lib.inv());

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  golden_boots: bot.inventory.slots[8]?.name === 'golden_boots',
  pickaxes: lib.count('*_pickaxe'),
  cobblestone: lib.count('cobblestone')
};
