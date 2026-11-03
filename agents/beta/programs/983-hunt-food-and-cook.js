console.log('=== Program 983: Hunt Food & Cook / Check Chest ===');
globalThis.isProgramCancelled = isCancelled;

bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();

console.log('Beta start pos:', lib.fmt(bot.entity.position), 'Food:', bot.food, 'HP:', bot.health);

// Scan for animals within 32m
const animals = Object.values(bot.entities).filter(e =>
  e.isValid &&
  ['cow', 'pig', 'sheep', 'chicken'].includes(e.name) &&
  bot.entity.position.distanceTo(e.position) <= 32
).sort((a, b) => bot.entity.position.distanceTo(a.position) - bot.entity.position.distanceTo(b.position));

console.log(`Found ${animals.length} animals within 32m:`);
for (const a of animals) {
  console.log(`  - ${a.name} at ${lib.fmt(a.position)} (dist: ${bot.entity.position.distanceTo(a.position).toFixed(1)}m)`);
}

// If animals found, go out and hunt 1 or 2
if (animals.length > 0 && bot.food < 18) {
  // Exit through door
  try {
    await lib.goThroughDoor(294, 72, -54);
  } catch (e) {}

  const target = animals[0];
  console.log(`Hunting ${target.name} at ${lib.fmt(target.position)}...`);
  try {
    await lib.equipWeapon();
    await bot.pathfinder.goto(new goals.GoalNear(target.position.x, target.position.y, target.position.z, 2.0));
    await bot.lookAt(target.position.offset(0, 0.5, 0), true);
    bot.attack(target);
    await sleep(600);
    if (target.isValid) {
      bot.attack(target);
      await sleep(500);
    }
    await lib.pickup(4.0);
  } catch (e) {
    console.log('Hunting error:', e.message);
  }

  // Return to base door
  console.log('Returning to base house...');
  try {
    await lib.goTo(294, 72, -53, 1.0, { timeoutMs: 6000 });
    await lib.goThroughDoor(294, 72, -54);
  } catch (e) {
    console.log('Return error:', e.message);
  }
}

// Check Base Chest (293, 72, -57) for blaze_powder / blaze_rod
const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
if (chestBlock) {
  try {
    const chest = await bot.openChest(chestBlock);
    const items = chest.containerItems();

    const pow = items.find(i => i.name === 'blaze_powder');
    if (pow) {
      console.log(`FOUND ${pow.count} BLAZE POWDER IN BASE CHEST! Withdrawing...`);
      await chest.withdraw(pow.type, null, pow.count);
    }

    const rods = items.find(i => i.name === 'blaze_rod');
    if (rods) {
      console.log(`FOUND ${rods.count} BLAZE RODS IN BASE CHEST! Withdrawing...`);
      await chest.withdraw(rods.type, null, rods.count);
    }

    chest.close();
  } catch (e) {}
}

// Craft blaze_rod to powder
if (lib.count('blaze_rod') > 0) {
  try {
    const r = lib.count('blaze_rod');
    await lib.craft('blaze_powder', r * 2);
  } catch (e) {}
}

// Craft ender_eye if possible
const powCount = lib.count('blaze_powder');
const pearlCount = lib.count('ender_pearl');
if (powCount > 0 && pearlCount > 0) {
  const toCraft = Math.min(powCount, pearlCount);
  console.log(`Crafting ${toCraft} ender_eye...`);
  try {
    await lib.craft('ender_eye', toCraft);
    console.log(`SUCCESS! Crafted ${toCraft} ender_eye! Total held: ${lib.count('ender_eye')}`);
    bot.chat(`Beta: Crafted ${toCraft} Eyes of Ender! Total held: ${lib.count('ender_eye')}!`);
  } catch (e) {
    console.log('Craft error:', e.message);
  }
}

// Eat any food in inventory
if (bot.food < 18) {
  try { await lib.eat(); } catch (e) {}
}

return {
  eyes: lib.count('ender_eye'),
  pearls: lib.count('ender_pearl'),
  food: bot.food,
  hp: bot.health,
  inv: lib.inv()
};
