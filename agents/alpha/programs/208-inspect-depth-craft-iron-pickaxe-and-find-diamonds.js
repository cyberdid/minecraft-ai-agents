// programs/208-inspect-depth-craft-iron-pickaxe-and-find-diamonds.js
console.log('--- Deep Underground: Craft Iron Pickaxe and Locate Diamonds ---');
console.log('Current pos:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

// 1. Scan for any diamonds already exposed or within 32 blocks
let diamondOres = lib.find(['diamond_ore', 'deepslate_diamond_ore'], { maxDistance: 32, count: 10 });
console.log(`Initial scan: found ${diamondOres.length} diamond ores nearby.`);

// 2. Craft a furnace and smelt 3 raw iron into 3 iron ingots
console.log('Crafting and placing furnace to make fresh iron pickaxe...');
try {
  if (lib.count('furnace') === 0) {
    await lib.craft('furnace', 1);
  }
  const spot = await lib.freeSpot();
  console.log('Placing furnace at', lib.fmt(spot));
  await lib.place('furnace', spot.x, spot.y, spot.z);
  
  const furnBlock = bot.blockAt(spot);
  if (furnBlock) {
    const furn = await bot.openFurnace(furnBlock);
    await furn.putFuel(mcData.itemsByName.coal.id, null, 1);
    await furn.putInput(mcData.itemsByName.raw_iron.id, null, 3);
    console.log('Smelting 3 raw iron in underground furnace...');
    const deadline = Date.now() + 35000;
    while (lib.count('iron_ingot') < 3 && Date.now() < deadline) {
      if (isCancelled()) break;
      await sleep(1500);
      if (furn.outputItem()) {
        await furn.takeOutput();
        console.log(`Took smelted output: iron_ingot x${furn.outputItem()?.count || 1}`);
      }
    }
    furn.close();
  }
} catch (e) {
  console.log('Furnace smelt note:', e.message);
}

console.log(`Iron ingots now: ${lib.count('iron_ingot')}`);

// 3. Craft fresh iron pickaxe
if (lib.count('iron_ingot') >= 3 && lib.count('iron_pickaxe') === 0) {
  console.log('Crafting fresh iron_pickaxe (100% durability)...');
  try {
    if (lib.count('stick') < 2) await lib.craft('stick', 4);
    await lib.craft('iron_pickaxe', 1);
    console.log('Fresh iron_pickaxe crafted successfully!');
  } catch (e) {
    console.log('Craft iron_pickaxe error:', e.message);
  }
}

// 4. If no diamonds in range, descend further to y=-54
diamondOres = lib.find(['diamond_ore', 'deepslate_diamond_ore'], { maxDistance: 32, count: 10 });
if (diamondOres.length === 0 && bot.entity.position.y > -50) {
  console.log(`At y=${bot.entity.position.y.toFixed(0)}, no diamonds yet. Continuing descend to y=-54...`);
  try {
    await lib.descend(-54, { torchEvery: 8 });
    console.log('Reached target depth! Pos:', lib.fmt(bot.entity.position));
  } catch (e) {
    console.log('Descend note:', e.message, 'Pos:', lib.fmt(bot.entity.position));
  }
}

// 5. Scan again for diamonds at y <= -50
diamondOres = lib.find(['diamond_ore', 'deepslate_diamond_ore'], { maxDistance: 32, count: 10 });
console.log(`Found ${diamondOres.length} diamond ores at depth ${bot.entity.position.y.toFixed(0)}.`);

// 6. Mine diamonds
for (const d of diamondOres) {
  if (isCancelled() || lib.count('diamond') >= 3) break;
  console.log(`Mining diamond at ${lib.fmt(d.position)}...`);
  try {
    const ironPick = mcData.itemsByName.iron_pickaxe?.id;
    if (ironPick) await bot.equip(ironPick, 'hand');
    await lib.goTo(d.position.x, d.position.y, d.position.z, 2, { dig: true, timeoutMs: 15000 });
    await lib.dig(d.position.x, d.position.y, d.position.z);
    await lib.pickup(4);
  } catch (err) {
    console.log('Dig diamond error:', err.message);
  }
}

console.log(`Total diamonds in inventory: ${lib.count('diamond')}`);

// 7. Craft diamond_pickaxe if 3 diamonds acquired
if (lib.count('diamond') >= 3 && lib.count('diamond_pickaxe') === 0) {
  console.log('Crafting diamond_pickaxe...');
  try {
    if (lib.count('stick') < 2) await lib.craft('stick', 4);
    await lib.craft('diamond_pickaxe', 1);
    console.log('*** MILESTONE 6 ACHIEVED: Diamond Pickaxe crafted! ***');
    bot.chat('beta: *** MILESTONE 6 ACHIEVED! Diamond pickaxe crafted! ***');
  } catch (e) {
    console.log('Craft diamond_pickaxe error:', e.message);
  }
}

console.log('Finished 208. Pos:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food, 'Diamonds:', lib.count('diamond'), 'Diamond pickaxe:', lib.count('diamond_pickaxe'), 'Iron pickaxe:', lib.count('iron_pickaxe'));
