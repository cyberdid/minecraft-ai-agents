console.log('=== Program 972: Hunt Food & Craft Eyes ===');
globalThis.isProgramCancelled = isCancelled;

bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();

console.log('Beta start position:', lib.fmt(bot.entity.position), 'Time:', bot.time.timeOfDay, 'Food:', bot.food);

// 1. Scan for nearby animals within 24m
const animals = Object.values(bot.entities).filter(e =>
  e.isValid && ['sheep', 'cow', 'pig', 'chicken'].includes(e.name) &&
  bot.entity.position.distanceTo(e.position) <= 24
).sort((a, b) => bot.entity.position.distanceTo(a.position) - bot.entity.position.distanceTo(b.position));

console.log(`Animals nearby within 24m: ${animals.length}`);
if (animals.length > 0 && bot.food < 18) {
  const target = animals[0];
  console.log(`Hunting ${target.name} at ${lib.fmt(target.position)}...`);
  try {
    const sword = bot.inventory.items().find(i => i.name.includes('sword'));
    if (sword) await bot.equip(sword, 'hand');
    await bot.pathfinder.goto(new goals.GoalNear(target.position.x, target.position.y, target.position.z, 2.0));
    await bot.lookAt(target.position.offset(0, 0.8, 0), true);
    bot.attack(target);
    await sleep(600);
    bot.attack(target);
    await sleep(600);
    await lib.pickup(4.0);
  } catch (e) {
    console.log('Hunt notice:', e.message);
  }
}

// 2. Return into Base House
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {}

try {
  await bot.pathfinder.goto(new goals.GoalNear(293, 72, -56, 0.8));
} catch (e) {}

// 3. Inspect Base Chest at (293, 72, -57)
const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
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

// 4. Craft blaze rods to blaze powder
if (lib.count('blaze_rod') > 0) {
  try { await lib.craft('blaze_powder', lib.count('blaze_rod') * 2); } catch (e) {}
}

// 5. Craft ender_eye
const bp = lib.count('blaze_powder');
const ep = lib.count('ender_pearl');
if (bp > 0 && ep > 0) {
  const toCraft = Math.min(bp, ep);
  console.log(`Crafting ${toCraft} ender_eye...`);
  try {
    await lib.craft('ender_eye', toCraft);
    const total = lib.count('ender_eye');
    bot.chat(`Beta: 100% COMPLETE! CRAFTED ${total} EYES OF ENDER! Milestone 10 fully ready!`);
    console.log(`SUCCESS: Total ender_eye in inventory = ${total}!`);
  } catch (ce) {
    console.log('Craft error:', ce.message);
  }
}

console.log('Final Beta Inventory:', JSON.stringify(lib.inv()));
return {
  pos: bot.entity.position,
  dim: bot.game.dimension,
  ender_eyes: lib.count('ender_eye'),
  ender_pearls: lib.count('ender_pearl'),
  blaze_powder: lib.count('blaze_powder'),
  hp: bot.health,
  food: bot.food,
  time: bot.time.timeOfDay
};
