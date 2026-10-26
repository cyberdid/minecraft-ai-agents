// programs/165-walk-up-to-base-and-smelt-iron.js
console.log('--- Returning to Base & Smelting Iron Pickaxe ---');
console.log('Current pos:', lib.fmt(bot.entity.position), 'Raw iron:', lib.count('raw_iron'), 'Night in:', lib.time().secondsUntilNight);

// 1. Walk up the gentle slope at (311, 68, -65)
console.log('Walking up hill via (311, 68, -65)...');
try {
  await lib.goTo(311, 68, -65, 2, { dig: true });
} catch (e) {
  console.log('Slope note:', e.message);
}

// 2. Walk to base entrance (294, 72, -53)
console.log('Walking to base entrance (294, 72, -53)...');
try {
  await lib.goTo(294, 72, -53, 1, { dig: true });
} catch (e) {
  console.log('Base approach note:', e.message);
  await lib.goToXZ(294, -53);
}

// 3. Enter through door
const d = bot.blockAt(new Vec3(294, 72, -54));
if (d) {
  try {
    if (!d.getProperties().open) await bot.activateBlock(d);
    await lib.walkTo(293.5, -56.0, 3000);
    const dAfter = bot.blockAt(new Vec3(294, 72, -54));
    if (dAfter && dAfter.getProperties().open) await bot.activateBlock(dAfter);
    console.log('Safely inside base!');
  } catch (e) {
    console.log('Door entry note:', e.message);
  }
}

console.log('Inside base at:', lib.fmt(bot.entity.position));

// 4. Smelt 3 raw iron in furnace (295, 72, -55)
const furnBlock = bot.blockAt(new Vec3(295, 72, -55));
if (furnBlock && lib.count('raw_iron') > 0) {
  console.log('Opening furnace to smelt raw iron...');
  try {
    await lib.goNearBlock(295, 72, -55);
    const furn = await bot.openFurnace(furnBlock);
    
    // Put raw iron
    const rawIronItem = bot.inventory.items().find(i => i.name === 'raw_iron');
    if (rawIronItem) {
      await furn.putInput(rawIronItem.type, null, rawIronItem.count);
    }
    
    // Put fuel (birch planks or stick)
    const fuelItem = bot.inventory.items().find(i => i.name.endsWith('_planks') || i.name === 'stick');
    if (fuelItem) {
      await furn.putFuel(fuelItem.type, null, fuelItem.count);
    }
    
    console.log('Furnace burning. Waiting for 3 iron ingots...');
    for (let s = 0; s < 35; s++) {
      if (isCancelled()) break;
      await sleep(1000);
      if (furn.outputItem() && furn.outputItem().count >= 3) {
        break;
      }
    }
    if (furn.outputItem()) {
      await furn.takeOutput();
      console.log('Took output from furnace!');
    }
    furn.close();
  } catch (e) {
    console.log('Furnace error:', e.message);
  }
}

console.log('Iron ingots in inventory:', lib.count('iron_ingot'));

// 5. Craft iron pickaxe
if (lib.count('iron_ingot') >= 3) {
  console.log('Crafting iron_pickaxe...');
  try {
    if (lib.count('stick') < 2) {
      await lib.craft('stick', 4);
    }
    await lib.craft('iron_pickaxe', 1);
    console.log('Crafted iron_pickaxe! Milestone 2 restored!');
    bot.chat('alpha: Crafted iron_pickaxe! Heading to mine diamonds for diamond_pickaxe!');
  } catch (e) {
    console.log('Craft pickaxe error:', e.message);
  }
}

console.log('Inventory now:', JSON.stringify(lib.inv()));
console.log('Night in:', lib.time().secondsUntilNight, 's');
