// programs/485-return-to-base-craft-boots.js
console.log('=== GAMMA: RETURN TO OVERWORLD BASE & CRAFT GOLDEN BOOTS ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// 1. Configure Nether movement up to portal
const netherMoves = new Movements(bot, mcData);
const avoidBlocks = [mcData.blocksByName.fire?.id, mcData.blocksByName.soul_fire?.id, mcData.blocksByName.lava?.id].filter(Boolean);
for (const id of avoidBlocks) netherMoves.blocksToAvoid.add(id);
netherMoves.canDig = true;
netherMoves.maxDropDown = 3;
netherMoves.allowParkour = true;
bot.pathfinder.setMovements(netherMoves);

// Intermediate slope waypoints up to bunker floor (y=65)
const CLIMB_WAYPOINTS = [
  { x: 52, y: 62, z: 0 },
  { x: 46, y: 65, z: -5 },
  { x: 40, y: 65, z: -7 }
];

for (const wp of CLIMB_WAYPOINTS) {
  if (bot.game.dimension !== 'the_nether') break;
  console.log(`Climbing towards (${wp.x}, ${wp.y}, ${wp.z}) from`, lib.fmt(bot.entity.position));
  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 1.5));
  } catch (e) {
    try {
      await lib.goTo(wp.x, wp.y, wp.z, 2.0, { timeoutMs: 10000 });
    } catch (e2) {}
  }
}

// 2. Step into Nether portal block at (40, 65, -7) to warp to Overworld
if (bot.game.dimension === 'the_nether') {
  const portalBlock = bot.findBlock({
    matching: b => b && b.name === 'nether_portal',
    maxDistance: 12
  });

  if (portalBlock) {
    console.log('Stepping into return portal at:', lib.fmt(portalBlock.position));
    try {
      await bot.pathfinder.goto(new goals.GoalNear(portalBlock.position.x, portalBlock.position.y, portalBlock.position.z, 0.4));
    } catch (e) {
      await bot.lookAt(portalBlock.position.offset(0.5, 0.5, 0.5), true);
      bot.setControlState('forward', true);
      await sleep(1000);
      bot.setControlState('forward', false);
    }

    bot.clearControlStates();
    const warpStart = Date.now();
    while (bot.game.dimension === 'the_nether' && Date.now() - warpStart < 25000 && !isCancelled()) {
      await sleep(250);
    }
  }
}

console.log('Post-warp dimension:', bot.game.dimension, 'pos:', lib.fmt(bot.entity.position));

// 3. In Overworld Base: enter house at (294, 72, -55)
if (bot.game.dimension === 'overworld') {
  bot.chat('gamma: Returned to Overworld base! Accessing chest and crafting golden_boots...');

  // Step through base door (294, 72, -54)
  try {
    await lib.door(294, 72, -54, true);
    await bot.pathfinder.goto(new goals.GoalNear(294, 72, -55.5, 0.5));
    await lib.door(294, 72, -54, false);
  } catch (e) {
    try { await lib.goThroughDoor(294, 72, -54); } catch (e2) {}
  }

  // 4. Open Base Chest at (293, 72, -57) and withdraw gold
  const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
  if (chestBlock) {
    try {
      const chest = await bot.openContainer(chestBlock);
      console.log('Base Chest items:');
      for (const item of chest.containerItems()) {
        console.log(`- ${item.name} x${item.count}`);
        if (item.name === 'gold_ingot' || item.name === 'gold_nugget') {
          await chest.withdraw(item.type, null, item.count);
          console.log(`Withdrew ${item.name} x${item.count}`);
        }
      }
      chest.close();
    } catch (e) {
      console.log('Chest error:', e.message);
    }
  }

  // 5. Craft golden_boots at base Crafting Table (295, 72, -56)
  const totalNuggets = lib.count('gold_nugget');
  const totalIngots = lib.count('gold_ingot');
  console.log(`Total gold available: ${totalNuggets} nuggets, ${totalIngots} ingots`);

  try {
    const needIngots = Math.max(0, 4 - lib.count('gold_ingot'));
    if (needIngots > 0 && totalNuggets >= needIngots * 9) {
      await lib.craft('gold_ingot', needIngots);
    }
    if (lib.count('gold_ingot') >= 4 && lib.count('golden_boots') === 0) {
      await lib.craft('golden_boots', 1);
      await lib.equipArmor();
      bot.chat('gamma: CRAFTED AND EQUIPPED GOLDEN BOOTS! 100% Piglin neutrality ACTIVE!');
      console.log('Golden boots equipped!');
    }
  } catch (e) {
    console.log('Crafting boots error:', e.message);
  }

  // Craft extra nuggets into ingots for bartering
  const remainingNuggets = lib.count('gold_nugget');
  if (remainingNuggets >= 9) {
    try {
      const extraIngots = Math.floor(remainingNuggets / 9);
      await lib.craft('gold_ingot', extraIngots);
      console.log(`Crafted ${extraIngots} additional gold ingots for bartering!`);
    } catch (e) {}
  }

  // Sleep if night time
  if (bot.time.timeOfDay >= 12542 || bot.time.timeOfDay <= 500) {
    try { await lib.sleep(); } catch (e) {}
  }
}

const finalBoots = lib.count('golden_boots');
const finalIngots = lib.count('gold_ingot');
bot.chat(`gamma: Base gear complete. Golden Boots: ${finalBoots}, Gold Ingots for bartering: ${finalIngots}, HP: ${bot.health.toFixed(1)}`);

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  boots: finalBoots,
  ingots: finalIngots,
  nuggets: lib.count('gold_nugget'),
  inv: lib.inv()
};
