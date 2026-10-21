// programs/029-check-furnace-and-craft-axe.js
// Warn beta, check furnace for remaining ingots, craft iron_axe and shield

bot.chat('alpha: Beta, do NOT mine at (297, 54, -55) or below y=60! The water cave is there. Mine east at (330, -30) instead!');

// Open furnace at (295, 72, -55) and retrieve smelted items
const furnacePos = new Vec3(295, 72, -55);
const furnaceBlock = bot.blockAt(furnacePos);
if (furnaceBlock) {
  try {
    console.log('Opening furnace at (295, 72, -55)...');
    const furnace = await bot.openFurnace(furnaceBlock);
    console.log('Furnace opened. Input:', furnace.inputItem()?.name, 'Fuel:', furnace.fuelItem()?.name, 'Output:', furnace.outputItem()?.name, 'count:', furnace.outputItem()?.count);
    if (furnace.outputItem()) {
      await furnace.takeOutput();
      console.log('Took output from furnace');
    }
    furnace.close();
  } catch (e) {
    console.log('Furnace open note:', e.message);
  }
}

console.log('Iron ingots in inventory:', lib.count('iron_ingot'));

// Ensure enough planks for shield (needs 6 planks)
if (lib.count('*_planks') < 6 && lib.count('*_log') > 0) {
  await lib.craft('oak_planks', 4);
}

// Ensure sticks for axe (needs 2 sticks)
if (lib.count('stick') < 2 && lib.count('*_planks') > 0) {
  await lib.craft('stick', 4);
}

// Craft iron_axe (3 ingots)
if (lib.count('iron_axe') === 0 && lib.count('iron_ingot') >= 3) {
  await lib.craft('iron_axe', 1);
  console.log('Crafted iron_axe!');
}

// Craft shield (1 ingot + 6 planks)
if (lib.count('shield') === 0 && lib.count('iron_ingot') >= 1 && lib.count('*_planks') >= 6) {
  await lib.craft('shield', 1);
  console.log('Crafted shield!');
}

// Equip armor and weapon
await lib.equipArmor();
await lib.equipWeapon();

bot.chat(`alpha: Gear update: pickaxe=${lib.count('iron_pickaxe')}, sword=${lib.count('iron_sword')}, axe=${lib.count('iron_axe')}, shield=${lib.count('shield')}`);

const time = lib.time();
console.log('Night in:', time.secondsUntilNight, 's');

return {
  pickaxe: lib.count('iron_pickaxe'),
  sword: lib.count('iron_sword'),
  axe: lib.count('iron_axe'),
  shield: lib.count('shield'),
  ingots: lib.count('iron_ingot'),
  time: time.secondsUntilNight
};
