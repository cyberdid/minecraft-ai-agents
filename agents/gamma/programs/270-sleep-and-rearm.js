// programs/270-sleep-and-rearm.js
console.log('=== NIGHT PROTOCOL, SLEEP & RE-ARM STONE SWORD ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'Time:', JSON.stringify(lib.time()));

// 1. Enter base house
console.log('Entering base house at (294, 72, -54)...');
try {
  await lib.goTo(294, 72, -53, 1, { timeoutMs: 10000 });
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  try { await lib.walkTo(294.5, -55.5, 3000); } catch (e2) {}
}

// Close door
try { await lib.door(294, 72, -54, false); } catch (e) {}
console.log('Inside base! Pos:', lib.fmt(bot.entity.position));

// 2. Set spawn on Bed 1
try { await lib.setSpawn(); } catch (e) {}

// 3. Wait for canSleep (tick 12542)
console.log('Waiting for canSleep...');
while (!isCancelled() && !lib.time().canSleep) {
  await sleep(1000);
}

if (lib.time().canSleep) {
  console.log('Sleeping in bed...');
  bot.chat('gamma sleeping in base bed to skip night!');
  try {
    await lib.sleepInBed();
    while (!isCancelled() && bot.isSleeping) {
      await sleep(1000);
    }
    console.log('Morning arrived! Time:', JSON.stringify(lib.time()));
  } catch (e) {
    console.log('Sleep note:', e.message);
  }
}

// 4. Check chest for cobblestone, sticks, tools
try {
  const chest = await bot.openContainer(bot.blockAt(new Vec3(293, 72, -57)));
  console.log('Chest items:');
  for (const it of chest.items()) {
    console.log(` - ${it.name} x${it.count}`);
    if (['cobblestone', 'stick', 'stone_sword', 'stone_pickaxe', 'shield', 'birch_planks', 'oak_planks', 'birch_log', 'oak_log'].includes(it.name)) {
      console.log(`Withdrawing ${it.name} x${it.count}...`);
      await chest.withdraw(it.type, null, it.count);
    }
  }
  await chest.close();
} catch (e) {
  console.log('Chest note:', e.message);
}

console.log('Inv after chest:', JSON.stringify(lib.inv()));

// 5. If we need wood/cobble, step out and gather
if (lib.count('stone_sword') === 0) {
  if (lib.count('cobblestone') < 2 || lib.count('stick') < 1) {
    console.log('Gathering materials outside door...');
    try { await lib.goThroughDoor(294, 72, -54); } catch (e) {}

    // Chop 1 log if needed
    if (lib.count('*_planks') === 0 && lib.count('stick') === 0) {
      const logs = lib.find('*_log', { maxDistance: 16, count: 3 });
      for (const l of logs) {
        if (l.position.y <= 75) {
          try { await lib.dig(l.position.x, l.position.y, l.position.z); } catch (e) {}
          break;
        }
      }
      await lib.pickup(4);
    }

    // Pickup cobblestone on hillside ledge
    const items = Object.values(bot.entities).filter(e => e.name === 'item' && e.position.distanceTo(bot.entity.position) < 12);
    if (items.length > 0) await lib.pickup(8);

    // Return inside base
    try {
      await lib.goTo(294, 72, -53, 1, { timeoutMs: 8000 });
      await lib.goThroughDoor(294, 72, -54);
    } catch (e) {}
  }

  // Craft sticks and stone_sword
  const logKey = Object.keys(lib.inv()).find(k => k.endsWith('_log'));
  if (logKey) {
    const pName = logKey.replace('_log', '_planks');
    await lib.craft(pName, 4);
  }
  if (lib.count('*_planks') > 0 && lib.count('stick') < 1) await lib.craft('stick', 4);
  if (lib.count('cobblestone') >= 2 && lib.count('stick') >= 1) {
    try {
      await lib.craft('stone_sword', 1);
      console.log('Stone sword crafted!');
    } catch (e) {}
  }
}

// Equip weapon and shield if available
try { await lib.equipWeapon(); } catch (e) {}
try { await lib.equipArmor(); } catch (e) {}

console.log('=== READY STATUS ===');
console.log('Pos:', lib.fmt(bot.entity.position));
console.log('HP:', bot.health, 'Food:', bot.food);
console.log('Mainhand:', bot.entity.equipment[0]?.name);
console.log('Offhand:', bot.entity.equipment[1]?.name);
console.log('Inv:', JSON.stringify(lib.inv()));
console.log('Tools:', JSON.stringify(lib.tools()));

bot.chat(`gamma ready: ${bot.entity.equipment[0]?.name || 'unarmed'} in hand, HP ${bot.health}/20, cobble x${lib.count('cobblestone')}. Ready for Nether!`);
