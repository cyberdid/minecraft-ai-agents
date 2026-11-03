// programs/390-check-furnaces-and-quarry.js
console.log('=== CHECK FURNACES & MINE COBBLESTONE ===');
console.log('Start inv:', JSON.stringify(lib.inv()));

// 1. Check all 3 furnaces
const furnaceCoords = [
  new Vec3(295, 72, -54),
  new Vec3(295, 72, -55),
  new Vec3(295, 72, -56)
];

for (const fc of furnaceCoords) {
  const block = bot.blockAt(fc);
  if (!block || !block.name.includes('furnace')) {
    console.log(`No furnace at ${lib.fmt(fc)} (block: ${block?.name})`);
    continue;
  }
  try {
    const furnace = await bot.openFurnace(block);
    const out = furnace.outputItem();
    const inp = furnace.inputItem();
    const fuel = furnace.fuelItem();
    console.log(`Furnace at ${lib.fmt(fc)}: out=${out?.name}x${out?.count}, in=${inp?.name}x${inp?.count}, fuel=${fuel?.name}x${fuel?.count}`);
    if (out && out.count > 0) {
      await furnace.takeOutput();
      console.log(`Took output: ${out.name} x${out.count}`);
    }
    furnace.close();
  } catch (e) {
    console.log(`Furnace at ${lib.fmt(fc)} error:`, e.message);
  }
}

console.log('Inventory after furnaces:', JSON.stringify(lib.inv()));

// 2. Step outside base door to quarry
console.log('Exiting base door to quarry...');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  try {
    await lib.door(294, 72, -54, true);
    await bot.pathfinder.goto(new goals.GoalBlock(294, 72, -53));
    await lib.door(294, 72, -54, false);
  } catch (e2) {}
}

// 3. Collect cobblestone up to 32
const currentCobble = lib.count('cobblestone');
const needed = Math.max(0, 32 - currentCobble);
if (needed > 0) {
  console.log(`Mining ${needed} stone for cobblestone...`);
  try {
    const mined = await lib.collect('stone', needed);
    console.log('Mined stone! Result:', JSON.stringify(mined));
  } catch (e) {
    console.log('Collect stone error:', e.message);
  }
}

// 4. Check for animals near base for food
try {
  const animal = bot.nearestEntity(e => (e.name === 'cow' || e.name === 'pig' || e.name === 'sheep') && e.position.distanceTo(bot.entity.position) < 24);
  if (animal) {
    console.log(`Found ${animal.name} at ${lib.fmt(animal.position)}, hunting...`);
    await lib.hunt(animal.name, 1);
  }
} catch (e) {
  console.log('Hunt error:', e.message);
}

// 5. Craft spare stone pickaxe and sword if needed
if (lib.count('stone_pickaxe') < 2 && lib.count('cobblestone') >= 3 && lib.count('stick') >= 2) {
  try { await lib.craft('stone_pickaxe', 1); } catch (e) {}
}
if (lib.count('stone_sword') < 2 && lib.count('cobblestone') >= 2 && lib.count('stick') >= 1) {
  try { await lib.craft('stone_sword', 1); } catch (e) {}
}

await lib.equipWeapon();
console.log('Ending inventory:', JSON.stringify(lib.inv()));
console.log('Ending status:', JSON.stringify(lib.status()));
