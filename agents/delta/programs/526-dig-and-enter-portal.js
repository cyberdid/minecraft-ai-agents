// programs/526-dig-and-enter-portal.js
globalThis.isProgramCancelled = isCancelled;
const checkCancelled = () => (typeof globalThis.isProgramCancelled === 'function' ? globalThis.isProgramCancelled() : false);

console.log('=== DELTA: DIG TO NETHER PORTAL & WARP ===');
console.log(`Starting pos: ${lib.fmt(bot.entity.position)}, HP: ${bot.health}, Food: ${bot.food}`);

bot.clearControlStates();
bot.pathfinder.stop();
bot.pathfinder.setGoal(null);

const portalTarget = new Vec3(47, 66, 2);

// Function to clear any fire or soul fire in 5m
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

  const moves = new Movements(bot, mcData);
  if (mcData.blocksByName.fire) moves.blocksToAvoid.add(mcData.blocksByName.fire.id);
  if (mcData.blocksByName.soul_fire) moves.blocksToAvoid.add(mcData.blocksByName.soul_fire.id);
  if (mcData.blocksByName.lava) moves.blocksToAvoid.add(mcData.blocksByName.lava.id);
  moves.canDig = true;
  moves.allowParkour = true;
  bot.pathfinder.setMovements(moves);

  console.log(`Navigating to portal at ${lib.fmt(portalTarget)}...`);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(portalTarget.x, portalTarget.y, portalTarget.z, 1.2));
  } catch (e) {
    console.log(`Pathfinder notice: ${e.message}. Attempting direct navigation...`);
    // Direct step: look at portal, clear obstacles, move forward
    for (let step = 0; step < 25 && bot.entity.position.distanceTo(portalTarget) > 1.5 && !checkCancelled(); step++) {
      await clearFires();
      const p = bot.entity.position;
      const dir = portalTarget.minus(p).normalize();
      const nextPos = p.plus(dir);
      
      // Clear head and feet block if solid
      const blockFeet = bot.blockAt(nextPos);
      const blockHead = bot.blockAt(nextPos.offset(0, 1, 0));
      if (blockFeet && blockFeet.boundingBox === 'block' && !blockFeet.name.includes('portal')) {
        try { await bot.dig(blockFeet); } catch (e) {}
      }
      if (blockHead && blockHead.boundingBox === 'block' && !blockHead.name.includes('portal')) {
        try { await bot.dig(blockHead); } catch (e) {}
      }

      await bot.lookAt(portalTarget.offset(0.5, 1, 0.5), true);
      bot.setControlState('forward', true);
      if (p.y < portalTarget.y) bot.setControlState('jump', true);
      await sleep(500);
      bot.setControlState('jump', false);
      bot.setControlState('forward', false);
    }
  }

  // Find exact portal block
  let pBlock = bot.findBlock({ matching: b => b && b.name === 'nether_portal', maxDistance: 8 });
  if (!pBlock) {
    pBlock = bot.findBlock({ matching: b => b && b.name === 'nether_portal', maxDistance: 16 });
  }

  if (pBlock) {
    console.log(`Standing in nether_portal block at ${lib.fmt(pBlock.position)}...`);
    const center = pBlock.position.offset(0.5, 0, 0.5);
    await bot.lookAt(center, true);
    bot.setControlState('forward', true);
    await sleep(600);
    bot.setControlState('forward', false);

    const warpStart = Date.now();
    while (bot.game.dimension !== 'overworld' && Date.now() - warpStart < 20000 && !checkCancelled()) {
      const cur = bot.entity.position;
      if (cur.distanceTo(center) > 0.8) {
        await bot.lookAt(center, true);
        bot.setControlState('forward', true);
        await sleep(300);
        bot.setControlState('forward', false);
      }
      await sleep(250);
    }
  } else {
    console.log('Portal block not found within 16m!');
  }
}

bot.clearControlStates();
bot.pathfinder.stop();

console.log(`Dimension after portal: ${bot.game.dimension}, pos: ${lib.fmt(bot.entity.position)}`);

if (bot.game.dimension === 'overworld') {
  // Step into base house
  if (bot.entity.position.z > -54.0) {
    console.log('Entering base house via door (294, 72, -54)...');
    try {
      await lib.goThroughDoor(294, 72, -54);
    } catch (e) {
      console.log('Door error:', e.message);
    }
  }

  // Open base chest
  console.log('Accessing base chest at (293, 72, -57)...');
  try {
    await bot.pathfinder.goto(new goals.GoalNear(293, 72, -56, 1.0));
  } catch (e) {}

  const cBlock = bot.blockAt(new Vec3(293, 72, -57));
  if (cBlock && cBlock.name.includes('chest')) {
    const chest = await bot.openChest(cBlock);
    const items = chest.containerItems().map(i => ({ name: i.name, count: i.count }));
    console.log('=== BASE CHEST ITEMS ===');
    console.log(JSON.stringify(items));

    // Eat food immediately
    const food = chest.containerItems().find(i => ['cooked_beef', 'cooked_mutton', 'cooked_porkchop', 'bread', 'apple', 'baked_potato'].includes(i.name));
    if (food) {
      console.log(`Taking food: ${food.name} x${Math.min(food.count, 8)}`);
      await chest.withdraw(food.type, null, Math.min(food.count, 8));
    }

    // Armor and gear
    for (const piece of ['iron_helmet', 'iron_chestplate', 'iron_leggings', 'iron_boots', 'shield', 'golden_boots']) {
      const it = chest.containerItems().find(i => i.name === piece);
      if (it && lib.count(piece) === 0) {
        console.log(`Taking gear: ${it.name}`);
        await chest.withdraw(it.type, null, 1);
      }
    }

    chest.close();
  }

  // Eat food
  try {
    const foodItem = bot.inventory.items().find(i => ['cooked_beef', 'cooked_mutton', 'cooked_porkchop', 'bread', 'apple'].includes(i.name));
    if (foodItem && bot.food < 20) {
      console.log(`Eating ${foodItem.name}...`);
      await bot.equip(foodItem, 'hand');
      await bot.consume();
    }
  } catch (e) {}

  // Equip armor and shield
  try { await lib.equipArmor(); } catch (e) {}
  try {
    const shield = bot.inventory.items().find(i => i.name === 'shield');
    if (shield) await bot.equip(shield, 'off-hand');
  } catch (e) {}
  try { await lib.equipWeapon(); } catch (e) {}

  bot.chat(`delta: Regeared at base! HP: ${bot.health.toFixed(1)}, Food: ${bot.food}.`);
}

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  inv: lib.inv()
};
