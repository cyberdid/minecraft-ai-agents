// programs/238-mine-3-more-iron-and-smelt.js
console.log('=== Program 238: Complete Iron Gathering & Smelt Gear ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'Raw iron:', lib.count('raw_iron'), 'Coal:', lib.count('coal'));

// 1. Mine 3-4 more iron ore nearby if under 7
const stonePickId = mcData.itemsByName.stone_pickaxe?.id;
if (stonePickId) await bot.equip(stonePickId, 'hand');

if (lib.count('raw_iron') < 7) {
  const nearbyIron = lib.find(['iron_ore', 'deepslate_iron_ore'], { maxDistance: 16, count: 6 });
  console.log(`Found ${nearbyIron.length} iron ore blocks within 16m`);
  for (const ore of nearbyIron) {
    if (isCancelled() || lib.count('raw_iron') >= 7) break;
    try {
      await bot.equip(stonePickId, 'hand');
      await lib.goTo(ore.position.x, ore.position.y, ore.position.z, 2, { dig: true, timeoutMs: 12000 });
      await bot.equip(stonePickId, 'hand');
      await lib.dig(ore.position.x, ore.position.y, ore.position.z);
      await sleep(200);
      await lib.pickup(4);
    } catch (e) {
      console.log('Dig iron note:', e.message);
    }
  }
}

console.log(`Raw iron now: ${lib.count('raw_iron')}`);

// 2. Return to base
console.log('Returning to base...');
try {
  await lib.goTo(294, 72, -52, 2, { timeoutMs: 35000 });
  if (typeof passDoorIn === 'function') await passDoorIn();
  else await lib.goThroughDoor(294, 72, -54);
  console.log('Inside base! Pos:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Return note:', e.message);
}

// 3. Check chest for flint / gravel
const chestPos = new Vec3(293, 72, -57);
try {
  const contents = await lib.chestContents(chestPos.x, chestPos.y, chestPos.z);
  console.log('Base chest items:', JSON.stringify(contents));
  if (contents.flint > 0 && lib.count('flint') === 0) {
    await lib.withdraw({ flint: contents.flint }, chestPos.x, chestPos.y, chestPos.z);
  } else if (contents.gravel > 0 && lib.count('flint') === 0) {
    await lib.withdraw({ gravel: Math.min(contents.gravel, 12) }, chestPos.x, chestPos.y, chestPos.z);
  }
} catch (e) {}

// Dig gravel for flint if needed
if (lib.count('flint') === 0 && lib.count('gravel') > 0) {
  const digSpot = new Vec3(294, 72, -56);
  for (let attempt = 0; attempt < 20 && lib.count('flint') === 0 && lib.count('gravel') > 0; attempt++) {
    try {
      const blk = bot.blockAt(digSpot);
      if (blk && blk.name === 'air') await lib.place('gravel', digSpot.x, digSpot.y, digSpot.z);
      await lib.dig(digSpot.x, digSpot.y, digSpot.z);
      await sleep(150);
      await lib.pickup(4);
    } catch (e) {}
  }
}

// 4. Smelt raw iron in base furnace
const rawToSmelt = lib.count('raw_iron');
if (rawToSmelt > 0) {
  console.log(`Smelting ${rawToSmelt} raw iron in furnace...`);
  try {
    const furnBlock = bot.blockAt(new Vec3(295, 72, -55));
    if (furnBlock) {
      const furn = await bot.openFurnace(furnBlock);
      const coalCount = Math.ceil(rawToSmelt / 8);
      if (lib.count('coal') >= coalCount) {
        await furn.putFuel(mcData.itemsByName.coal.id, null, coalCount);
      } else {
        const plankItem = bot.inventory.items().find(i => i.name.endsWith('_planks'));
        if (plankItem) await furn.putFuel(plankItem.type, null, 4);
      }
      await furn.putInput(mcData.itemsByName.raw_iron.id, null, rawToSmelt);
      
      const deadline = Date.now() + (rawToSmelt * 10500) + 5000;
      while (lib.count('iron_ingot') < rawToSmelt && Date.now() < deadline) {
        if (isCancelled()) break;
        await sleep(1500);
        if (furn.outputItem()) {
          await furn.takeOutput();
          console.log(`Took smelted output: iron_ingot x${lib.count('iron_ingot')}`);
        }
      }
      furn.close();
    }
  } catch (e) {
    console.log('Smelt error:', e.message);
  }
}

console.log(`Iron ingots ready: ${lib.count('iron_ingot')}`);

// 5. Craft Iron Pickaxe, Bucket, and Flint and Steel
try {
  if (lib.count('stick') < 4 && lib.count('*_planks') >= 2) await lib.craft('stick', 4);
  
  if (lib.count('iron_ingot') >= 3 && lib.count('iron_pickaxe') === 0) {
    await lib.craft('iron_pickaxe', 1);
    console.log('Crafted iron_pickaxe!');
  }
  if (lib.count('iron_ingot') >= 3 && lib.count('bucket') === 0 && lib.count('water_bucket') === 0) {
    await lib.craft('bucket', 1);
    console.log('Crafted bucket!');
  }
  if (lib.count('iron_ingot') >= 1 && lib.count('flint') >= 1 && lib.count('flint_and_steel') === 0) {
    await lib.craft('flint_and_steel', 1);
    console.log('Crafted flint_and_steel!');
  }
} catch (e) {
  console.log('Craft gear error:', e.message);
}

// 6. Fill bucket with water if empty
if (lib.count('bucket') > 0 && lib.count('water_bucket') === 0) {
  console.log('Filling bucket with water...');
  try {
    await lib.fillBucket('water');
    console.log('Water bucket filled!');
  } catch (e) {
    console.log('Fill water note:', e.message);
  }
}

bot.chat(`beta: Gear ready! iron_pickaxe=${lib.count('iron_pickaxe')}, water_bucket=${lib.count('water_bucket')}, flint_and_steel=${lib.count('flint_and_steel')}. Pos: ${lib.fmt(bot.entity.position)}.`);
console.log('Inventory now:', JSON.stringify(lib.inv()));
