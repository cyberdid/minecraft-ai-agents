// programs/568-mine-east-hill-iron.js
globalThis.isProgramCancelled = isCancelled;
console.log('=== DELTA: MINE EAST HILL IRON & CRAFT TOOLS ===');
console.log(`Starting pos: ${lib.fmt(bot.entity.position)}, Flint: ${lib.count('flint')}`);

// Step 1: Walk to East Hill at (350, 55, -35)
console.log('Heading to East hill (350, 55, -35)...');
try {
  await lib.goTo(350, 55, -35, 4, { timeoutMs: 25000 });
} catch (e) {
  try { await lib.goToXZ(350, -35, { timeoutMs: 15000 }); } catch (e2) {}
}

console.log(`Arrived at East hill: ${lib.fmt(bot.entity.position)}`);

// Step 2: Scan and mine iron ore & coal
const ironBlocks = bot.findBlocks({
  matching: b => b && (b.name === 'iron_ore' || b.name === 'deepslate_iron_ore'),
  maxDistance: 32,
  count: 10
});
const coalBlocks = bot.findBlocks({
  matching: b => b && (b.name === 'coal_ore' || b.name === 'deepslate_coal_ore'),
  maxDistance: 32,
  count: 6
});

console.log(`Found ${ironBlocks.length} iron ore blocks, ${coalBlocks.length} coal ore blocks`);

// Mine coal first for fuel
for (const cp of coalBlocks) {
  if (lib.count('coal') >= 4 || isCancelled()) break;
  const cb = bot.blockAt(cp);
  if (cb) {
    try {
      await lib.equipTool('iron_pickaxe');
      await bot.pathfinder.goto(new goals.GoalNear(cp.x, cp.y, cp.z, 2));
      await bot.dig(cb);
      await sleep(250);
      await lib.pickup(3.5);
    } catch (e) {}
  }
}

// Mine iron ore
for (const ip of ironBlocks) {
  if (lib.count('raw_iron') >= 5 || isCancelled()) break;
  const ib = bot.blockAt(ip);
  if (ib) {
    try {
      await lib.equipTool('iron_pickaxe');
      await bot.pathfinder.goto(new goals.GoalNear(ip.x, ip.y, ip.z, 2));
      await bot.dig(ib);
      await sleep(250);
      await lib.pickup(3.5);
    } catch (e) {}
  }
}

try { await lib.pickup(4); } catch (e) {}
console.log(`Gathered: raw_iron=${lib.count('raw_iron')}, coal=${lib.count('coal')}`);

// Step 3: Return to base
console.log('Returning to base (293, 72, -55)...');
try {
  await lib.goTo(293, 72, -55, 2, { timeoutMs: 25000 });
} catch (e) {
  try { await bot.pathfinder.goto(new goals.GoalNear(293, 72, -55, 2)); } catch (e2) {}
}

if (bot.entity.position.z > -54.0) {
  try { await lib.goThroughDoor(294, 72, -54); } catch (e) {}
}

// Step 4: Smelt iron in base furnace (295, 72, -55)
const fb = bot.blockAt(new Vec3(295, 72, -55));
if (fb && lib.count('raw_iron') > 0) {
  console.log(`Smelting ${lib.count('raw_iron')} raw iron in furnace...`);
  try {
    const f = await bot.openFurnace(fb);
    const raw = bot.inventory.items().find(i => i.name === 'raw_iron');
    await f.putInput(raw.type, null, Math.min(raw.count, 4));
    const fuel = bot.inventory.items().find(i => i.name === 'coal' || i.name.includes('planks'));
    if (fuel) await f.putFuel(fuel.type, null, 1);
    f.close();

    console.log('Waiting 15s for iron to smelt...');
    await sleep(15000);

    const f2 = await bot.openFurnace(fb);
    const out = f2.outputItem();
    if (out) {
      console.log(`Withdrawing smelted output: ${out.name} x${out.count}`);
      await f2.takeOutput();
    }
    f2.close();
  } catch (e) {
    console.log('Smelting error:', e.message);
  }
}

// Step 5: Craft flint_and_steel
if (lib.count('flint') >= 1 && lib.count('iron_ingot') >= 1 && lib.count('flint_and_steel') === 0) {
  try {
    console.log('Crafting flint_and_steel...');
    await lib.craft('flint_and_steel', 1);
    console.log('FLINT AND STEEL CRAFTED!');
    bot.chat('delta: Crafted flint_and_steel!');
  } catch (e) {}
}

// Craft bucket if we have 3 iron ingots
if (lib.count('iron_ingot') >= 3 && lib.count('bucket') === 0) {
  try {
    console.log('Crafting bucket...');
    await lib.craft('bucket', 1);
    console.log('BUCKET CRAFTED!');
    bot.chat('delta: Crafted bucket! Ready to scoop lava and cast obsidian!');
  } catch (e) {}
}

console.log('=== SUMMARY ===');
console.log(`Flint & steel: ${lib.count('flint_and_steel')}, Bucket: ${lib.count('bucket')}, Iron ingots: ${lib.count('iron_ingot')}`);
console.log(`Inv:`, JSON.stringify(lib.inv()));

return {
  flint_and_steel: lib.count('flint_and_steel'),
  bucket: lib.count('bucket'),
  iron_ingot: lib.count('iron_ingot'),
  raw_iron: lib.count('raw_iron'),
  inv: lib.inv()
};
