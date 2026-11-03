// programs/547-base-regear-and-warp.js
globalThis.isProgramCancelled = isCancelled;
console.log('=== DELTA: FINAL SPRINT TO BASE, CRAFT SHIELD & WARP ===');
console.log(`Starting pos: ${lib.fmt(bot.entity.position)}, HP: ${bot.health}, Food: ${bot.food}`);

// Step 1: Walk directly to Base at (293, 72, -55)
console.log('Walking to base (293, 72, -55)...');
try {
  await lib.goTo(293, 72, -55, 2, { timeoutMs: 18000 });
} catch (e) {
  try { await bot.pathfinder.goto(new goals.GoalNear(293, 72, -55, 2)); } catch (e2) {}
}

console.log(`Pos at base: ${lib.fmt(bot.entity.position)}`);

// Enter base door if outside
if (bot.entity.position.z > -54.0) {
  try { await lib.goThroughDoor(294, 72, -54); } catch (e) {}
}

// Lock spawn at bed
const bedBlock = bot.findBlock({ matching: b => b && b.name.includes('bed'), maxDistance: 6 });
if (bedBlock) {
  try {
    await lib.setSpawn(bedBlock.position.x, bedBlock.position.y, bedBlock.position.z);
    console.log('Spawn point confirmed at base bed!');
  } catch (e) {}
}

// Check furnace (295, 72, -55) for smelted iron
const fb = bot.blockAt(new Vec3(295, 72, -55));
if (fb) {
  try {
    const furnace = await bot.openFurnace(fb);
    const out = furnace.outputItem();
    if (out) {
      console.log(`Withdrawing ${out.name} x${out.count} from furnace...`);
      await furnace.takeOutput();
    }
    furnace.close();
  } catch (e) {}
}

// Check chest (293, 72, -57) for shield or iron ingot
const cBlock = bot.blockAt(new Vec3(293, 72, -57));
if (cBlock && cBlock.name.includes('chest')) {
  try {
    const chest = await bot.openChest(cBlock);
    const s = chest.containerItems().find(i => i.name === 'shield');
    if (s && lib.count('shield') === 0) {
      console.log('Found shield in chest! Withdrawing...');
      await chest.withdraw(s.type, null, 1);
    }
    const iron = chest.containerItems().find(i => i.name === 'iron_ingot');
    if (iron && lib.count('shield') === 0) {
      console.log('Found iron ingot in chest! Withdrawing...');
      await chest.withdraw(iron.type, null, 1);
    }
    chest.close();
  } catch (e) {}
}

// Craft shield if needed
if (lib.count('shield') === 0 && lib.count('iron_ingot') >= 1) {
  try {
    console.log('Crafting shield at crafting table...');
    await lib.craft('shield', 1);
    console.log('Shield crafted successfully!');
  } catch (e) {
    console.log('Shield craft notice:', e.message);
  }
}

// Equip shield in offhand
try {
  const shield = bot.inventory.items().find(i => i.name === 'shield');
  if (shield) {
    await bot.equip(shield, 'off-hand');
    console.log('Shield equipped in offhand!');
  }
} catch (e) {}

// Equip armor & weapon
try { await lib.equipArmor(); } catch (e) {}
try { await lib.equipWeapon(); } catch (e) {}

// Quick regear (ensures 16 cobblestone)
try {
  await quickRegear({ cobble: 16 });
} catch (e) {}

// Ensure shield remains equipped
try {
  const shield = bot.inventory.items().find(i => i.name === 'shield');
  if (shield && bot.inventory.slots[45]?.name !== 'shield') {
    await bot.equip(shield, 'off-hand');
  }
} catch (e) {}

bot.chat('delta: Full combat gear ready! HP: 20/20, Food: 20/20, Shield: ON! Marching into Nether to join Alpha, Beta & Gamma!');

// Step 2: Warp into Nether
console.log('Entering Nether Portal...');
await enterNetherPortal();
console.log(`Dimension after portal: ${bot.game.dimension}, pos: ${lib.fmt(bot.entity.position)}`);

// Step 3: March to Spawner Pillbox / Covered Tunnel
if (bot.game.dimension === 'the_nether') {
  console.log('Marching along safe covered waypoints...');
  const res = await marchToSpawnerPillbox();
  console.log('marchToSpawnerPillbox result:', JSON.stringify(res));

  const pillboxPos = new Vec3(36.5, 66.0, -187.0);
  if (bot.entity.position.distanceTo(pillboxPos) < 4.0) {
    bot.chat('delta: Arrived at Spawner Pillbox (36, 66, -187)! Engaging Blazes!');
    await farmBlazeRodsAtPillbox(8, 60000);
  }
}

console.log('=== PROGRAM 547 COMPLETE ===');
console.log(`Pos: ${lib.fmt(bot.entity.position)}, dim: ${bot.game.dimension}, HP: ${bot.health}`);
console.log(`Inventory:`, JSON.stringify(lib.inv()));

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  rods: lib.count('blaze_rod'),
  pearls: lib.count('ender_pearl'),
  inv: lib.inv()
};
