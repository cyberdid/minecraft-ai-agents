// programs/042-clear-furnace-and-smelt.js
// Open furnace, inspect slots, clear output slot, load raw_iron and fuel

console.log('alpha at:', lib.fmt(bot.entity.position));

const furnaceBlock = bot.blockAt(new Vec3(295, 72, -55));
if (!furnaceBlock) {
  console.log('Furnace not found at (295, 72, -55)');
  return;
}

console.log('Opening furnace...');
const furnace = await bot.openFurnace(furnaceBlock);

const input = furnace.inputItem();
const fuel = furnace.fuelItem();
const output = furnace.outputItem();

console.log('Furnace State:');
console.log('  Input:', input ? `${input.name} x${input.count}` : 'empty');
console.log('  Fuel:', fuel ? `${fuel.name} x${fuel.count}` : 'empty');
console.log('  Output:', output ? `${output.name} x${output.count}` : 'empty');

// 1. Take output if present
if (output) {
  console.log(`Taking output: ${output.name} x${output.count}`);
  await furnace.takeOutput();
  console.log('Took output successfully');
}

// 2. Put raw iron into input
const rawCount = lib.count('raw_iron');
console.log('Raw iron in inventory to smelt:', rawCount);
if (rawCount > 0) {
  console.log(`Putting ${rawCount} raw iron into furnace input...`);
  await furnace.putInput(mcData.itemsByName.raw_iron.id, null, rawCount);
}

// 3. Put fuel if empty
if (!furnace.fuelItem()) {
  // Use planks or logs
  if (lib.count('*_planks') > 0) {
    const plankItem = mcData.itemsByName.oak_planks.id;
    console.log('Adding 6 oak_planks as fuel...');
    await furnace.putFuel(plankItem, null, Math.min(6, lib.count('*_planks')));
  } else if (lib.count('*_log') > 0) {
    const logItem = mcData.itemsByName.birch_log ? mcData.itemsByName.birch_log.id : mcData.itemsByName.oak_log.id;
    console.log('Adding 3 logs as fuel...');
    await furnace.putFuel(logItem, null, 3);
  }
}

furnace.close();
console.log('Furnace reloaded and running!');

// Wait 40 seconds to collect first batch of smelted ingots
console.log('Waiting 40s for smelting...');
let smeltedTotal = 0;
for (let i = 0; i < 4; i++) {
  await sleep(10000);
  const f = await bot.openFurnace(furnaceBlock);
  if (f.outputItem() && f.outputItem().name === 'iron_ingot') {
    const c = f.outputItem().count;
    console.log(`Harvesting ${c} iron ingots from furnace...`);
    await f.takeOutput();
    smeltedTotal += c;
  }
  f.close();
  console.log(`Progress: iron ingots in inventory: ${lib.count('iron_ingot')}`);
  if (lib.count('iron_ingot') >= 8) break;
}

console.log('Total iron ingots in inventory now:', lib.count('iron_ingot'));

// If we have at least 3 ingots, craft a fresh iron pickaxe!
if (lib.count('iron_pickaxe') === 0 && lib.count('iron_ingot') >= 3) {
  if (lib.count('stick') < 2) await lib.craft('stick', 4);
  await lib.craft('iron_pickaxe', 1);
  console.log('Crafted fresh iron_pickaxe!');
}

// If we have at least 8 ingots, craft iron_chestplate!
if (lib.count('iron_chestplate') === 0 && lib.count('iron_ingot') >= 8) {
  await lib.craft('iron_chestplate', 1);
  console.log('Crafted iron_chestplate!');
}

// If we have at least 7 ingots, craft iron_leggings!
if (lib.count('iron_leggings') === 0 && lib.count('iron_ingot') >= 7) {
  await lib.craft('iron_leggings', 1);
  console.log('Crafted iron_leggings!');
}

await lib.equipArmor();

bot.chat(`alpha: Smelting batch 1 complete! Iron ingots: ${lib.count('iron_ingot')}, Chestplate: ${lib.count('iron_chestplate')}, Pickaxe: ${lib.count('iron_pickaxe')}`);

const time = lib.time();
console.log('Night in:', time.secondsUntilNight, 's');

return {
  ingots: lib.count('iron_ingot'),
  chestplate: lib.count('iron_chestplate'),
  pickaxe: lib.count('iron_pickaxe'),
  time: time.secondsUntilNight
};
