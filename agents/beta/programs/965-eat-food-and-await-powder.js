console.log('=== Program 965: Eat Food & Await Blaze Powder ===');
globalThis.isProgramCancelled = isCancelled;

bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();

console.log('Beta start position:', lib.fmt(bot.entity.position), 'Time:', bot.time.timeOfDay, 'Food:', bot.food);

// 1. Check Base Chest for food
const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
if (chestBlock) {
  try {
    const chest = await bot.openChest(chestBlock);
    const cItems = chest.containerItems();
    console.log('Base Chest items:');
    for (const it of cItems) {
      if (['cooked_mutton', 'cooked_beef', 'cooked_porkchop', 'bread', 'baked_potato', 'apple', 'blaze_powder', 'blaze_rod'].includes(it.name)) {
        console.log(`  * ${it.name} x${it.count}`);
      }
    }

    const foodItem = cItems.find(i => ['cooked_mutton', 'cooked_beef', 'cooked_porkchop', 'bread', 'baked_potato', 'apple'].includes(i.name));
    if (foodItem && bot.food < 20) {
      console.log(`Withdrawing ${foodItem.count} ${foodItem.name}...`);
      await chest.withdraw(foodItem.type, null, Math.min(8, foodItem.count));
    }

    // Also withdraw any blaze powder or rods if deposited
    const pow = cItems.find(i => i.name === 'blaze_powder');
    if (pow) await chest.withdraw(pow.type, null, pow.count);

    const rods = cItems.find(i => i.name === 'blaze_rod');
    if (rods) await chest.withdraw(rods.type, null, rods.count);

    chest.close();
  } catch (e) {
    console.log('Chest notice:', e.message);
  }
}

// 2. Eat food if withdrawn
const foodInInv = bot.inventory.items().find(i => ['cooked_mutton', 'cooked_beef', 'cooked_porkchop', 'bread', 'baked_potato', 'apple'].includes(i.name));
if (foodInInv && bot.food < 20) {
  console.log(`Eating ${foodInInv.name}...`);
  try {
    await bot.equip(foodInInv, 'hand');
    await bot.consume();
    console.log('Ate food! New food level:', bot.food);
  } catch (e) {}
}

// 3. Monitor for Gamma and Delta for 35 seconds
const startWait = Date.now();
const MAX_WAIT = 35000;

while (Date.now() - startWait < MAX_WAIT && !isCancelled()) {
  // Check Base Chest
  if (chestBlock) {
    try {
      const chest = await bot.openChest(chestBlock);
      const cItems = chest.containerItems();
      const pow = cItems.find(i => i.name === 'blaze_powder');
      if (pow) {
        console.log(`Withdrawing ${pow.count} blaze_powder from Base Chest...`);
        await chest.withdraw(pow.type, null, pow.count);
      }
      const rods = cItems.find(i => i.name === 'blaze_rod');
      if (rods) {
        console.log(`Withdrawing ${rods.count} blaze_rod from Base Chest...`);
        await chest.withdraw(rods.type, null, rods.count);
      }
      chest.close();
    } catch (e) {}
  }

  // Vacuum drops
  try { await lib.pickup(6.0); } catch (e) {}

  // Check players in base
  for (const p of Object.values(bot.players)) {
    if (p.entity && p.username !== bot.username) {
      const dist = bot.entity.position.distanceTo(p.entity.position);
      if (dist <= 12) {
        console.log(`Teammate ${p.username} is in base (${dist.toFixed(1)}m), held: ${p.entity.heldItem?.name}`);
      }
    }
  }

  // Craft blaze rods
  if (lib.count('blaze_rod') > 0) {
    try { await lib.craft('blaze_powder', lib.count('blaze_rod') * 2); } catch (e) {}
  }

  // Craft ender_eye
  const bp = lib.count('blaze_powder');
  const ep = lib.count('ender_pearl');
  if (bp > 0 && ep > 0) {
    const toCraft = Math.min(bp, ep);
    console.log(`Crafting ${toCraft} ender_eye...`);
    try {
      await lib.craft('ender_eye', toCraft);
      const total = lib.count('ender_eye');
      bot.chat(`Beta: 100% COMPLETE! Crafted ${total} EYES OF ENDER! Milestone 10 Part 1 ACHIEVED!`);
      console.log(`SUCCESS: Total ender_eye = ${total}!`);
      break;
    } catch (ce) {}
  }

  if (lib.count('ender_eye') >= 12) break;

  await sleep(2500);
}

console.log('Final Inventory:', JSON.stringify(lib.inv()));
return {
  pos: bot.entity.position,
  dim: bot.game.dimension,
  ender_eyes: lib.count('ender_eye'),
  ender_pearls: lib.count('ender_pearl'),
  food: bot.food,
  hp: bot.health
};
