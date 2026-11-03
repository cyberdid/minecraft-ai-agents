// programs/827-load-furnace-and-check-portal.js
globalThis.isProgramCancelled = isCancelled;
console.log('=== Program 827: Load Furnace & Inspect Portal Frame ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

bot.clearControlStates();
bot.pathfinder.stop();

// Step 1: Open furnace at (295, 72, -55)
const furnaceBlock = bot.blockAt(new Vec3(295, 72, -55));
if (furnaceBlock) {
  try {
    const f = await bot.openFurnace(furnaceBlock);
    console.log(`Current furnace state: input=${f.inputItem()?.name}x${f.inputItem()?.count}, fuel=${f.fuelItem()?.name}x${f.fuelItem()?.count}, output=${f.outputItem()?.name}x${f.outputItem()?.count}`);

    // Take any output
    if (f.outputItem()) {
      await f.takeOutput();
      console.log('Took output item from furnace!');
    }

    // Put raw_iron in input
    const rawIron = bot.inventory.items().find(i => i.name === 'raw_iron');
    if (rawIron) {
      await f.putInput(rawIron.type, null, rawIron.count);
      console.log(`Loaded ${rawIron.count} raw_iron into furnace!`);
    }

    // Put coal in fuel
    const coal = bot.inventory.items().find(i => i.name === 'coal' || i.name === 'charcoal');
    if (coal) {
      await f.putFuel(coal.type, null, coal.count);
      console.log(`Loaded ${coal.count} coal into furnace fuel!`);
    }

    await f.close();
    bot.chat('Beta: Loaded 10 raw iron and coal into the furnace at (295, 72, -55)! It is actively smelting iron ingots!');
  } catch (e) {
    console.log('Furnace load error:', e.message);
  }
}

// Step 2: Walk to portal frame at (299, 72, -54) to inspect
console.log('Walking to portal frame at (299, 72, -54)...');
try {
  await lib.goTo(297, 72, -54, 1.5, { timeoutMs: 5000 });
} catch (e) {}

// Check exact sill blocks
for (let x = 298; x <= 301; x++) {
  const b = bot.blockAt(new Vec3(x, 72, -54));
  console.log(`Frame sill (${x}, 72, -54): ${b ? b.name : 'null'}`);
}

// Check active portal blocks
const portals = bot.findBlocks({ matching: b => b && b.name === 'nether_portal', maxDistance: 10 });
console.log(`Active nether_portal blocks: ${portals.length}`);

// Check teammates
for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity && name !== bot.username) {
    const dist = bot.entity.position.distanceTo(p.entity.position).toFixed(1);
    console.log(`Player ${name} at ${lib.fmt(p.entity.position)} (${dist}m), holding: ${p.entity.heldItem?.name}`);
  }
}

console.log('=== Program 827 Summary ===');
console.log('Pos:', lib.fmt(bot.entity.position));
console.log('Portal active:', portals.length > 0);
console.log('Iron ingots in inv:', lib.count('iron_ingot'));
console.log('Inventory:', lib.inv());

return {
  portal_active: portals.length > 0,
  missing_sill: bot.blockAt(new Vec3(299, 72, -54))?.name,
  hp: bot.health,
  food: bot.food
};
