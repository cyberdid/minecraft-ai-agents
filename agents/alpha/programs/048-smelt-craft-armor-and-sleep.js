// programs/048-smelt-craft-armor-and-sleep.js
// Harvest smelting ingots, craft Alpha chestplate/leggings/helmet, craft Beta helmet into chest, sleep!

console.log('alpha at:', lib.fmt(bot.entity.position), 'timeOfDay:', lib.time().timeOfDay);

const furnaceBlock = bot.blockAt(new Vec3(295, 72, -55));
const chestPos = { x: 293, y: 72, z: -57 };

// 1. Harvest ingots and craft armor until night
while (!isCancelled()) {
  const t = lib.time();
  
  // Harvest from furnace
  if (furnaceBlock) {
    try {
      const f = await bot.openFurnace(furnaceBlock);
      if (f.outputItem() && f.outputItem().name === 'iron_ingot') {
        const c = f.outputItem().count;
        console.log(`Harvesting ${c} ingots from furnace...`);
        await f.takeOutput();
      }
      f.close();
    } catch (e) {}
  }

  const ingots = lib.count('iron_ingot');
  console.log(`Iron ingots in inventory: ${ingots}`);

  // Craft Alpha chestplate (8)
  if (lib.count('iron_chestplate') === 0 && ingots >= 8) {
    await lib.craft('iron_chestplate', 1);
    console.log('Crafted alpha iron_chestplate!');
    await lib.equipArmor();
  }
  // Craft Alpha leggings (7)
  if (lib.count('iron_leggings') === 0 && lib.count('iron_ingot') >= 7) {
    await lib.craft('iron_leggings', 1);
    console.log('Crafted alpha iron_leggings!');
    await lib.equipArmor();
  }
  // Craft Alpha helmet (5)
  if (lib.count('iron_helmet') === 0 && lib.count('iron_ingot') >= 5) {
    await lib.craft('iron_helmet', 1);
    console.log('Crafted alpha iron_helmet!');
    await lib.equipArmor();
  }
  // Craft Beta helmet (5)
  if (lib.count('iron_helmet') > 0 && lib.count('iron_ingot') >= 5) {
    await lib.craft('iron_helmet', 1);
    await lib.deposit({ iron_helmet: 1 }, chestPos.x, chestPos.y, chestPos.z);
    console.log('Crafted and deposited beta iron_helmet in chest!');
    bot.chat('alpha: Beta, your iron_helmet is deposited in the base chest!');
  }

  // If time to sleep
  if (t.canSleep || t.timeOfDay >= 12542) {
    console.log(`canSleep true at ${t.timeOfDay}! Sleeping in bed...`);
    break;
  }

  await sleep(6000);
}

await lib.equipArmor();
await lib.equipWeapon();

// Sleep in bed
bot.chat('alpha: In bed now with beta to skip night!');
try {
  await lib.sleepInBed();
  console.log('Alpha is in bed');
} catch (e) {
  console.log('Sleep note:', e.message);
}

// Wait for morning
while (!isCancelled()) {
  const t = lib.time();
  if (!t.night && (t.timeOfDay < 1000 || t.timeOfDay >= 23460)) {
    console.log(`Morning reached! Day 7! timeOfDay: ${t.timeOfDay}`);
    break;
  }
  await sleep(1500);
}

try {
  await bot.wake();
} catch (e) {}

const slots = bot.inventory.slots;
console.log('Armor worn by alpha:');
console.log('  Head:', slots[5]?.name);
console.log('  Torso:', slots[6]?.name);
console.log('  Legs:', slots[7]?.name);
console.log('  Feet:', slots[8]?.name);
console.log('  Offhand:', slots[45]?.name);

const finalTime = lib.time();
return {
  worn: {
    head: slots[5]?.name,
    torso: slots[6]?.name,
    legs: slots[7]?.name,
    feet: slots[8]?.name,
    offhand: slots[45]?.name
  },
  ingotsLeft: lib.count('iron_ingot'),
  time: finalTime
};
