// programs/567-mine-shaft-iron.js
globalThis.isProgramCancelled = isCancelled;
console.log('=== DELTA: MINE SHAFT IRON & ASCEND ===');
console.log(`Pos: ${lib.fmt(bot.entity.position)}, Flint: ${lib.count('flint')}`);

// 1. Scan for iron ore within 16m
const ores = bot.findBlocks({
  matching: b => b && (b.name === 'iron_ore' || b.name === 'deepslate_iron_ore'),
  maxDistance: 16,
  count: 8
});

console.log(`Iron ore blocks within 16m: ${ores.length}`);
for (const op of ores) {
  if (lib.count('raw_iron') >= 1 || isCancelled()) break;
  const b = bot.blockAt(op);
  if (b) {
    console.log(`Mining ${b.name} at ${lib.fmt(op)}...`);
    try {
      await lib.equipTool('iron_pickaxe');
      await bot.pathfinder.goto(new goals.GoalNear(op.x, op.y, op.z, 2));
      await bot.dig(b);
      await sleep(300);
      await lib.pickup(3.5);
    } catch (e) {
      console.log('Dig error:', e.message);
    }
  }
}

try { await lib.pickup(4); } catch (e) {}
console.log(`Raw iron collected: ${lib.count('raw_iron')}`);

// 2. Ascend to surface base (293, 72, -55)
console.log('Ascending stairs to base...');
const ascendWaypoints = [
  new Vec3(308, 55, -38),
  new Vec3(302, 65, -42),
  new Vec3(302, 71, -44),
  new Vec3(293, 72, -55)
];

for (let i = 0; i < ascendWaypoints.length; i++) {
  const wp = ascendWaypoints[i];
  console.log(`Ascending to WP ${i + 1}/${ascendWaypoints.length}: ${lib.fmt(wp)}...`);
  try {
    await lib.goTo(wp.x, wp.y, wp.z, 2, { timeoutMs: 12000 });
  } catch (e) {
    try { await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2)); } catch (e2) {}
  }
}

// 3. Enter base and smelt iron
if (bot.entity.position.z > -54.0) {
  try { await lib.goThroughDoor(294, 72, -54); } catch (e) {}
}

const fb = bot.blockAt(new Vec3(295, 72, -55));
if (lib.count('raw_iron') > 0 && fb) {
  console.log('Smelting raw iron in furnace...');
  try {
    const f = await bot.openFurnace(fb);
    const raw = bot.inventory.items().find(i => i.name === 'raw_iron');
    await f.putInput(raw.type, null, 1);
    const fuel = bot.inventory.items().find(i => i.name.includes('planks') || i.name === 'coal');
    if (fuel) await f.putFuel(fuel.type, null, 1);
    f.close();

    console.log('Cooking iron in furnace, waiting 10s...');
    await sleep(10000);

    const f2 = await bot.openFurnace(fb);
    const out = f2.outputItem();
    if (out) {
      console.log(`Withdrawing ${out.name} x${out.count}`);
      await f2.takeOutput();
    }
    f2.close();
  } catch (e) {
    console.log('Smelt error:', e.message);
  }
}

// 4. Craft flint_and_steel
console.log(`Flint: ${lib.count('flint')}, Iron ingots: ${lib.count('iron_ingot')}`);
if (lib.count('flint') >= 1 && lib.count('iron_ingot') >= 1) {
  try {
    console.log('Crafting flint_and_steel...');
    await lib.craft('flint_and_steel', 1);
    console.log('FLINT AND STEEL CRAFTED SUCCESSFULLY!');
    bot.chat('delta: Crafted flint_and_steel! Standing by to ignite the Nether portal!');
  } catch (e) {
    console.log('Craft flint_and_steel notice:', e.message);
  }
}

return {
  flint_and_steel: lib.count('flint_and_steel'),
  raw_iron: lib.count('raw_iron'),
  iron_ingot: lib.count('iron_ingot'),
  pos: bot.entity.position,
  inv: lib.inv()
};
