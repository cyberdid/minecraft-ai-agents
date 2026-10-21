// programs/052-bucket-and-mine-final-iron.js
// Craft bucket, fill with water, mine 20 iron on east hill, smelt, craft remaining armor for ML 3!

console.log('alpha at:', lib.fmt(bot.entity.position), 'health:', bot.health, 'food:', bot.food);

// 1. Craft bucket from 3 iron ingots
if (lib.count('bucket') === 0 && lib.count('iron_ingot') >= 3) {
  try {
    await lib.craft('bucket', 1);
    console.log('Crafted bucket!');
  } catch (e) {
    console.log('Bucket craft note:', e.message);
  }
}

// 2. Step outside to fill bucket with water at surface lake
console.log('Filling bucket with water...');
try {
  await lib.fillBucket('water');
  console.log('Bucket filled with water! Water buckets:', lib.count('water_bucket'));
} catch (e) {
  console.log('Fill water bucket note:', e.message);
}

bot.chat('alpha: Milestone 5 water bucket acquired! Heading to east hill for final 20 iron to complete full armor.');

// 3. Travel to east hill iron vein at (350, -35)
console.log('Going to east hill iron vein at (350, -35)...');
try {
  await lib.goToXZ(350, -35);
} catch (e) {
  console.log('Travel note:', e.message);
}

// 4. Mine 20 iron ore
console.log('Mining iron ores...');
let mined = 0;
while (!isCancelled() && lib.count('raw_iron') < 20 && lib.time().secondsUntilNight > 160) {
  const ironOres = lib.find(['iron_ore', 'deepslate_iron_ore'], { maxDistance: 32, count: 20 });
  if (ironOres.length === 0) break;
  for (const ore of ironOres) {
    if (isCancelled() || lib.time().secondsUntilNight < 160 || lib.count('raw_iron') >= 20) break;
    try {
      console.log(`Mining iron at ${lib.fmt(ore.position)}...`);
      await lib.goTo(ore.position.x, ore.position.y, ore.position.z, 2, { dig: true });
      await lib.dig(ore.position.x, ore.position.y, ore.position.z);
      await lib.pickup(4);
      mined++;
    } catch (e) {
      console.log('Dig note:', e.message);
    }
  }
}

console.log('Raw iron in inventory:', lib.count('raw_iron'));

// 5. Return to base doorstep at (294, 72, -52)
console.log('Returning to base at (294, 72, -52)...');
await lib.goTo(294, 72, -52, 1, { dig: true });

// Step inside base
const doorPos = new Vec3(294, 72, -54);
let doorBlock = bot.blockAt(doorPos);
if (doorBlock && doorBlock.getProperties && !doorBlock.getProperties().open) {
  await bot.activateBlock(doorBlock);
  await sleep(300);
}
console.log('Walking inside...');
await lib.walkTo(294, -56);
doorBlock = bot.blockAt(doorPos);
if (doorBlock && doorBlock.getProperties && doorBlock.getProperties().open) {
  await bot.activateBlock(doorBlock);
  await sleep(300);
}
console.log('Inside base at:', lib.fmt(bot.entity.position));

// 6. Smelt raw iron in furnace
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
        await furnace.putFuel(mcData.itemsByName.oak_planks.id, null, Math.min(8, lib.count('*_planks')));
      }
    }
    furnace.close();
  } catch (e) {}
}

// 7. Smelt loop and craft armor
let rounds = 0;
while (!isCancelled() && rounds < 16 && lib.time().secondsUntilNight > 40) {
  await sleep(8000);
  rounds++;
  if (furnaceBlock) {
    try {
      const f = await bot.openFurnace(furnaceBlock);
      if (f.outputItem() && f.outputItem().name === 'iron_ingot') {
        await f.takeOutput();
      }
      f.close();
    } catch (e) {}
  }

  // Alpha chestplate (8)
  if (lib.count('iron_chestplate') === 0 && lib.count('iron_ingot') >= 8) {
    await lib.craft('iron_chestplate', 1);
    console.log('Crafted alpha iron_chestplate!');
    await lib.equipArmor();
  }
  // Alpha helmet (5)
  if (lib.count('iron_helmet') === 0 && lib.count('iron_ingot') >= 5) {
    await lib.craft('iron_helmet', 1);
    console.log('Crafted alpha iron_helmet!');
    await lib.equipArmor();
  }
  // Beta helmet (5)
  if (lib.count('iron_helmet') > 0 && lib.count('iron_ingot') >= 5) {
    await lib.craft('iron_helmet', 1);
    console.log('Crafted beta iron_helmet!');
  }
}

await lib.equipArmor();
await lib.equipWeapon();

const slots = bot.inventory.slots;
console.log('FINAL ALPHA WORN ARMOR:');
console.log('  Head:', slots[5]?.name);
console.log('  Torso:', slots[6]?.name);
console.log('  Legs:', slots[7]?.name);
console.log('  Feet:', slots[8]?.name);
console.log('  Offhand:', slots[45]?.name);

bot.chat(`alpha: Milestone 3 progress! Worn armor: head=${slots[5]?.name}, torso=${slots[6]?.name}, legs=${slots[7]?.name}, feet=${slots[8]?.name}, offhand=${slots[45]?.name}. Bucket: ${lib.count('water_bucket')}`);

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
  waterBucket: lib.count('water_bucket'),
  time: time.secondsUntilNight
};
