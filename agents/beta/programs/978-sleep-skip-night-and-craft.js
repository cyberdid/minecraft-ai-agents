console.log('=== Program 978: Sleep Through Night & Craft Eyes of Ender ===');
globalThis.isProgramCancelled = isCancelled;

bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();

console.log('Beta pos:', lib.fmt(bot.entity.position), 'Time:', bot.time.timeOfDay);

// Wait until tick 12542 if needed
while (bot.time.timeOfDay < 12542 && !isCancelled()) {
  await sleep(500);
}

// Find bed
const bedBlock = bot.findBlock({
  matching: b => b && b.name.includes('bed'),
  maxDistance: 6
});

if (bedBlock) {
  console.log(`Found bed at ${lib.fmt(bedBlock.position)}, sleeping...`);
  try {
    await bot.sleep(bedBlock);
    console.log('Beta sleeping in bed...');
    const sleepStart = Date.now();
    while (bot.isSleeping && Date.now() - sleepStart < 25000 && !isCancelled()) {
      await sleep(500);
    }
    console.log('Awake! Time of day:', bot.time.timeOfDay);
  } catch (err) {
    console.log('Sleep error:', err.message);
  }
} else {
  console.log('No bed found nearby!');
}

// Wakeup routine: check teammates, chest, and ground
for (const pName of ['gamma', 'delta', 'alpha']) {
  const p = bot.players[pName];
  if (p && p.entity) {
    console.log(`Teammate ${pName} present at ${lib.fmt(p.entity.position)}`);
  }
}

// Vacuum items
try { await lib.pickup(6.0); } catch (e) {}

// Check Base Chest
const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
if (chestBlock) {
  try {
    const chest = await bot.openChest(chestBlock);
    const cItems = chest.containerItems();

    const pow = cItems.find(i => i.name === 'blaze_powder');
    if (pow) {
      console.log(`Withdrawing ${pow.count} blaze_powder from chest...`);
      await chest.withdraw(pow.type, null, pow.count);
    }

    const rods = cItems.find(i => i.name === 'blaze_rod');
    if (rods) {
      console.log(`Withdrawing ${rods.count} blaze_rod from chest...`);
      await chest.withdraw(rods.type, null, rods.count);
    }

    chest.close();
  } catch (e) {
    console.log('Chest error:', e.message);
  }
}

// Craft rods to powder
if (lib.count('blaze_rod') > 0) {
  try {
    await lib.craft('blaze_powder', lib.count('blaze_rod') * 2);
    console.log(`Crafted ${lib.count('blaze_powder')} blaze_powder!`);
  } catch (e) {}
}

// Craft ender_eye
const powCount = lib.count('blaze_powder');
const pearlCount = lib.count('ender_pearl');
if (powCount > 0 && pearlCount > 0) {
  const count = Math.min(powCount, pearlCount);
  console.log(`Crafting ${count} ender_eye...`);
  try {
    await lib.craft('ender_eye', count);
    console.log(`SUCCESS! Crafted ${count} ender_eye! Total held: ${lib.count('ender_eye')}`);
    bot.chat(`Beta: Crafted ${count} Eyes of Ender! Total held: ${lib.count('ender_eye')}!`);
  } catch (e) {
    console.log('Craft error:', e.message);
  }
}

return {
  eyes: lib.count('ender_eye'),
  pearls: lib.count('ender_pearl'),
  hp: bot.health,
  food: bot.food,
  time: bot.time.timeOfDay
};
