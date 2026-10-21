// programs/043-finish-smelt-and-armor.js
// Harvest all smelted iron ingots from furnace, craft iron armor, equip, sleep at 12542!

console.log('alpha at:', lib.fmt(bot.entity.position), 'timeOfDay:', lib.time().timeOfDay);

const furnaceBlock = bot.blockAt(new Vec3(295, 72, -55));

// 1. Loop and harvest ingots from furnace until input is empty or night in < 20s
while (!isCancelled() && lib.time().secondsUntilNight > 20) {
  if (furnaceBlock) {
    try {
      const furnace = await bot.openFurnace(furnaceBlock);
      const output = furnace.outputItem();
      if (output && output.name === 'iron_ingot') {
        console.log(`Harvesting ${output.count} iron ingots...`);
        await furnace.takeOutput();
      }
      const input = furnace.inputItem();
      const fuel = furnace.fuelItem();
      furnace.close();
      if (!input && !output) {
        console.log('Smelting fully complete!');
        break;
      }
    } catch (e) {
      console.log('Furnace read note:', e.message);
    }
  }

  // Check if we can craft armor pieces right away
  // Chestplate (8 ingots)
  if (lib.count('iron_chestplate') === 0 && lib.count('iron_ingot') >= 8) {
    await lib.craft('iron_chestplate', 1);
    console.log('Crafted iron_chestplate!');
    await lib.equipArmor();
  }
  // Leggings (7 ingots)
  if (lib.count('iron_leggings') === 0 && lib.count('iron_ingot') >= 7) {
    await lib.craft('iron_leggings', 1);
    console.log('Crafted iron_leggings!');
    await lib.equipArmor();
  }
  // Helmet (5 ingots)
  if (lib.count('iron_helmet') === 0 && lib.count('iron_ingot') >= 5) {
    await lib.craft('iron_helmet', 1);
    console.log('Crafted iron_helmet!');
    await lib.equipArmor();
  }
  // Boots (4 ingots)
  if (lib.count('iron_boots') === 0 && lib.count('iron_ingot') >= 4) {
    await lib.craft('iron_boots', 1);
    console.log('Crafted iron_boots!');
    await lib.equipArmor();
  }

  await sleep(6000);
}

// Final check on crafting armor
if (lib.count('iron_chestplate') === 0 && lib.count('iron_ingot') >= 8) {
  await lib.craft('iron_chestplate', 1);
}
if (lib.count('iron_leggings') === 0 && lib.count('iron_ingot') >= 7) {
  await lib.craft('iron_leggings', 1);
}
if (lib.count('iron_helmet') === 0 && lib.count('iron_ingot') >= 5) {
  await lib.craft('iron_helmet', 1);
}
if (lib.count('iron_boots') === 0 && lib.count('iron_ingot') >= 4) {
  await lib.craft('iron_boots', 1);
}

await lib.equipArmor();
await lib.equipWeapon();

console.log('Iron gear status:');
console.log('  Chestplate:', lib.count('iron_chestplate'));
console.log('  Leggings:', lib.count('iron_leggings'));
console.log('  Helmet:', lib.count('iron_helmet'));
console.log('  Boots:', lib.count('iron_boots'));
console.log('  Ingots left:', lib.count('iron_ingot'));

bot.chat(`alpha: Armor crafted & equipped! Chestplate=${lib.count('iron_chestplate')}, Leggings=${lib.count('iron_leggings')}, Helmet=${lib.count('iron_helmet')}, Boots=${lib.count('iron_boots')}`);

// Wait for tick 12542 to sleep in bed
while (!isCancelled()) {
  const t = lib.time();
  if (t.canSleep || t.timeOfDay >= 12542) {
    console.log(`canSleep true at ${t.timeOfDay}! Sleeping in bed...`);
    break;
  }
  await sleep(1500);
}

try {
  await lib.sleepInBed();
  console.log('In bed!');
} catch (e) {
  console.log('Sleep note:', e.message);
}

// Wait for morning
while (!isCancelled()) {
  const t = lib.time();
  if (!t.night && (t.timeOfDay < 1000 || t.timeOfDay >= 23460)) {
    console.log(`Morning reached! Day 6! timeOfDay: ${t.timeOfDay}`);
    break;
  }
  await sleep(1500);
}

const finalTime = lib.time();
console.log('Final time:', finalTime);

return {
  chestplate: lib.count('iron_chestplate'),
  leggings: lib.count('iron_leggings'),
  helmet: lib.count('iron_helmet'),
  boots: lib.count('iron_boots'),
  ingots: lib.count('iron_ingot'),
  time: finalTime
};
