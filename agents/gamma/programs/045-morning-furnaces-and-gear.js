// programs/045-morning-furnaces-and-gear.js
console.log('gamma pos:', lib.fmt(bot.entity.position));

// 1. Inspect and collect from all base furnaces
const furnaces = [new Vec3(295, 72, -55), new Vec3(295, 72, -57)];
let totalIngotsCollected = 0;

for (const pos of furnaces) {
  const bl = bot.blockAt(pos);
  if (!bl || bl.name !== 'furnace') continue;
  try {
    const f = await bot.openFurnace(bl);
    console.log(`Furnace at ${lib.fmt(pos)}: input=${f.inputItem()?.name}x${f.inputItem()?.count}, fuel=${f.fuelItem()?.name}x${f.fuelItem()?.count}, output=${f.outputItem()?.name}x${f.outputItem()?.count}`);
    if (f.outputItem() && f.outputItem().name === 'iron_ingot') {
      totalIngotsCollected += f.outputItem().count;
      await f.takeOutput();
    }
    f.close();
  } catch (e) {
    console.log(`Furnace at ${lib.fmt(pos)} err:`, e.message);
  }
}

// 2. Check base chest for iron_ingot
const chest = await lib.chestContents(293, 72, -57);
console.log('Base chest items:', JSON.stringify(chest));
if (chest.iron_ingot) {
  await lib.withdraw({ iron_ingot: chest.iron_ingot }, 293, 72, -57);
}

console.log('Total iron ingots in gamma inventory:', lib.count('iron_ingot'));

// 3. Craft remaining armor: leggings & helmet
await lib.ensureTable();

if (lib.count('iron_ingot') >= 7 && !lib.count('iron_leggings')) {
  console.log('Crafting iron_leggings...');
  await lib.craft('iron_leggings', 1);
}
if (lib.count('iron_ingot') >= 5 && !lib.count('iron_helmet')) {
  console.log('Crafting iron_helmet...');
  await lib.craft('iron_helmet', 1);
}
if (lib.count('iron_ingot') >= 3 && !lib.count('iron_pickaxe')) {
  console.log('Crafting iron_pickaxe...');
  await lib.craft('iron_pickaxe', 1);
}
if (lib.count('iron_ingot') >= 3 && !lib.count('bucket')) {
  console.log('Crafting bucket...');
  await lib.craft('bucket', 1);
}

// 4. Equip all armor
await lib.equipArmor();

console.log('Gamma gear now:', JSON.stringify(lib.tools()));
console.log('Inventory now:', JSON.stringify(lib.inv()));
bot.chat(`gamma morning update: wearing chestplate, boots, shield. Ingots: ${lib.count('iron_ingot')}. Prepping full gear for Nether!`);
