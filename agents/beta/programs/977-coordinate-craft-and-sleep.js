console.log('=== Program 977: Coordinate Craft, Regear & Sleep ===');
globalThis.isProgramCancelled = isCancelled;

bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();

console.log('Beta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'Time:', bot.time.timeOfDay);
console.log('Holding:', lib.count('ender_eye'), 'ender_eye and', lib.count('ender_pearl'), 'ender_pearl');

const chestPos = new Vec3(293, 72, -57);

// Function to handle chest check
async function checkChestAndCraft() {
  const cb = bot.blockAt(chestPos);
  if (!cb) return;
  try {
    const chest = await bot.openChest(cb);
    const items = chest.containerItems();

    // Check blaze powder/rods
    const pow = items.find(i => i.name === 'blaze_powder');
    if (pow) {
      console.log(`Withdrawing ${pow.count} blaze_powder from chest...`);
      await chest.withdraw(pow.type, null, pow.count);
    }
    const rods = items.find(i => i.name === 'blaze_rod');
    if (rods) {
      console.log(`Withdrawing ${rods.count} blaze_rod from chest...`);
      await chest.withdraw(rods.type, null, rods.count);
    }

    // Check armor / shield if missing
    for (const piece of ['iron_helmet', 'iron_chestplate', 'iron_leggings', 'iron_boots', 'shield']) {
      if (lib.count(piece) === 0) {
        const found = items.find(i => i.name === piece);
        if (found) {
          console.log(`Withdrawing ${piece} from chest...`);
          await chest.withdraw(found.type, null, 1);
        }
      }
    }

    // Check food
    const foodItem = items.find(i => i.name.includes('cooked') || i.name === 'bread' || i.name === 'apple');
    if (foodItem && lib.count(foodItem.name) === 0) {
      console.log(`Withdrawing ${foodItem.name} x${Math.min(foodItem.count, 16)} from chest...`);
      await chest.withdraw(foodItem.type, null, Math.min(foodItem.count, 16));
    }

    chest.close();
  } catch (err) {
    // chest might be in use
  }

  // Ground pickup
  try { await lib.pickup(4.0); } catch (e) {}

  // Craft rods if any
  if (lib.count('blaze_rod') > 0) {
    try {
      await lib.craft('blaze_powder', lib.count('blaze_rod') * 2);
    } catch (e) {}
  }

  // Craft ender_eye if possible
  const powCount = lib.count('blaze_powder');
  const pearlCount = lib.count('ender_pearl');
  if (powCount > 0 && pearlCount > 0) {
    const toCraft = Math.min(powCount, pearlCount);
    try {
      await lib.craft('ender_eye', toCraft);
      console.log(`CRAFTED ${toCraft} ender_eye! Total now: ${lib.count('ender_eye')}`);
      bot.chat(`Beta: Crafted ${toCraft} Eyes of Ender! Total held: ${lib.count('ender_eye')}!`);
    } catch (e) {
      console.log('Craft error:', e.message);
    }
  }
}

// Function to handle sleeping
async function checkSleep() {
  const tod = bot.time.timeOfDay;
  if (tod >= 12542 && tod <= 23460) {
    console.log(`Dusk/Night active (timeOfDay=${tod})! Attempting to sleep in bed...`);
    const bedBlock = bot.findBlock({
      matching: b => b && b.name.includes('bed'),
      maxDistance: 6
    });
    if (bedBlock) {
      try {
        await bot.sleep(bedBlock);
        console.log('Beta is sleeping...');
        while (bot.isSleeping && !isCancelled()) {
          await sleep(500);
        }
        console.log('Beta woke up! Dawn timeOfDay:', bot.time.timeOfDay);
      } catch (err) {
        console.log('Sleep error:', err.message);
      }
    }
  }
}

const loopStart = Date.now();
const TIMEOUT_LOOP = 50000;

while (Date.now() - loopStart < TIMEOUT_LOOP && !isCancelled()) {
  await checkChestAndCraft();
  await checkSleep();

  try { await lib.equipArmor(); } catch (e) {}
  try { await lib.equipWeapon(); } catch (e) {}

  if (lib.count('ender_eye') >= 12 && bot.time.isDay) {
    console.log(`READY FOR STRONGHOLD EXPEDITION! ${lib.count('ender_eye')} Eyes of Ender held!`);
    break;
  }

  await sleep(1500);
}

return {
  eyes: lib.count('ender_eye'),
  pearls: lib.count('ender_pearl'),
  hp: bot.health,
  food: bot.food,
  time: bot.time.timeOfDay
};
