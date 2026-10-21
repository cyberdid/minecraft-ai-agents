// programs/046-return-craft-alpha-full-armor.js
// Return to base, smelt 20 raw iron, craft & equip full iron armor (chestplate, leggings, helmet)!

console.log('alpha at:', lib.fmt(bot.entity.position));
console.log('Raw iron in inventory:', lib.count('raw_iron'));

// 1. Return to base doorstep at (294, 72, -52)
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
console.log('Safely inside base at:', lib.fmt(bot.entity.position));

// 2. Open furnace, retrieve any output, load 20 raw iron and fuel
const furnaceBlock = bot.blockAt(new Vec3(295, 72, -55));
if (furnaceBlock) {
  try {
    const furnace = await bot.openFurnace(furnaceBlock);
    if (furnace.outputItem()) {
      await furnace.takeOutput();
    }
    const rawCount = lib.count('raw_iron');
    if (rawCount > 0) {
      console.log(`Putting ${rawCount} raw iron into furnace...`);
      await furnace.putInput(mcData.itemsByName.raw_iron.id, null, rawCount);
    }
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

// 3. Smelting loop: harvest ingots and craft armor pieces
console.log('Smelting ingots for full armor...');
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

  // Alpha chestplate (8 ingots)
  if (lib.count('iron_chestplate') === 0 && lib.count('iron_ingot') >= 8) {
    await lib.craft('iron_chestplate', 1);
    console.log('Crafted alpha iron_chestplate!');
    await lib.equipArmor();
  }
  // Alpha leggings (7 ingots)
  if (lib.count('iron_leggings') === 0 && lib.count('iron_ingot') >= 7) {
    await lib.craft('iron_leggings', 1);
    console.log('Crafted alpha iron_leggings!');
    await lib.equipArmor();
  }
  // Alpha helmet (5 ingots)
  if (lib.count('iron_helmet') === 0 && lib.count('iron_ingot') >= 5) {
    await lib.craft('iron_helmet', 1);
    console.log('Crafted alpha iron_helmet!');
    await lib.equipArmor();
  }

  // If Alpha has all 4 armor pieces, craft beta pieces or bucket!
  const alphaFull = lib.count('iron_chestplate') > 0 && lib.count('iron_leggings') > 0 && lib.count('iron_helmet') > 0;
  if (alphaFull) {
    const chestPos = { x: 293, y: 72, z: -57 };
    // beta leggings (7 ingots)
    if (lib.count('iron_ingot') >= 7) {
      await lib.craft('iron_leggings', 1);
      await lib.deposit({ iron_leggings: 1 }, chestPos.x, chestPos.y, chestPos.z);
      console.log('Crafted & deposited beta iron_leggings');
    }
    // beta helmet (5 ingots)
    if (lib.count('iron_ingot') >= 5) {
      await lib.craft('iron_helmet', 1);
      await lib.deposit({ iron_helmet: 1 }, chestPos.x, chestPos.y, chestPos.z);
      console.log('Crafted & deposited beta iron_helmet');
    }
    // bucket for alpha (3 ingots)
    if (lib.count('bucket') === 0 && lib.count('iron_ingot') >= 3) {
      await lib.craft('bucket', 1);
      console.log('Crafted bucket for alpha');
    }
  }
}

await lib.equipArmor();
await lib.equipWeapon();

// Check equipped armor
const slots = bot.inventory.slots;
console.log('Armor worn by alpha:');
console.log('  Head (slot 5):', slots[5]?.name);
console.log('  Torso (slot 6):', slots[6]?.name);
console.log('  Legs (slot 7):', slots[7]?.name);
console.log('  Feet (slot 8):', slots[8]?.name);
console.log('  Off-hand (slot 45):', slots[45]?.name);

bot.chat(`alpha: Armor update: head=${slots[5]?.name}, torso=${slots[6]?.name}, legs=${slots[7]?.name}, feet=${slots[8]?.name}, offhand=${slots[45]?.name}`);

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
