// programs/480-mine-ridge-gold.js
globalThis.isProgramCancelled = isCancelled;
globalThis.isCancelled = isCancelled;

console.log('Delta starting Ridge Gold Expedition from:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);

// 1. Equip shield in offhand and best sword
try { await lib.equipArmor(); } catch (e) {}
try { await lib.equipWeapon(); } catch (e) {}
try {
  const shield = bot.inventory.items().find(i => i.name === 'shield');
  if (shield) await bot.equip(shield, 'off-hand');
} catch (e) {}

// 2. Warp to Nether if in Overworld
if (bot.game.dimension === 'overworld') {
  console.log('Stepping through Nether portal (299.5, 73, -54)...');
  // Walk to portal approach
  try {
    await bot.pathfinder.goto(new goals.GoalNear(299.5, 73.0, -54.0, 0.6));
  } catch (e) {
    try { await lib.goToXZ(299.5, -54.0, { timeoutMs: 5000 }); } catch (e2) {}
  }

  // Step into center
  const target = new Vec3(299.5, 73.0, -54.0);
  await bot.lookAt(target, true);
  bot.setControlState('forward', true);
  if (bot.entity.position.y < 72.8) bot.setControlState('jump', true);
  await sleep(600);
  bot.setControlState('jump', false);
  bot.setControlState('forward', false);

  bot.clearControlStates();
  bot.pathfinder.stop();
  bot.pathfinder.setGoal(null);

  const warpStart = Date.now();
  while (bot.game.dimension !== 'the_nether' && Date.now() - warpStart < 20000 && !isCancelled()) {
    await sleep(400);
  }
}

if (bot.game.dimension !== 'the_nether') {
  throw new Error(`Failed to enter the_nether: currently in ${bot.game.dimension} at ${lib.fmt(bot.entity.position)}`);
}

console.log('Now in the_nether at:', lib.fmt(bot.entity.position));
globalThis.configureFireAvoidance();

// 3. Step out of portal into safe bunker
if (bot.entity.position.distanceTo(new Vec3(40, 65, -7)) < 5.0) {
  await bot.lookAt(new Vec3(46.0, 65.0, -7.0), true);
  bot.setControlState('forward', true);
  await sleep(1000);
  bot.setControlState('forward', false);
}

// 4. Advance safely along East Ridge waypoints 0..3
const RIDGE_WPS = [
  { x: 46, y: 65, z: -7 },
  { x: 54, y: 65, z: -7 },
  { x: 63, y: 64, z: -7 },
  { x: 63, y: 65, z: -20 },
  { x: 63, y: 66, z: -35 }
];

bot.chat('delta: In Nether! Scouting East Ridge for nether_gold_ore for Milestone 9...');

for (let i = 0; i < RIDGE_WPS.length && !isCancelled(); i++) {
  const wp = RIDGE_WPS[i];
  const targetWp = new Vec3(wp.x, wp.y, wp.z);
  if (bot.entity.position.distanceTo(targetWp) < 2.5) continue;

  console.log(`Walking to Ridge WP ${i + 1}/${RIDGE_WPS.length} (${wp.x}, ${wp.y}, ${wp.z})...`);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 1.5));
  } catch (e) {
    try {
      await lib.goTo(wp.x, wp.y, wp.z, 2, { dig: false, timeoutMs: 6000 });
    } catch (e2) {}
  }

  // Scan for nether_gold_ore near this waypoint
  const goldOreId = mcData.blocksByName.nether_gold_ore?.id;
  if (goldOreId) {
    const ores = bot.findBlocks({
      matching: goldOreId,
      maxDistance: 8,
      count: 10
    });

    console.log(`WP ${i + 1}: Found ${ores.length} nether_gold_ore blocks.`);
    for (const orePos of ores) {
      if (isCancelled()) break;
      // Skip if over open lava
      const below = bot.blockAt(orePos.offset(0, -1, 0));
      if (below && below.name === 'lava') continue;

      try {
        await bot.pathfinder.goto(new goals.GoalNear(orePos.x, orePos.y, orePos.z, 2.5));
        const block = bot.blockAt(orePos);
        if (block && block.name === 'nether_gold_ore') {
          await bot.equip(mcData.itemsByName.stone_pickaxe.id, 'hand');
          console.log(`Mining nether_gold_ore at ${lib.fmt(orePos)}...`);
          await bot.dig(block);
          await sleep(200);
          try { await lib.pickup(3.5); } catch (e) {}
        }
      } catch (e) {}

      if (lib.count('gold_nugget') >= 36) break;
    }
  }

  if (lib.count('gold_nugget') >= 36) {
    console.log('Gathered 36+ gold nuggets for golden_boots!');
    break;
  }
}

// 5. Pickup remaining drops
try { await lib.pickup(4); } catch (e) {}

const totalNuggets = lib.count('gold_nugget');
console.log(`Mining round finished. Total gold nuggets: ${totalNuggets}`);

// 6. Craft ingots and golden_boots
if (totalNuggets >= 9) {
  const ingots = Math.floor(totalNuggets / 9);
  try {
    await lib.craft('gold_ingot', ingots);
    console.log(`Crafted ${ingots} gold_ingot! Total: ${lib.count('gold_ingot')}`);
  } catch (e) {
    console.log('Craft ingot note:', e.message);
  }
}

if (lib.count('gold_ingot') >= 4 && lib.count('golden_boots') === 0) {
  try {
    await lib.craft('golden_boots', 1);
    console.log('Crafted golden_boots!');
    bot.chat('delta: Crafted golden_boots! 100% Piglin neutrality achieved!');
    const gb = bot.inventory.items().find(i => i.name === 'golden_boots');
    if (gb) await bot.equip(gb, 'feet');
  } catch (e) {
    console.log('Craft boots note:', e.message);
  }
}

// 7. Equip weapon & offhand shield
try { await lib.equipWeapon(); } catch (e) {}
try {
  const shield = bot.inventory.items().find(i => i.name === 'shield');
  if (shield) await bot.equip(shield, 'off-hand');
} catch (e) {}

bot.chat(`delta: Ridge gold expedition complete! Nuggets: ${lib.count('gold_nugget')}, Ingots: ${lib.count('gold_ingot')}, Boots: ${lib.count('golden_boots')}.`);

return {
  pos: bot.entity.position,
  dim: bot.game.dimension,
  nuggets: lib.count('gold_nugget'),
  ingots: lib.count('gold_ingot'),
  boots: lib.count('golden_boots'),
  hp: bot.health,
  food: bot.food,
  inv: lib.inv()
};
