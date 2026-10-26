// programs/064-craft-shield-and-check-iron.js
console.log('Pos before entering:', lib.fmt(bot.entity.position));
await lib.goThroughDoor(294, 72, -54);
console.log('Inside base at:', lib.fmt(bot.entity.position));

// 1. Craft planks
if (lib.count('*_planks') < 8 && lib.count('birch_log') >= 2) {
  await lib.craft('birch_planks', 8);
}

// 2. Craft shield & equip
if (lib.count('iron_ingot') >= 1 && !lib.count('shield')) {
  console.log('Crafting shield...');
  await lib.craft('shield', 1);
  await lib.equipArmor();
  console.log('Shield equipped!');
}

// 3. Harvest furnaces for iron
const furnacePositions = [
  new Vec3(295, 72, -55),
  new Vec3(295, 72, -54),
  new Vec3(295, 72, -57)
];

for (const fp of furnacePositions) {
  const b = bot.blockAt(fp);
  if (b && (b.name === 'furnace' || b.name === 'lit_furnace')) {
    try {
      const f = await bot.openFurnace(b);
      console.log(`Furnace at ${lib.fmt(fp)}: in=${f.inputItem()?.name}x${f.inputItem()?.count}, out=${f.outputItem()?.name}x${f.outputItem()?.count}`);
      if (f.outputItem()) {
        await f.takeOutput();
        console.log(`Took output from furnace at ${lib.fmt(fp)}`);
      }
      f.close();
    } catch (e) {
      console.log(`Error on furnace at ${lib.fmt(fp)}:`, e.message);
    }
  }
}

// 4. If we have iron ingots, craft armor
console.log('Iron ingots count:', lib.count('iron_ingot'));
if (lib.count('iron_ingot') >= 5 && !lib.count('iron_helmet')) {
  console.log('Crafting iron_helmet...');
  await lib.craft('iron_helmet', 1);
}
if (lib.count('iron_ingot') >= 4 && !lib.count('iron_boots')) {
  console.log('Crafting iron_boots...');
  await lib.craft('iron_boots', 1);
}
if (lib.count('iron_ingot') >= 7 && !lib.count('iron_leggings')) {
  console.log('Crafting iron_leggings...');
  await lib.craft('iron_leggings', 1);
}
if (lib.count('iron_ingot') >= 8 && !lib.count('iron_chestplate')) {
  console.log('Crafting iron_chestplate...');
  await lib.craft('iron_chestplate', 1);
}

await lib.equipArmor();

// 5. Withdraw building materials (cobblestone / cobbled_deepslate)
try {
  const chest = await lib.chestContents(293, 72, -57);
  console.log('Chest before withdraw:', JSON.stringify(chest));
  if (chest.cobbled_deepslate >= 32) {
    await lib.withdraw({ cobbled_deepslate: 32 }, 293, 72, -57);
  } else if (chest.cobblestone >= 32) {
    await lib.withdraw({ cobblestone: 32 }, 293, 72, -57);
  }
} catch (e) {
  console.log('Chest withdraw error:', e.message);
}

// Armor status
const armor = {
  head: bot.inventory.slots[5]?.name || null,
  torso: bot.inventory.slots[6]?.name || null,
  legs: bot.inventory.slots[7]?.name || null,
  feet: bot.inventory.slots[8]?.name || null,
  offhand: bot.inventory.slots[45]?.name || null
};
console.log('Equipped Armor:', JSON.stringify(armor));
console.log('Inventory:', JSON.stringify(lib.inv()));
bot.chat(`gamma status: armor=${JSON.stringify(armor)}, tools=${JSON.stringify(lib.tools())}`);
