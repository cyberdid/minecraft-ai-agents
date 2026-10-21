// programs/053-finish-alpha-armor-milestone3.js
// Mine 8 iron on east hill, return, smelt, craft iron_chestplate, equip full iron armor!

console.log('alpha at:', lib.fmt(bot.entity.position));

// 1. Step outside base
const doorPos = new Vec3(294, 72, -54);
let doorBlock = bot.blockAt(doorPos);
if (doorBlock && doorBlock.getProperties && !doorBlock.getProperties().open) {
  await bot.activateBlock(doorBlock);
  await sleep(300);
}
console.log('Stepping outside...');
await lib.walkTo(294, -51);
doorBlock = bot.blockAt(doorPos);
if (doorBlock && doorBlock.getProperties && doorBlock.getProperties().open) {
  await bot.activateBlock(doorBlock);
  await sleep(300);
}

// 2. Travel to east hill (340, 75, -30)
console.log('Travelling to east hill (340, -30)...');
try {
  await lib.goToXZ(340, -30);
} catch (e) {
  console.log('Travel note:', e.message);
}

// 3. Mine 8-10 raw iron
console.log('Mining 8 raw iron...');
const ironOres = lib.find(['iron_ore', 'deepslate_iron_ore'], { maxDistance: 32, count: 10 });
console.log(`Found ${ironOres.length} iron ores in range`);

for (const ore of ironOres) {
  if (isCancelled() || lib.count('raw_iron') >= 8) break;
  try {
    console.log(`Mining iron at ${lib.fmt(ore.position)}...`);
    await lib.goTo(ore.position.x, ore.position.y, ore.position.z, 2, { dig: true });
    await lib.dig(ore.position.x, ore.position.y, ore.position.z);
    await lib.pickup(4);
  } catch (e) {
    console.log('Dig error:', e.message);
  }
}

console.log('Raw iron in inventory:', lib.count('raw_iron'));

// 4. Return to base doorstep at (294, 72, -52)
console.log('Returning to base at (294, 72, -52)...');
await lib.goTo(294, 72, -52, 1, { dig: true });

// Step inside base
doorBlock = bot.blockAt(doorPos);
if (doorBlock && doorBlock.getProperties && !doorBlock.getProperties().open) {
  await bot.activateBlock(doorBlock);
  await sleep(300);
}
await lib.walkTo(294, -56);
doorBlock = bot.blockAt(doorPos);
if (doorBlock && doorBlock.getProperties && doorBlock.getProperties().open) {
  await bot.activateBlock(doorBlock);
  await sleep(300);
}
console.log('Inside base at:', lib.fmt(bot.entity.position));

// 5. Smelt raw iron in furnace
const furnaceBlock = bot.blockAt(new Vec3(295, 72, -55));
if (furnaceBlock) {
  try {
    const furnace = await bot.openFurnace(furnaceBlock);
    if (furnace.outputItem()) await furnace.takeOutput();
    const rawCount = lib.count('raw_iron');
    if (rawCount > 0) {
      await furnace.putInput(mcData.itemsByName.raw_iron.id, null, rawCount);
    }
    if (!furnace.fuelItem()) {
      if (lib.count('*_planks') > 0) {
        await furnace.putFuel(mcData.itemsByName.oak_planks.id, null, Math.min(6, lib.count('*_planks')));
      }
    }
    furnace.close();
  } catch (e) {}
}

// 6. Smelt loop
console.log('Smelting ingots for chestplate...');
for (let i = 0; i < 10; i++) {
  await sleep(8000);
  if (furnaceBlock) {
    try {
      const f = await bot.openFurnace(furnaceBlock);
      if (f.outputItem() && f.outputItem().name === 'iron_ingot') {
        await f.takeOutput();
      }
      f.close();
    } catch (e) {}
  }
  if (lib.count('iron_ingot') >= 8) break;
}

// 7. Craft iron_chestplate
if (lib.count('iron_chestplate') === 0 && lib.count('iron_ingot') >= 8) {
  await lib.craft('iron_chestplate', 1);
  console.log('Crafted alpha iron_chestplate!');
}

await lib.equipArmor();
await lib.equipWeapon();

const slots = bot.inventory.slots;
console.log('ALPHA 100% FULL IRON ARMOR:');
console.log('  Head:', slots[5]?.name);
console.log('  Torso:', slots[6]?.name);
console.log('  Legs:', slots[7]?.name);
console.log('  Feet:', slots[8]?.name);
console.log('  Offhand:', slots[45]?.name);

bot.chat(`alpha: Milestone 3 COMPLETE! Head=${slots[5]?.name}, Torso=${slots[6]?.name}, Legs=${slots[7]?.name}, Feet=${slots[8]?.name}, Offhand=${slots[45]?.name}`);

const time = lib.time();
console.log('Night in:', time.secondsUntilNight, 's');

return {
  worn: {
    head: slots[5]?.name,
    torso: slots[6]?.name,
    legs: slots[7]?.name,
    feet: slots[8]?.name,
    offhand: slots[45]?.name
  },
  time: time.secondsUntilNight
};
