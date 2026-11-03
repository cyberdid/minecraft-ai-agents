// programs/497-tower-to-bunker-and-craft.js
console.log('=== GAMMA: TOWER UP, RETRIEVE INGOT & CRAFT GOLDEN BOOTS ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// 1. Tower up from y=51 to y=64 using netherrack
const netherrack = bot.inventory.items().find(i => i.name === 'netherrack');
if (netherrack && bot.entity.position.y < 63.5) {
  console.log('Towering up with netherrack from y=' + bot.entity.position.y.toFixed(1) + ' to y=64...');
  await bot.equip(netherrack, 'hand');

  for (let step = 0; step < 16 && bot.entity.position.y < 63.8 && !isCancelled(); step++) {
    const under = bot.blockAt(bot.entity.position.offset(0, -1, 0));
    if (under) {
      await bot.lookAt(bot.entity.position.offset(0, -1, 0), true);
      bot.setControlState('jump', true);
      await sleep(250);
      try {
        await bot.placeBlock(under, new Vec3(0, 1, 0));
      } catch (e) {
        try { await lib.place('netherrack', bot.entity.position.x, bot.entity.position.y, bot.entity.position.z); } catch (e2) {}
      }
      bot.setControlState('jump', false);
      await sleep(200);
    }
  }
}

bot.clearControlStates();
console.log('Post-tower pos:', lib.fmt(bot.entity.position));

// 2. Walk to Nether portal at (40, 65, -7)
const netherMoves = new Movements(bot, mcData);
const avoidBlocks = [mcData.blocksByName.fire?.id, mcData.blocksByName.soul_fire?.id, mcData.blocksByName.lava?.id].filter(Boolean);
for (const id of avoidBlocks) netherMoves.blocksToAvoid.add(id);
netherMoves.canDig = true;
netherMoves.maxDropDown = 3;
netherMoves.allowParkour = true;
bot.pathfinder.setMovements(netherMoves);

console.log('Walking to Nether portal bunker (40, 65, -7)...');
try {
  await bot.pathfinder.goto(new goals.GoalNear(40, 65, -7, 1.5));
} catch (e) {
  try { await lib.goTo(40, 65, -7, 2.0, { timeoutMs: 10000 }); } catch (e2) {}
}

// 3. Step into return portal to warp to Overworld
if (bot.game.dimension === 'the_nether') {
  const portalBlock = bot.findBlock({ matching: b => b && b.name === 'nether_portal', maxDistance: 10 });
  if (portalBlock) {
    console.log('Stepping into return portal block at:', lib.fmt(portalBlock.position));
    try {
      await bot.pathfinder.goto(new goals.GoalNear(portalBlock.position.x, portalBlock.position.y, portalBlock.position.z, 0.4));
    } catch (e) {
      await bot.lookAt(portalBlock.position.offset(0.5, 0.5, 0.5), true);
      bot.setControlState('forward', true);
      await sleep(1000);
      bot.setControlState('forward', false);
    }

    const warpStart = Date.now();
    while (bot.game.dimension === 'the_nether' && Date.now() - warpStart < 20000 && !isCancelled()) {
      await sleep(250);
    }
  }
}

console.log('Dimension after warp:', bot.game.dimension, 'Pos:', lib.fmt(bot.entity.position));

// 4. In Overworld Base: enter house and retrieve Delta's deposited gold ingot from Base Chest
if (bot.game.dimension === 'overworld') {
  bot.chat('gamma: In Overworld! Accessing Base Chest to retrieve 4th gold ingot for golden_boots...');

  // Enter base house (294, 72, -55)
  try {
    await lib.door(294, 72, -54, true);
    await bot.pathfinder.goto(new goals.GoalNear(294, 72, -55.5, 0.5));
    await lib.door(294, 72, -54, false);
  } catch (e) {
    try { await lib.goThroughDoor(294, 72, -54); } catch (e2) {}
  }

  // Open Base Chest at (293, 72, -57)
  const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
  if (chestBlock) {
    try {
      const chest = await bot.openContainer(chestBlock);
      const ingotItem = chest.containerItems().find(i => i.name === 'gold_ingot');
      if (ingotItem) {
        await chest.withdraw(ingotItem.type, null, ingotItem.count);
        console.log(`Withdrew gold_ingot x${ingotItem.count} from Base Chest!`);
      }
      const nuggetItem = chest.containerItems().find(i => i.name === 'gold_nugget');
      if (nuggetItem) {
        await chest.withdraw(nuggetItem.type, null, nuggetItem.count);
      }
      chest.close();
    } catch (e) {
      console.log('Chest error:', e.message);
    }
  }

  console.log(`Gold now in inventory: ${lib.count('gold_ingot')} ingots, ${lib.count('gold_nugget')} nuggets`);

  // Craft golden_boots at Base Crafting Table (295, 72, -56)
  if (lib.count('gold_nugget') >= 9) {
    try { await lib.craft('gold_ingot', Math.floor(lib.count('gold_nugget') / 9)); } catch (e) {}
  }

  if (lib.count('gold_ingot') >= 4 && lib.count('golden_boots') === 0) {
    try {
      await lib.craft('golden_boots', 1);
      await lib.equipArmor();
      bot.chat('gamma: CRAFTED AND EQUIPPED GOLDEN BOOTS! 100% Piglin neutrality ACTIVE!');
      console.log('*** GOLDEN BOOTS EQUIPPED! PIGLIN NEUTRALITY ACTIVE! ***');
    } catch (e) {
      console.log('Craft boots error:', e.message);
    }
  }

  // Warp back to Nether wearing golden_boots!
  if (lib.count('golden_boots') > 0) {
    bot.chat('gamma: Returning to Nether wearing golden_boots to initiate Piglin bartering for Milestone 9!');
    try {
      await lib.door(294, 72, -54, true);
      await bot.pathfinder.goto(new goals.GoalNear(294, 72, -52.5, 0.5));
      await lib.door(294, 72, -54, false);
    } catch (e) {}

    try {
      await bot.pathfinder.goto(new goals.GoalNear(299.5, 73.0, -53.5, 0.4));
    } catch (e) {
      await lib.goToXZ(299.5, -53.5, { timeoutMs: 5000 });
    }

    const portalCenter = new Vec3(299.5, 73.0, -53.5);
    await bot.lookAt(portalCenter, true);
    bot.setControlState('forward', true);
    if (bot.entity.position.y < 72.8) bot.setControlState('jump', true);
    await sleep(350);
    bot.clearControlStates();

    const warpStart = Date.now();
    while (bot.game.dimension !== 'the_nether' && Date.now() - warpStart < 20000 && !isCancelled()) {
      await sleep(250);
    }
  }
}

const finalBoots = lib.count('golden_boots');
const finalIngots = lib.count('gold_ingot');
const finalPearls = lib.count('ender_pearl');

bot.chat(`gamma: Gear status: Golden Boots: ${finalBoots}, Barter Ingots: ${finalIngots}, Ender Pearls: ${finalPearls}/12, HP: ${bot.health.toFixed(1)}`);

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  boots: finalBoots,
  ingots: finalIngots,
  pearls: finalPearls,
  inv: lib.inv()
};
