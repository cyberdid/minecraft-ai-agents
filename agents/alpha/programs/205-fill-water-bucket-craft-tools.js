// programs/205-fill-water-bucket-craft-tools.js
console.log('--- Step: Fill Water Bucket, Craft 2nd Bucket & Flint and Steel ---');
console.log('Start pos:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food, 'Night in:', lib.time().secondsUntilNight);

const chestPos = new Vec3(293, 72, -57);

// 1. Take output from all furnaces
const furns = [new Vec3(295, 72, -55), new Vec3(295, 72, -54), new Vec3(295, 72, -56)];
for (const fpos of furns) {
  const b = bot.blockAt(fpos);
  if (b && b.name === 'furnace') {
    try {
      const furn = await bot.openFurnace(b);
      if (furn.outputItem()) {
        console.log(`Took ${furn.outputItem().count} ${furn.outputItem().name} from furnace at ${lib.fmt(fpos)}`);
        await furn.takeOutput();
      }
      furn.close();
    } catch (e) {}
  }
}

console.log('Iron ingots in inventory:', lib.count('iron_ingot'));

// 2. Craft 2nd bucket for Beta if we have >= 3 iron ingots
if (lib.count('iron_ingot') >= 3) {
  console.log('Crafting 2nd bucket for Beta...');
  try {
    await lib.craft('bucket', 1);
    await lib.deposit({ bucket: 1 }, chestPos.x, chestPos.y, chestPos.z);
    console.log('2nd bucket placed in chest for Beta!');
    bot.chat('beta: Placed a bucket in the base chest for you! Fill it with water at river.');
  } catch (e) {
    console.log('Craft 2nd bucket note:', e.message);
  }
}

// 3. Step outside to fill Alpha's bucket with water
console.log('Stepping outside to fill water bucket...');
try {
  if (typeof passDoorOut === 'function') await passDoorOut();
  else await lib.goThroughDoor(294, 72, -54);
  console.log('Outside base! Current pos:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Door exit error:', e.message);
}

// Fill bucket from river
if (lib.count('bucket') > 0 && lib.count('water_bucket') === 0) {
  console.log('Filling bucket from river...');
  try {
    const r = await lib.fillBucket('water');
    console.log('Water bucket filled!', r);
    bot.chat('beta: Water bucket filled! Milestone 5 water requirement met for Alpha.');
  } catch (e) {
    console.log('fillBucket note:', e.message);
    // Try walking closer to river at (285, 71, -50)
    try {
      await lib.goTo(285, 71, -50, 2);
      const r2 = await lib.fillBucket('water');
      console.log('Water bucket filled on 2nd try!', r2);
    } catch (e2) {
      console.log('fillBucket 2nd try error:', e2.message);
    }
  }
}

// 4. Return inside base
console.log('Returning inside base...');
try {
  await lib.goTo(294, 72, -52, 1);
  if (typeof passDoorIn === 'function') await passDoorIn();
  else await lib.goThroughDoor(294, 72, -54);
  console.log('Inside base! Pos:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Return error:', e.message);
}

// 5. Inspect chest for flint / gravel to craft flint_and_steel
try {
  const chest = await lib.chestContents(chestPos.x, chestPos.y, chestPos.z);
  console.log('Chest contents:', JSON.stringify(chest));
  
  // Withdraw food for expedition
  if (chest.cooked_porkchop && chest.cooked_porkchop > 0) {
    await lib.withdraw({ cooked_porkchop: Math.min(chest.cooked_porkchop, 4) }, chestPos.x, chestPos.y, chestPos.z);
    console.log('Withdrew cooked_porkchop for expedition.');
  }

  // Check flint
  if (lib.count('flint') === 0) {
    if (chest.flint && chest.flint > 0) {
      await lib.withdraw({ flint: 1 }, chestPos.x, chestPos.y, chestPos.z);
    }
  }
} catch (e) {}

// Craft flint_and_steel if we have flint and iron_ingot
if (lib.count('flint') > 0 && lib.count('iron_ingot') > 0 && lib.count('flint_and_steel') === 0) {
  console.log('Crafting flint_and_steel...');
  try {
    await lib.craft('flint_and_steel', 1);
    console.log('Flint and steel crafted!');
    bot.chat('beta: Crafted flint_and_steel! Portal lighter is ready.');
  } catch (e) {
    console.log('Craft flint_and_steel note:', e.message);
  }
}

console.log('Finished 205. Pos:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food, 'Water bucket:', lib.count('water_bucket'), 'Night in:', lib.time().secondsUntilNight, 's');
