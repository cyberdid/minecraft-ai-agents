// programs/240-ascend-smelt-gear-and-fill-water.js
console.log('=== Program 240: Ascend, Smelt Gear, Eat & Fill Water Bucket ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

// 1. Ascend existing safe staircase to surface
const upStages = [
  { x: 303, y: 0, z: -69 },
  { x: 313, y: 14, z: -58 },
  { x: 325, y: 31, z: -55 },
  { x: 335, y: 50, z: -48 },
  { x: 345, y: 65, z: -40 }
];

for (let i = 0; i < upStages.length; i++) {
  if (isCancelled()) break;
  const st = upStages[i];
  try {
    await lib.goTo(st.x, st.y, st.z, 2, { timeoutMs: 18000 });
    console.log(`Reached up-stage at y=${bot.entity.position.y.toFixed(0)}`);
  } catch (e) {}
}

// 2. Go to base entrance and enter
console.log('Heading into base...');
try {
  await lib.goTo(294, 72, -52, 2, { timeoutMs: 25000 });
  if (typeof passDoorIn === 'function') await passDoorIn();
  else await lib.goThroughDoor(294, 72, -54);
  console.log('Inside base! Pos:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Enter base note:', e.message);
}

// 3. Withdraw food from chest and eat
const chestPos = new Vec3(293, 72, -57);
try {
  const contents = await lib.chestContents(chestPos.x, chestPos.y, chestPos.z);
  console.log('Chest items:', JSON.stringify(contents));
  if (contents.cooked_mutton > 0) {
    await lib.withdraw({ cooked_mutton: contents.cooked_mutton }, chestPos.x, chestPos.y, chestPos.z);
  }
  if (contents.flint > 0 && lib.count('flint') === 0) {
    await lib.withdraw({ flint: contents.flint }, chestPos.x, chestPos.y, chestPos.z);
  } else if (contents.gravel > 0 && lib.count('flint') === 0) {
    await lib.withdraw({ gravel: Math.min(contents.gravel, 12) }, chestPos.x, chestPos.y, chestPos.z);
  }
} catch (e) {}

// Eat food
for (const f of ['cooked_mutton', 'cooked_porkchop', 'cooked_beef']) {
  if (lib.count(f) > 0) {
    try {
      if (typeof safeEat === 'function') await safeEat(f);
      else await lib.eat();
    } catch (e) {}
  }
}

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

// 4. Smelt 3 raw iron in furnace
if (lib.count('raw_iron') > 0) {
  console.log('Smelting raw iron in base furnace...');
  try {
    const furnBlock = bot.blockAt(new Vec3(295, 72, -55));
    if (furnBlock) {
      const furn = await bot.openFurnace(furnBlock);
      await furn.putFuel(mcData.itemsByName.coal.id, null, 1);
      await furn.putInput(mcData.itemsByName.raw_iron.id, null, lib.count('raw_iron'));
      const deadline = Date.now() + 35000;
      while (lib.count('iron_ingot') < 4 && Date.now() < deadline) {
        if (isCancelled()) break;
        await sleep(1500);
        if (furn.outputItem()) await furn.takeOutput();
      }
      furn.close();
    }
  } catch (e) {
    console.log('Smelt note:', e.message);
  }
}

console.log(`Iron ingots now: ${lib.count('iron_ingot')}`);

// 5. Craft Bucket and Flint and Steel
try {
  if (lib.count('iron_ingot') >= 3 && lib.count('bucket') === 0 && lib.count('water_bucket') === 0) {
    await lib.craft('bucket', 1);
    console.log('Crafted bucket!');
  }
  if (lib.count('iron_ingot') >= 1 && lib.count('flint') >= 1 && lib.count('flint_and_steel') === 0) {
    await lib.craft('flint_and_steel', 1);
    console.log('Crafted flint_and_steel!');
  }
} catch (e) {
  console.log('Craft note:', e.message);
}

// 6. Fill bucket with water outside base
if (lib.count('bucket') > 0 && lib.count('water_bucket') === 0) {
  console.log('Filling bucket with water...');
  try {
    if (typeof passDoorOut === 'function') await passDoorOut();
    await lib.fillBucket('water');
    console.log('Water bucket filled!');
    if (typeof passDoorIn === 'function') await passDoorIn();
  } catch (e) {
    console.log('Fill water note:', e.message);
  }
}

bot.chat(`beta: Diamond pickaxe (${lib.count('diamond_pickaxe')}), bucket (${lib.count('water_bucket')}), flint & steel (${lib.count('flint_and_steel')}). All set for obsidian!`);
console.log('Inventory now:', JSON.stringify(lib.inv()));
