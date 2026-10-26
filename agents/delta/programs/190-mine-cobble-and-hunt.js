// programs/190-mine-cobble-and-hunt.js
console.log('Delta pos:', lib.fmt(bot.entity.position));
console.log('Health:', bot.health, 'Food:', bot.food);

// 1. Mine 32 cobblestone with stone pickaxe
console.log('Mining 32 stone for Nether fortification...');
try {
  const mined = await lib.collect('stone', 32);
  console.log('Stone mined:', JSON.stringify(mined));
} catch (err) {
  console.log('Collect stone error:', err.message);
}

console.log('Current cobblestone count:', lib.count('cobblestone'));

// 2. Check for passive animals nearby for food
const animals = bot.entities;
let animalTarget = null;
for (const id in animals) {
  const e = animals[id];
  if (!e) continue;
  if (['cow', 'pig', 'sheep'].includes(e.name)) {
    const dist = bot.entity.position.distanceTo(e.position);
    if (dist < 30) {
      console.log(`Found ${e.name} at ${lib.fmt(e.position)} (dist ${dist.toFixed(1)}m)`);
      if (!animalTarget) animalTarget = e.name;
    }
  }
}

if (animalTarget) {
  console.log(`Hunting ${animalTarget}...`);
  try {
    await lib.hunt(animalTarget, 2);
  } catch (err) {
    console.log('Hunt error:', err.message);
  }
}

// 3. Return inside base shelter through door
const doorPos = new Vec3(294, 73, -54);
console.log('Returning to base...');
try {
  await lib.goThroughDoor(doorPos.x, doorPos.y, doorPos.z);
  console.log('Inside base at:', lib.fmt(bot.entity.position));
} catch (err) {
  console.log('Door error:', err.message);
  await lib.goTo(293, 72, -54, 1);
}

// 4. Check chest for iron ingot
const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
if (chestBlock && chestBlock.name === 'chest') {
  try {
    const chest = await bot.openChest(chestBlock);
    const iron = chest.containerItems().find(i => i.name === 'iron_ingot');
    if (iron && lib.count('shield') === 0) {
      console.log('Found iron ingot in chest! Withdrawing 1 for shield...');
      await chest.withdraw(iron.type, null, 1);
    }
    chest.close();
  } catch (err) {
    console.log('Chest error:', err.message);
  }
}

// 5. If we have iron ingot and planks, craft shield!
if (lib.count('iron_ingot') >= 1 && lib.count('*_planks') >= 6 && lib.count('shield') === 0) {
  try {
    await lib.craft('shield', 1);
    console.log('Crafted shield!');
    await lib.equipArmor();
    console.log('Equipped shield in off-hand!');
  } catch (err) {
    console.log('Craft shield error:', err.message);
  }
}

// 6. Smelt any raw food in furnace
const rawMeats = ['raw_beef', 'raw_porkchop', 'raw_mutton', 'raw_chicken'];
for (const meat of rawMeats) {
  const count = lib.count(meat);
  if (count > 0) {
    console.log(`Smelting ${count} ${meat}...`);
    try {
      // Use birch_planks or birch_log as fuel
      const fuel = lib.count('birch_planks') > 2 ? 'birch_planks' : 'birch_log';
      await lib.smelt(meat, fuel, count);
      console.log(`Smelted ${meat}!`);
    } catch (err) {
      console.log(`Smelt error for ${meat}:`, err.message);
    }
  }
}

console.log('Final inventory:', JSON.stringify(lib.inv()));
console.log('Gear:', JSON.stringify(lib.tools()));
bot.chat(`Delta: Armed & supplied! Cobblestone=${lib.count('cobblestone')}, Planks=${lib.count('*_planks')}. Ready to enter Nether!`);
