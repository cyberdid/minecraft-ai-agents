// programs/524-warp-to-overworld-and-resupply.js
globalThis.isProgramCancelled = isCancelled;
const checkCancelled = () => (typeof globalThis.isProgramCancelled === 'function' ? globalThis.isProgramCancelled() : false);

console.log('=== DELTA: WARP TO OVERWORLD & RESUPPLY ===');
console.log(`Starting pos: ${lib.fmt(bot.entity.position)}, dim: ${bot.game.dimension}, HP: ${bot.health}, Food: ${bot.food}`);

bot.clearControlStates();
bot.pathfinder.stop();
bot.pathfinder.setGoal(null);

// Fire avoidance movements
const configureMoves = () => {
  const moves = new Movements(bot, mcData);
  if (mcData.blocksByName.fire) moves.blocksToAvoid.add(mcData.blocksByName.fire.id);
  if (mcData.blocksByName.soul_fire) moves.blocksToAvoid.add(mcData.blocksByName.soul_fire.id);
  if (mcData.blocksByName.lava) moves.blocksToAvoid.add(mcData.blocksByName.lava.id);
  moves.canDig = false;
  moves.allowParkour = false;
  bot.pathfinder.setMovements(moves);
};

configureMoves();

// Extinguish nearby fire
const clearFires = async () => {
  const fires = bot.findBlocks({
    matching: b => b && (b.name === 'fire' || b.name === 'soul_fire'),
    maxDistance: 6,
    count: 10
  });
  for (const fp of fires) {
    try {
      const b = bot.blockAt(fp);
      if (b) await bot.dig(b, true);
    } catch (e) {}
  }
};

if (bot.game.dimension === 'the_nether') {
  await clearFires();
  
  // Step 1: Walk to Portal Camp Bunker at (46, 65, -7)
  console.log('Walking to Portal Camp at (46, 65, -7)...');
  try {
    await bot.pathfinder.goto(new goals.GoalNear(46, 65, -7, 1.5));
  } catch (e) {
    console.log('Pathfind to (46, 65, -7) warning:', e.message);
  }

  // Step 2: Walk to Portal Frame at (46.5, 66.0, 2.0)
  console.log('Approaching portal frame at (46.5, 66.0, 2.0)...');
  try {
    await bot.pathfinder.goto(new goals.GoalNear(46.5, 66.0, 2.0, 1.5));
  } catch (e) {
    console.log('Pathfind to (46.5, 66, 2) warning:', e.message);
  }

  // Find portal block
  let portalBlock = bot.findBlock({ matching: b => b && b.name === 'nether_portal', maxDistance: 12 });
  if (!portalBlock) {
    console.log('Portal block not found within 12, checking 24...');
    portalBlock = bot.findBlock({ matching: b => b && b.name === 'nether_portal', maxDistance: 24 });
  }

  if (portalBlock) {
    console.log(`Found nether_portal block at ${lib.fmt(portalBlock.position)}! Entering...`);
    const pPos = portalBlock.position.offset(0.5, 0, 0.5);
    await bot.lookAt(pPos, true);
    try {
      await bot.pathfinder.goto(new goals.GoalBlock(portalBlock.position.x, portalBlock.position.y, portalBlock.position.z));
    } catch (e) {
      // Force step into portal
      bot.setControlState('forward', true);
      await sleep(1200);
      bot.setControlState('forward', false);
    }

    console.log('Holding in portal block to warp...');
    const warpStart = Date.now();
    while (bot.game.dimension !== 'overworld' && Date.now() - warpStart < 20000 && !checkCancelled()) {
      const cur = bot.entity.position;
      if (cur.distanceTo(pPos) > 0.8) {
        await bot.lookAt(pPos, true);
        bot.setControlState('forward', true);
        await sleep(300);
        bot.setControlState('forward', false);
      }
      await sleep(250);
    }
  } else {
    console.log('WARNING: nether_portal block not found near (46.5, 66, 2)!');
  }
}

bot.clearControlStates();
bot.pathfinder.stop();

console.log(`Dimension after portal step: ${bot.game.dimension}, pos: ${lib.fmt(bot.entity.position)}`);

if (bot.game.dimension === 'overworld') {
  // Step 3: Enter base house
  console.log('Navigating to base door at (294, 72, -54)...');
  try {
    await bot.pathfinder.goto(new goals.GoalNear(294, 72, -53, 1.5));
  } catch (e) {}

  if (bot.entity.position.z > -54.0) {
    console.log('Passing through base door...');
    try {
      await lib.goThroughDoor(294, 72, -54);
    } catch (e) {
      console.log('goThroughDoor error:', e.message);
    }
  }

  // Step 4: Approach Base Chest at (293, 72, -57)
  console.log('Approaching base chest at (293, 72, -57)...');
  try {
    await bot.pathfinder.goto(new goals.GoalNear(293, 72, -56, 1.0));
  } catch (e) {}

  const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
  if (chestBlock && chestBlock.name.includes('chest')) {
    const chest = await bot.openChest(chestBlock);
    const chestItems = chest.containerItems().map(i => ({ name: i.name, count: i.count }));
    console.log('=== BASE CHEST CONTENTS ===');
    console.log(JSON.stringify(chestItems));

    // Withdraw food to eat and carry
    const foods = chest.containerItems().filter(i => ['cooked_beef', 'cooked_mutton', 'cooked_porkchop', 'bread', 'apple', 'baked_potato'].includes(i.name));
    for (const f of foods) {
      const take = Math.min(f.count, 12);
      if (take > 0 && lib.count(f.name) < 12) {
        console.log(`Withdrawing food: ${f.name} x${take}`);
        await chest.withdraw(f.type, null, take);
      }
    }

    // Withdraw armor & shield
    for (const piece of ['iron_helmet', 'iron_chestplate', 'iron_leggings', 'iron_boots', 'shield', 'golden_boots']) {
      const it = chest.containerItems().find(i => i.name === piece);
      if (it && lib.count(piece) === 0) {
        console.log(`Withdrawing armor/gear: ${it.name}`);
        await chest.withdraw(it.type, null, 1);
      }
    }

    // Withdraw gold ingots to bring to Gamma
    const gold = chest.containerItems().find(i => i.name === 'gold_ingot');
    if (gold && gold.count > 0) {
      console.log(`Found ${gold.count} gold ingots in chest! Withdrawing up to 6...`);
      await chest.withdraw(gold.type, null, Math.min(gold.count, 6));
    }

    // Tally critical stage items
    const pearls = chest.containerItems().find(i => i.name === 'ender_pearl');
    const powder = chest.containerItems().find(i => i.name === 'blaze_powder');
    const rods = chest.containerItems().find(i => i.name === 'blaze_rod');
    const eyes = chest.containerItems().find(i => i.name === 'eye_of_ender');

    console.log(`STAGE AUDIT: Pearls=${pearls ? pearls.count : 0}, Powder=${powder ? powder.count : 0}, Rods=${rods ? rods.count : 0}, Eyes=${eyes ? eyes.count : 0}`);

    chest.close();
  }

  // Step 5: Eat food if available
  try {
    const edible = bot.inventory.items().find(i => ['cooked_beef', 'cooked_mutton', 'cooked_porkchop', 'bread', 'apple'].includes(i.name));
    if (edible && bot.food < 20) {
      console.log(`Eating ${edible.name}...`);
      await bot.equip(edible, 'hand');
      await bot.consume();
    }
  } catch (e) {
    console.log('Eat error:', e.message);
  }

  // Step 6: Equip armor and offhand shield
  try {
    await lib.equipArmor();
  } catch (e) {}

  try {
    const shield = bot.inventory.items().find(i => i.name === 'shield');
    if (shield && bot.inventory.slots[45]?.name !== 'shield') {
      await bot.equip(shield, 'off-hand');
    }
  } catch (e) {}

  try {
    await lib.equipWeapon();
  } catch (e) {}

  bot.chat(`delta: Overworld base resupply complete! HP: ${bot.health}, Food: ${bot.food}. Ready to support Nether team!`);
}

console.log('=== PROGRAM FINISHED ===');
console.log(`Final pos: ${lib.fmt(bot.entity.position)}, Dim: ${bot.game.dimension}`);
console.log(`Inventory:`, JSON.stringify(lib.inv()));

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  inv: lib.inv()
};
