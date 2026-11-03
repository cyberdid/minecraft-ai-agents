// programs/650-find-all-chests-and-furnaces.js
globalThis.isProgramCancelled = isCancelled;

console.log('=== PROGRAM 650: COMPREHENSIVE BASE RESOURCE AUDIT ===');
console.log('Gamma Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// 1. Scan all chests within 24m
const chests = bot.findBlocks({ matching: b => b && (b.name.includes('chest') || b.name.includes('barrel')), maxDistance: 24 });
console.log(`Chests/Barrels within 24m: ${chests.length}`);
for (const cp of chests) {
  const block = bot.blockAt(cp);
  console.log(`Inspecting container at ${lib.fmt(cp)} (${block.name})...`);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(cp.x, cp.y, cp.z, 2.0));
    const container = await bot.openContainer(block);
    const items = container.containerItems();
    console.log(`  Items in ${block.name} at ${lib.fmt(cp)} (${items.length} stacks):`);
    for (const it of items) {
      console.log(`    - ${it.name} x${it.count}`);
    }
    container.close();
  } catch (e) {
    console.log(`  Error opening container at ${lib.fmt(cp)}:`, e.message);
  }
}

// 2. Scan all furnaces within 16m
const furnaces = bot.findBlocks({ matching: b => b && (b.name.includes('furnace') || b.name.includes('smoker')), maxDistance: 16 });
console.log(`Furnaces within 16m: ${furnaces.length}`);
for (const fp of furnaces) {
  const block = bot.blockAt(fp);
  console.log(`Inspecting furnace at ${lib.fmt(fp)}...`);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(fp.x, fp.y, fp.z, 2.0));
    const furnace = await bot.openFurnace(block);
    console.log(`  Furnace at ${lib.fmt(fp)}: input=${furnace.inputItem()?.name} x${furnace.inputItem()?.count}, fuel=${furnace.fuelItem()?.name} x${furnace.fuelItem()?.count}, output=${furnace.outputItem()?.name} x${furnace.outputItem()?.count}`);
    furnace.close();
  } catch (e) {
    console.log(`  Error opening furnace at ${lib.fmt(fp)}:`, e.message);
  }
}

// 3. Scan dropped items on floor
const dropped = Object.values(bot.entities).filter(e => e.name === 'item' && bot.entity.position.distanceTo(e.position) <= 12);
console.log(`Dropped items on ground: ${dropped.length}`);
for (const d of dropped) {
  console.log(`  Item at ${lib.fmt(d.position)}`);
}
await lib.pickup(6.0);

// 4. Teammates inventory / held items
for (const p of Object.values(bot.players)) {
  if (p.entity && p.username !== bot.username) {
    console.log(`Player ${p.username}: pos=${lib.fmt(p.entity.position)}, held=${p.entity.heldItem?.name}`);
  }
}

console.log('Gamma inventory:', JSON.stringify(lib.inv()));
return {
  chestsFound: chests.length,
  furnacesFound: furnaces.length,
  inv: lib.inv()
};
