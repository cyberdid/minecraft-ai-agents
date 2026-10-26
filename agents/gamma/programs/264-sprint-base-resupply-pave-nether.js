// programs/264-sprint-base-resupply-pave-nether.js
console.log('=== SPRINT TO BASE, SET SPAWN & RESUPPLY 32+ COBBLE ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension);

// 1. Sprint East from world spawn (222, 62, -45) to base (294, 72, -54)
console.log('Sprinting East to base at (294, 72, -54)...');
try {
  await lib.goTo(294, 72, -53, 2, { timeoutMs: 25000 });
} catch (e) {
  console.log('goTo base note:', e.message);
  try { await lib.goToXZ(294, -54, { timeoutMs: 15000 }); } catch (e2) {}
}

console.log('At base area! Pos:', lib.fmt(bot.entity.position));

// 2. Set spawn on Bed 1 inside base
console.log('Entering base house to set spawn...');
try {
  await lib.goThroughDoor(294, 72, -54);
  await lib.setSpawn();
  console.log('Spawn successfully set on Bed 1!');
} catch (e) {
  console.log('Spawn set note:', e.message);
}

// 3. Pickup dropped cobblestone on hillside ledge at (298, 68, -55)
console.log('Stepping outside door to gather cobblestone from hillside ledge...');
try { await lib.goThroughDoor(294, 72, -54); } catch (e) {}

try {
  await lib.goTo(298, 68, -55, 2, { timeoutMs: 10000 });
} catch (e) {
  try { await lib.goToXZ(298, -55, { timeoutMs: 6000 }); } catch (e2) {}
}

const picked = await lib.pickup(12);
console.log(`Picked up ${picked} items on hillside!`);
console.log('Cobblestone count:', lib.count('cobblestone'));

// If less than 24 cobblestone, mine directly from exposed stone
if (lib.count('cobblestone') < 24) {
  console.log('Mining stone to reach 24+ cobblestone...');
  try {
    await lib.collect('stone', 24 - lib.count('cobblestone'), { maxBelow: 4 });
  } catch (e) {
    console.log('Stone mine note:', e.message);
  }
}

// 4. Return to base crafting table to craft stone tools
console.log('Entering base to craft tools...');
try {
  await lib.goTo(294, 72, -53, 1, { timeoutMs: 8000 });
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  try { await lib.walkTo(295.5, -55.5, 3000); } catch (e2) {}
}

// Check if we need sticks
if (lib.count('stick') < 2) {
  if (lib.count('*_planks') > 0) {
    await lib.craft('stick', 4);
  } else {
    // Check chest for sticks/wood
    try {
      const chest = await bot.openContainer(bot.blockAt(new Vec3(293, 72, -57)));
      for (const it of chest.items()) {
        if (['stick', 'birch_planks', 'oak_planks', 'birch_log', 'oak_log', 'stone_sword', 'stone_pickaxe'].includes(it.name)) {
          await chest.withdraw(it.type, null, it.count);
        }
      }
      await chest.close();
    } catch (e) {}
  }
}

// Craft stone tools
if (lib.count('cobblestone') >= 5) {
  try {
    if (lib.count('stone_pickaxe') === 0 && lib.count('stick') >= 2) await lib.craft('stone_pickaxe', 1);
    if (lib.count('stone_sword') === 0 && lib.count('stick') >= 1) await lib.craft('stone_sword', 1);
  } catch (e) {
    console.log('Tool craft note:', e.message);
  }
}

await lib.equipWeapon();

console.log('=== GEAR SUMMARY ===');
console.log('Pos:', lib.fmt(bot.entity.position));
console.log('HP:', bot.health, 'Food:', bot.food);
console.log('Cobblestone:', lib.count('cobblestone'));
console.log('Tools:', JSON.stringify(lib.tools()));
console.log('Inv:', JSON.stringify(lib.inv()));

bot.chat(`gamma resupplied: cobble x${lib.count('cobblestone')}, tools: ${JSON.stringify(lib.tools())}! Ready to build safe Nether road.`);
