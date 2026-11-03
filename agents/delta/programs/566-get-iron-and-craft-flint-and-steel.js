// programs/566-get-iron-and-craft-flint-and-steel.js
globalThis.isProgramCancelled = isCancelled;
console.log('=== DELTA: GET IRON & CRAFT FLINT AND STEEL ===');
console.log(`Starting pos: ${lib.fmt(bot.entity.position)}, Flint: ${lib.count('flint')}`);

// Step 1: Check base furnaces and chest first
const fb = bot.blockAt(new Vec3(295, 72, -55));
let foundIron = false;
if (fb && fb.name.includes('furnace')) {
  try {
    const f = await bot.openFurnace(fb);
    const out = f.outputItem();
    if (out && out.name === 'iron_ingot') {
      console.log('Found iron_ingot in furnace output!');
      await f.takeOutput();
      foundIron = true;
    }
    f.close();
  } catch (e) {}
}

// Step 2: If no iron ingot, mine iron ore in shaft staircase (302, 71, -44)
if (lib.count('iron_ingot') === 0) {
  console.log('Heading to shaft entrance at (302, 71, -44)...');
  try {
    await lib.goTo(302, 71, -44, 2, { timeoutMs: 12000 });
  } catch (e) {}

  // Scan for iron ore down the stairs
  const ironOres = bot.findBlocks({
    matching: b => b && (b.name === 'iron_ore' || b.name === 'deepslate_iron_ore'),
    maxDistance: 24,
    count: 4
  });

  console.log(`Iron ore blocks found near shaft: ${ironOres.length}`);
  if (ironOres.length > 0) {
    const target = ironOres[0];
    console.log(`Mining iron ore at ${lib.fmt(target)}...`);
    try {
      await lib.equipTool('iron_pickaxe');
      await bot.pathfinder.goto(new goals.GoalNear(target.x, target.y, target.z, 2));
      const b = bot.blockAt(target);
      if (b) await bot.dig(b);
      await sleep(300);
      await lib.pickup(3.5);
    } catch (e) {
      console.log('Mine iron notice:', e.message);
    }
  } else {
    // Try lib.obtain raw_iron
    try {
      console.log('Calling lib.obtain(raw_iron, 1)...');
      await lib.obtain('raw_iron', 1);
    } catch (e) {
      console.log('obtain raw_iron notice:', e.message);
    }
  }

  // Smelt raw iron if we have it
  if (lib.count('raw_iron') > 0) {
    console.log('Smelting raw_iron in furnace (295, 72, -55)...');
    try {
      await lib.goTo(294, 72, -55, 1);
      const f = await bot.openFurnace(fb);
      const raw = bot.inventory.items().find(i => i.name === 'raw_iron');
      await f.putInput(raw.type, null, 1);
      const fuel = bot.inventory.items().find(i => i.name.includes('planks'));
      if (fuel) await f.putFuel(fuel.type, null, 1);
      f.close();

      console.log('Waiting 10s for iron to smelt...');
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
}

// Step 3: Craft flint_and_steel
console.log(`Flint: ${lib.count('flint')}, Iron ingots: ${lib.count('iron_ingot')}`);
if (lib.count('flint') >= 1 && lib.count('iron_ingot') >= 1) {
  try {
    console.log('Crafting flint_and_steel...');
    await lib.craft('flint_and_steel', 1);
    console.log('FLINT AND STEEL CRAFTED SUCCESSFULLY!');
    bot.chat('delta: Crafted flint_and_steel! Ready to ignite the Nether portal!');
  } catch (e) {
    console.log('Craft flint_and_steel notice:', e.message);
  }
}

console.log('=== SUMMARY ===');
console.log(`Flint & steel: ${lib.count('flint_and_steel')}, Inv:`, JSON.stringify(lib.inv()));

return {
  flint_and_steel: lib.count('flint_and_steel'),
  iron_ingot: lib.count('iron_ingot'),
  flint: lib.count('flint'),
  inv: lib.inv()
};
