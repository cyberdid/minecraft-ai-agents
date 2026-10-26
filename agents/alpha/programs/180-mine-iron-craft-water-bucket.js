// programs/180-mine-iron-craft-water-bucket.js
console.log('--- Mining Iron & Crafting Water Bucket for Beta ---');
console.log('Pos:', lib.fmt(bot.entity.position), 'Night in:', lib.time().secondsUntilNight);

bot.chat('beta: Mining 3 iron right now to craft water_bucket for you!');

// 1. Step outside base
const d = bot.blockAt(new Vec3(294, 72, -54));
if (d && !d.getProperties().open) await bot.activateBlock(d);
await lib.walkTo(294.5, -52.0, 3000);
if (d && d.getProperties().open) await bot.activateBlock(d);

// 2. Locate safe iron ore at y >= 50
const ores = bot.findBlocks({
  matching: b => b.name === 'iron_ore' || b.name === 'deepslate_iron_ore',
  maxDistance: 32,
  count: 10
}).map(p => bot.blockAt(p))
  .filter(b => b && b.position.y >= 50)
  .sort((a, b) => a.position.distanceTo(bot.entity.position) - b.position.distanceTo(bot.entity.position));

console.log(`Found ${ores.length} safe iron ores.`);
await bot.equip(mcData.itemsByName.iron_pickaxe.id, 'hand');

for (const ore of ores) {
  if (lib.count('raw_iron') >= 3) break;
  console.log(`Mining iron at ${lib.fmt(ore.position)}...`);
  try {
    await lib.goTo(ore.position.x, ore.position.y, ore.position.z, 2, { dig: true });
    await bot.dig(bot.blockAt(ore.position));
    await lib.pickup(4);
  } catch (e) {
    console.log(`Mine error at ${lib.fmt(ore.position)}:`, e.message);
  }
}

console.log('Raw iron count:', lib.count('raw_iron'));

// 3. Return to base
console.log('Returning to base entrance (294, 72, -53)...');
try {
  await lib.goTo(294, 72, -53, 1, { dig: true });
  const d2 = bot.blockAt(new Vec3(294, 72, -54));
  if (d2 && !d2.getProperties().open) await bot.activateBlock(d2);
  await lib.walkTo(293.5, -56.0, 3000);
  if (d2 && d2.getProperties().open) await bot.activateBlock(d2);
  console.log('Safely inside base!');
} catch (e) {
  console.log('Return error:', e.message);
}

// 4. Craft planks from birch_log if needed for fuel
if (lib.count('*_planks') < 2 && lib.count('*_log') > 0) {
  const log = Object.keys(lib.inv()).find(k => k.endsWith('_log'));
  await lib.craft(log.replace('_log', '_planks'), 4);
}

// 5. Smelt raw iron in base furnace
const furnBlock = bot.blockAt(new Vec3(295, 72, -55));
if (furnBlock) {
  try {
    const furn = await bot.openFurnace(furnBlock);
    
    // Put raw iron
    const raw = bot.inventory.items().find(i => i.name === 'raw_iron');
    if (raw) {
      await furn.putInput(raw.type, null, raw.count);
    }
    
    // Put fuel
    const fuel = bot.inventory.items().find(i => i.name.endsWith('_planks') || i.name === 'stick');
    if (fuel && (!furn.fuelItem() || furn.fuelItem()?.count === 0)) {
      await furn.putFuel(fuel.type, null, fuel.count);
    }
    
    console.log('Smelting in progress...');
    for (let s = 0; s < 30; s++) {
      if (isCancelled()) break;
      await sleep(1000);
      if (furn.outputItem() && furn.outputItem().count >= 3) break;
    }
    
    if (furn.outputItem()) {
      await furn.takeOutput();
      console.log('Took smelted iron!');
    }
    furn.close();
  } catch (e) {
    console.log('Furnace error:', e.message);
  }
}

console.log('Iron ingots in inventory:', lib.count('iron_ingot'));

// 6. Craft Bucket
if (lib.count('iron_ingot') >= 3) {
  try {
    await lib.craft('bucket', 1);
    console.log('Bucket crafted!');
  } catch (e) {
    console.log('Bucket craft error:', e.message);
  }
}

// 7. If we have bucket, fill with water
if (lib.count('bucket') > 0) {
  console.log('Filling bucket with water...');
  try {
    await lib.fillBucket('water');
    console.log('Filled bucket with water!');
  } catch (e) {
    console.log('fillBucket note:', e.message);
  }
}

// 8. Deposit water_bucket (or bucket) in base chest for Beta
try {
  if (lib.count('water_bucket') > 0) {
    await lib.deposit({ water_bucket: 1 }, 293, 72, -57);
    bot.chat('beta: Placed water_bucket in base chest! Ready for 10 obsidian at (333, 62, -78)!');
  } else if (lib.count('bucket') > 0) {
    await lib.deposit({ bucket: 1 }, 293, 72, -57);
    bot.chat('beta: Placed bucket in base chest for you!');
  }
} catch (e) {
  console.log('Deposit error:', e.message);
}

console.log('Final inv:', JSON.stringify(lib.inv()));
console.log('Night in:', lib.time().secondsUntilNight, 's');
