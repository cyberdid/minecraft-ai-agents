// programs/183-return-to-base-smelt-3rd-iron-craft-water-bucket.js
console.log('--- Smelting 3rd Iron & Crafting Water Bucket ---');
console.log('Pos:', lib.fmt(bot.entity.position), 'Iron ingots:', lib.count('iron_ingot'));

// 1. Run back to base entrance
console.log('Running to base (294, 72, -53)...');
try {
  await lib.goTo(294, 72, -53, 1);
  const d = bot.blockAt(new Vec3(294, 72, -54));
  if (d && !d.getProperties().open) await bot.activateBlock(d);
  await lib.walkTo(293.5, -56.0, 3000);
  if (d && d.getProperties().open) await bot.activateBlock(d);
  console.log('Inside base!');
} catch (e) {
  console.log('Run to base note:', e.message);
  await lib.goToXZ(294, -53);
}

// 2. Open furnace at (295, 72, -55) and fuel it
const furnBlock = bot.blockAt(new Vec3(295, 72, -55));
if (furnBlock) {
  try {
    const furn = await bot.openFurnace(furnBlock);
    console.log(`Furnace status: in=${furn.inputItem()?.name}x${furn.inputItem()?.count}, fuel=${furn.fuelItem()?.name}x${furn.fuelItem()?.count}, out=${furn.outputItem()?.name}x${furn.outputItem()?.count}`);
    
    // If output is already there, take it
    if (furn.outputItem()) {
      await furn.takeOutput();
      console.log('Took existing output!');
    }
    
    // Add planks to fuel if input is waiting
    if (furn.inputItem() && (!furn.fuelItem() || furn.fuelItem()?.count === 0)) {
      const plank = bot.inventory.items().find(i => i.name.endsWith('_planks'));
      if (plank) {
        console.log('Fueling furnace with planks...');
        await furn.putFuel(plank.type, null, plank.count);
      }
    }
    
    // Wait for smelting
    for (let s = 0; s < 15; s++) {
      if (isCancelled()) break;
      await sleep(1000);
      if (furn.outputItem()) {
        await furn.takeOutput();
        console.log('Smelted 3rd iron ingot!');
        break;
      }
    }
    furn.close();
  } catch (e) {
    console.log('Furnace error:', e.message);
  }
}

console.log('Iron ingots in inventory:', lib.count('iron_ingot'));

// 3. Craft bucket
if (lib.count('iron_ingot') >= 3 && lib.count('bucket') === 0 && lib.count('water_bucket') === 0) {
  console.log('Crafting bucket...');
  try {
    await lib.craft('bucket', 1);
    console.log('Bucket crafted successfully!');
  } catch (e) {
    console.log('Craft bucket error:', e.message);
  }
}

// 4. Fill bucket with water
if (lib.count('bucket') > 0 && lib.count('water_bucket') === 0) {
  console.log('Filling bucket with water...');
  try {
    const r = await lib.fillBucket('water');
    console.log('fillBucket result:', r);
  } catch (e) {
    console.log('fillBucket note:', e.message);
  }
}

// 5. Deposit water_bucket in base chest for Beta (or hand over)
console.log('Inventory now:', JSON.stringify(lib.inv()));
if (lib.count('water_bucket') > 0) {
  try {
    await lib.deposit({ water_bucket: 1 }, 293, 72, -57);
    bot.chat('beta: Placed water_bucket in base chest! Take it and diamond_pickaxe to lava pool (333, 62, -78)!');
  } catch (e) {
    console.log('Deposit error:', e.message);
  }
} else if (lib.count('bucket') > 0) {
  try {
    await lib.deposit({ bucket: 1 }, 293, 72, -57);
    bot.chat('beta: Placed bucket in chest for you!');
  } catch (e) {}
}

console.log('Night in:', lib.time().secondsUntilNight, 's');
