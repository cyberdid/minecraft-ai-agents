// programs/045-mine-full-iron-armor.js
// Mine 35+ iron ore on east hill, return to base, smelt, craft all armor pieces & bucket!

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

bot.chat('alpha: Day 6 dawn! Heading to east hill to mine 35 iron for full armor and buckets.');

// 2. Travel to east hill iron vein at (350, 52, -35)
console.log('Travelling to east hill iron vein at (350, -35)...');
try {
  await lib.goToXZ(350, -35);
} catch (e) {
  console.log('Travel note:', e.message);
}

// 3. Scan and mine iron ores
console.log('Scanning for iron ores...');
let minedThisRun = 0;
while (!isCancelled() && lib.count('raw_iron') < 35 && lib.time().secondsUntilNight > 160) {
  const ironOres = lib.find(['iron_ore', 'deepslate_iron_ore'], { maxDistance: 32, count: 20 });
  if (ironOres.length === 0) {
    console.log('No more iron ores in 32 blocks, moving slightly...');
    await lib.goToXZ(bot.entity.position.x + 8, bot.entity.position.z + 8);
    continue;
  }
  for (const ore of ironOres) {
    if (isCancelled() || lib.time().secondsUntilNight < 160 || lib.count('raw_iron') >= 35) break;
    try {
      console.log(`Mining iron at ${lib.fmt(ore.position)}...`);
      await lib.goTo(ore.position.x, ore.position.y, ore.position.z, 2, { dig: true });
      await lib.dig(ore.position.x, ore.position.y, ore.position.z);
      await lib.pickup(4);
      minedThisRun++;
    } catch (e) {
      console.log(`Dig error at ${lib.fmt(ore.position)}:`, e.message);
    }
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
console.log('Safely inside base at:', lib.fmt(bot.entity.position));

// 5. Open furnace, load raw iron and fuel
const furnaceBlock = bot.blockAt(new Vec3(295, 72, -55));
if (furnaceBlock) {
  try {
    const furnace = await bot.openFurnace(furnaceBlock);
    // Take any output
    if (furnace.outputItem()) {
      await furnace.takeOutput();
    }
    // Put raw iron
    const toSmelt = lib.count('raw_iron');
    if (toSmelt > 0) {
      console.log(`Loading ${toSmelt} raw iron into furnace...`);
      await furnace.putInput(mcData.itemsByName.raw_iron.id, null, toSmelt);
    }
    // Put fuel (birch_log or planks)
    if (!furnace.fuelItem()) {
      if (lib.count('*_planks') > 0) {
        await furnace.putFuel(mcData.itemsByName.oak_planks.id, null, Math.min(8, lib.count('*_planks')));
      } else if (lib.count('*_log') > 0) {
        await furnace.putFuel(mcData.itemsByName.birch_log ? mcData.itemsByName.birch_log.id : mcData.itemsByName.oak_log.id, null, 3);
      }
    }
    furnace.close();
  } catch (e) {
    console.log('Furnace load note:', e.message);
  }
}

// 6. Smelt loop: harvest ingots and craft armor
console.log('Smelting ingots...');
const chestPos = { x: 293, y: 72, z: -57 };
let harvestRounds = 0;

while (!isCancelled() && harvestRounds < 12 && lib.time().secondsUntilNight > 40) {
  await sleep(8000);
  harvestRounds++;
  if (furnaceBlock) {
    try {
      const f = await bot.openFurnace(furnaceBlock);
      if (f.outputItem() && f.outputItem().name === 'iron_ingot') {
        await f.takeOutput();
      }
      f.close();
    } catch (e) {}
  }

  // Alpha armor
  if (lib.count('iron_chestplate') === 0 && lib.count('iron_ingot') >= 8) {
    await lib.craft('iron_chestplate', 1);
    console.log('Crafted alpha iron_chestplate!');
    await lib.equipArmor();
  }
  if (lib.count('iron_leggings') === 0 && lib.count('iron_ingot') >= 7) {
    await lib.craft('iron_leggings', 1);
    console.log('Crafted alpha iron_leggings!');
    await lib.equipArmor();
  }
  if (lib.count('iron_helmet') === 0 && lib.count('iron_ingot') >= 5) {
    await lib.craft('iron_helmet', 1);
    console.log('Crafted alpha iron_helmet!');
    await lib.equipArmor();
  }
  // Bucket for alpha
  if (lib.count('bucket') === 0 && lib.count('iron_ingot') >= 3) {
    await lib.craft('bucket', 1);
    console.log('Crafted bucket!');
  }
  // Beta armor
  if (lib.count('iron_ingot') >= 7) {
    await lib.craft('iron_leggings', 1);
    await lib.deposit({ iron_leggings: 1 }, chestPos.x, chestPos.y, chestPos.z);
    console.log('Crafted & deposited beta iron_leggings!');
  }
  if (lib.count('iron_ingot') >= 5) {
    await lib.craft('iron_helmet', 1);
    await lib.deposit({ iron_helmet: 1 }, chestPos.x, chestPos.y, chestPos.z);
    console.log('Crafted & deposited beta iron_helmet!');
  }
}

await lib.equipArmor();
await lib.equipWeapon();

bot.chat(`alpha: Armor update: Chestplate=${lib.count('iron_chestplate')}, Leggings=${lib.count('iron_leggings')}, Helmet=${lib.count('iron_helmet')}, Boots=${lib.count('iron_boots')}, Bucket=${lib.count('bucket')}`);

const time = lib.time();
console.log('Night in:', time.secondsUntilNight, 's');

return {
  rawIronLeft: lib.count('raw_iron'),
  ingots: lib.count('iron_ingot'),
  chestplate: lib.count('iron_chestplate'),
  leggings: lib.count('iron_leggings'),
  helmet: lib.count('iron_helmet'),
  bucket: lib.count('bucket'),
  time: time.secondsUntilNight
};
