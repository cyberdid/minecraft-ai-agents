// programs/527-step-up-and-warp.js
globalThis.isProgramCancelled = isCancelled;
const checkCancelled = () => (typeof globalThis.isProgramCancelled === 'function' ? globalThis.isProgramCancelled() : false);

console.log('=== DELTA: STEP UP & WARP TO OVERWORLD ===');
console.log(`Starting pos: ${lib.fmt(bot.entity.position)}, HP: ${bot.health}, Food: ${bot.food}`);

bot.clearControlStates();
bot.pathfinder.stop();

// Find nether_portal block
const portalBlock = bot.findBlock({ matching: b => b && b.name === 'nether_portal', maxDistance: 6 });
if (portalBlock) {
  console.log(`Found portal at ${lib.fmt(portalBlock.position)}!`);
  const pos = portalBlock.position.offset(0.5, 0.1, 0.5);
  await bot.lookAt(pos, true);
  
  // Jump / step towards portal center
  bot.setControlState('forward', true);
  bot.setControlState('jump', true);
  await sleep(1000);
  bot.setControlState('jump', false);
  bot.setControlState('forward', false);

  console.log('Inside portal, waiting for warp to Overworld...');
  const start = Date.now();
  while (bot.game.dimension !== 'overworld' && Date.now() - start < 15000 && !checkCancelled()) {
    const cur = bot.entity.position;
    if (cur.distanceTo(pos) > 0.6) {
      await bot.lookAt(pos, true);
      bot.setControlState('forward', true);
      await sleep(200);
      bot.setControlState('forward', false);
    }
    await sleep(200);
  }
} else {
  console.log('No portal block within 6m. Searching 16m...');
  const pb = bot.findBlock({ matching: b => b && b.name === 'nether_portal', maxDistance: 16 });
  if (pb) {
    console.log(`Found portal at ${lib.fmt(pb.position)}, jumping towards it...`);
    await bot.lookAt(pb.position.offset(0.5, 0.5, 0.5), true);
    bot.setControlState('forward', true);
    bot.setControlState('jump', true);
    await sleep(1200);
    bot.setControlState('jump', false);
    bot.setControlState('forward', false);
  }
}

bot.clearControlStates();
console.log(`Dimension: ${bot.game.dimension}, pos: ${lib.fmt(bot.entity.position)}`);

if (bot.game.dimension === 'overworld') {
  console.log('In Overworld! Walking to base door at (294, 72, -54)...');
  try {
    await lib.goTo(294, 72, -53, 1, { timeoutMs: 8000 });
  } catch (e) {}

  if (bot.entity.position.z > -54.0) {
    try {
      await lib.goThroughDoor(294, 72, -54);
    } catch (e) {
      console.log('goThroughDoor error:', e.message);
    }
  }

  // Reach chest at (293, 72, -57)
  try {
    await lib.goTo(293, 72, -56, 1, { timeoutMs: 6000 });
  } catch (e) {}

  const cBlock = bot.blockAt(new Vec3(293, 72, -57));
  if (cBlock && cBlock.name.includes('chest')) {
    const chest = await bot.openChest(cBlock);
    const items = chest.containerItems().map(i => ({ name: i.name, count: i.count }));
    console.log('=== BASE CHEST ITEMS ===');
    console.log(JSON.stringify(items));

    // Withdraw food
    const foods = chest.containerItems().filter(i => ['cooked_beef', 'cooked_mutton', 'cooked_porkchop', 'bread', 'apple', 'baked_potato'].includes(i.name));
    for (const f of foods) {
      const take = Math.min(f.count, 8);
      if (take > 0 && lib.count(f.name) < 8) {
        console.log(`Withdrawing food: ${f.name} x${take}`);
        await chest.withdraw(f.type, null, take);
      }
    }

    // Withdraw gear
    for (const piece of ['iron_helmet', 'iron_chestplate', 'iron_leggings', 'iron_boots', 'shield', 'golden_boots']) {
      const it = chest.containerItems().find(i => i.name === piece);
      if (it && lib.count(piece) === 0) {
        console.log(`Withdrawing ${it.name}`);
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

  // Equip
  try { await lib.equipArmor(); } catch (e) {}
  try {
    const shield = bot.inventory.items().find(i => i.name === 'shield');
    if (shield) await bot.equip(shield, 'off-hand');
  } catch (e) {}
  try { await lib.equipWeapon(); } catch (e) {}

  bot.chat(`delta: Regeared at base! HP: ${bot.health.toFixed(1)}, Food: ${bot.food}`);
}

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  inv: lib.inv()
};
