// programs/050-fuel-furnace-and-smelt-all.js
// Fuel furnace with 10 planks, smelt all 13 raw iron, craft chestplate & leggings, wait for dawn

console.log('alpha at:', lib.fmt(bot.entity.position), 'timeOfDay:', lib.time().timeOfDay);

const furnaceBlock = bot.blockAt(new Vec3(295, 72, -55));

// 1. Open furnace and put 10 oak planks as fuel
try {
  const furnace = await bot.openFurnace(furnaceBlock);
  console.log('Furnace Input:', furnace.inputItem()?.name, 'x' + furnace.inputItem()?.count);
  console.log('Putting 10 oak_planks as fuel...');
  await furnace.putFuel(mcData.itemsByName.oak_planks.id, null, 10);
  furnace.close();
  console.log('Furnace fueled and actively smelting 13 raw iron!');
} catch (e) {
  console.log('Furnace fuel error:', e.message);
}

bot.chat('alpha: Fueled furnace! Smelting remaining 13 raw iron for chestplate and leggings.');

// 2. Monitor smelting and harvest ingots
let harvestedCount = 0;
while (!isCancelled()) {
  const t = lib.time();
  if (t.timeOfDay >= 23460 || (t.timeOfDay >= 0 && t.timeOfDay < 12000)) {
    console.log(`Dawn reached! timeOfDay: ${t.timeOfDay}`);
    break;
  }

  await sleep(10000);

  try {
    const f = await bot.openFurnace(furnaceBlock);
    const out = f.outputItem();
    if (out && out.name === 'iron_ingot') {
      console.log(`Harvested ${out.count} iron ingots`);
      await f.takeOutput();
      harvestedCount += out.count;
    }
    f.close();
  } catch (e) {}

  const ingots = lib.count('iron_ingot');
  console.log(`Ingots in inventory: ${ingots}`);

  // Craft chestplate (8 ingots)
  if (lib.count('iron_chestplate') === 0 && ingots >= 8) {
    await lib.craft('iron_chestplate', 1);
    console.log('Crafted alpha iron_chestplate!');
    await lib.equipArmor();
  }

  // Craft leggings (7 ingots)
  if (lib.count('iron_leggings') === 0 && lib.count('iron_ingot') >= 7) {
    await lib.craft('iron_leggings', 1);
    console.log('Crafted alpha iron_leggings!');
    await lib.equipArmor();
  }
}

await lib.equipArmor();
await lib.equipWeapon();

const slots = bot.inventory.slots;
console.log('Final Worn Armor:');
console.log('  Head:', slots[5]?.name);
console.log('  Torso:', slots[6]?.name);
console.log('  Legs:', slots[7]?.name);
console.log('  Feet:', slots[8]?.name);
console.log('  Offhand:', slots[45]?.name);

bot.chat(`alpha: Day 7 dawn! Worn armor: torso=${slots[6]?.name}, legs=${slots[7]?.name}, feet=${slots[8]?.name}, offhand=${slots[45]?.name}.`);

const finalTime = lib.time();
return {
  worn: {
    head: slots[5]?.name,
    torso: slots[6]?.name,
    legs: slots[7]?.name,
    feet: slots[8]?.name,
    offhand: slots[45]?.name
  },
  time: finalTime
};
