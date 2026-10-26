// programs/265-set-spawn-and-craft-tools.js
console.log('=== SET BASE SPAWN & CRAFT FULL STONE KIT ===');
console.log('Start pos:', lib.fmt(bot.entity.position));

// 1. Enter base house and lock spawn
console.log('Entering base house...');
try {
  await lib.goTo(294, 72, -53, 1, { timeoutMs: 12000 });
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  try {
    await lib.walkTo(294.5, -55.5, 3000);
  } catch (e2) {}
}

console.log('Inside base! Setting spawn on Bed 1...');
try {
  await lib.setSpawn();
  console.log('SPAWN LOCKED ON BASE BED!');
} catch (e) {
  console.log('Spawn set note:', e.message);
}

// 2. Check chest for any supplies
try {
  const chest = await bot.openContainer(bot.blockAt(new Vec3(293, 72, -57)));
  console.log('Base chest items:');
  for (const it of chest.items()) {
    console.log(` - ${it.name} x${it.count}`);
    if (['cobblestone', 'stick', 'birch_log', 'oak_log', 'birch_planks', 'oak_planks', 'stone_sword', 'stone_pickaxe', 'wooden_pickaxe'].includes(it.name)) {
      console.log(`Withdrawing ${it.name} x${it.count}...`);
      await chest.withdraw(it.type, null, it.count);
    }
  }
  await chest.close();
} catch (e) {
  console.log('Chest note:', e.message);
}

console.log('Inv after chest:', JSON.stringify(lib.inv()));

// 3. If no wood/sticks, step outside and chop 2 logs from tree at (311, 74, -43)
if (lib.count('*_planks') === 0 && lib.count('stick') === 0 && lib.count('*_log') === 0) {
  console.log('Stepping out door to chop 2 logs...');
  try { await lib.goThroughDoor(294, 72, -54); } catch (e) {}
  
  const logs = lib.find('*_log', { maxDistance: 24, count: 5 });
  for (const l of logs) {
    if (l.position.y <= 75 && lib.count('*_log') < 2) {
      console.log(`Chopping log at ${lib.fmt(l.position)}...`);
      try {
        await lib.dig(l.position.x, l.position.y, l.position.z);
      } catch (e) {}
    }
  }
  await lib.pickup(6);
  console.log('Logs in inv:', lib.count('*_log'));

  // Return inside base
  try {
    await lib.goTo(294, 72, -53, 1, { timeoutMs: 8000 });
    await lib.goThroughDoor(294, 72, -54);
  } catch (e) {}
}

// Craft planks & sticks & wooden pickaxe if needed
const logKey = Object.keys(lib.inv()).find(k => k.endsWith('_log'));
if (logKey) {
  const plankName = logKey.replace('_log', '_planks');
  await lib.craft(plankName, 8);
}
if (lib.count('*_planks') > 0 && lib.count('stick') < 4) {
  await lib.craft('stick', 4);
}
if (lib.count('wooden_pickaxe') === 0 && lib.count('stone_pickaxe') === 0 && lib.count('stick') >= 2) {
  await lib.craft('wooden_pickaxe', 1);
  console.log('Wooden pickaxe crafted!');
}

// 4. Mine stone to reach 24+ cobblestone
if (lib.count('cobblestone') < 24) {
  console.log('Stepping outside door to mine stone...');
  try { await lib.goThroughDoor(294, 72, -54); } catch (e) {}

  console.log('Collecting stone on hillside...');
  try {
    await lib.collect('stone', 24 - lib.count('cobblestone'), { maxBelow: 4 });
  } catch (e) {
    console.log('Stone collect note:', e.message);
  }

  // Return inside base
  try {
    await lib.goTo(294, 72, -53, 1, { timeoutMs: 8000 });
    await lib.goThroughDoor(294, 72, -54);
  } catch (e) {}
}

// 5. Craft stone tools: stone_pickaxe & stone_sword
if (lib.count('cobblestone') >= 5) {
  console.log('Crafting stone tools at base table...');
  if (lib.count('stick') < 4 && lib.count('*_planks') > 0) await lib.craft('stick', 4);
  try {
    if (lib.count('stone_pickaxe') === 0) await lib.craft('stone_pickaxe', 1);
    if (lib.count('stone_sword') === 0) await lib.craft('stone_sword', 1);
    await lib.equipWeapon();
    console.log('Stone tools crafted and equipped!');
  } catch (e) {
    console.log('Craft error:', e.message);
  }
}

console.log('=== RESUPPLY COMPLETE ===');
console.log('Pos:', lib.fmt(bot.entity.position));
console.log('HP:', bot.health, 'Food:', bot.food);
console.log('Cobblestone:', lib.count('cobblestone'));
console.log('Tools:', JSON.stringify(lib.tools()));
console.log('Inv:', JSON.stringify(lib.inv()));

bot.chat(`gamma geared inside base: ${JSON.stringify(lib.tools())}, cobble x${lib.count('cobblestone')}. Spawn locked on bed.`);
