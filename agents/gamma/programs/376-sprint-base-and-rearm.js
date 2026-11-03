// programs/376-sprint-base-and-rearm.js
console.log('=== SPRINT TO BASE & REARM WITH SHIELD ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('HP:', bot.health, 'Food:', bot.food);

bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();
await sleep(100);

// 1. Waypoint sprint to base
const waypoints = [
  new Vec3(185, 62, -90),
  new Vec3(215, 63, -75),
  new Vec3(250, 66, -60),
  new Vec3(280, 71, -55),
  new Vec3(294, 72, -53)
];

for (let i = 0; i < waypoints.length && !isCancelled(); i++) {
  const wp = waypoints[i];
  console.log(`[WP ${i + 1}/${waypoints.length}] Navigating to ${lib.fmt(wp)}...`);
  try {
    await lib.goTo(wp.x, wp.y, wp.z, 2, { timeoutMs: 12000 });
  } catch (e) {
    try {
      await lib.goToXZ(wp.x, wp.z, { timeoutMs: 8000 });
    } catch (e2) {
      await bot.lookAt(new Vec3(wp.x, wp.y + 1, wp.z), true);
      bot.setControlState('forward', true);
      bot.setControlState('sprint', true);
      bot.setControlState('jump', true);
      await sleep(2500);
      bot.clearControlStates();
    }
  }
}

// 2. Enter base
console.log('At base! Stepping inside...');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  try {
    await lib.door(294, 72, -54, true);
    await lib.walkTo(294.5, -55.5, 3000);
    await lib.door(294, 72, -54, false);
  } catch (e2) {}
}

// 3. Set spawn at bed
try {
  await lib.setSpawn();
  console.log('Spawn locked at base bed!');
  bot.chat('gamma: spawn locked at base bed!');
} catch (e) {
  const bedBlock = bot.blockAt(new Vec3(294, 72, -55)) || bot.blockAt(new Vec3(293, 72, -55));
  if (bedBlock) {
    try { await bot.activateBlock(bedBlock); } catch (e2) {}
  }
}

// 4. Pickup any drops in base & check chest
try { await lib.pickup(6); } catch (e) {}
try {
  const contents = await lib.chestContents(293, 72, -57);
  console.log('Chest contents:', JSON.stringify(contents));
  for (const it of ['shield', 'iron_ingot', 'raw_iron', 'stone_sword', 'cobblestone', 'cooked_porkchop', 'cooked_beef', 'bread']) {
    if (contents && contents[it] > 0) {
      await lib.withdraw({ [it]: 'all' }, 293, 72, -57);
    }
  }
} catch (e) {}

// 5. If we don't have shield, obtain it
if (lib.count('shield') === 0 && bot.inventory.slots[45]?.name !== 'shield') {
  console.log('Obtaining shield via lib.obtain...');
  try {
    await lib.goThroughDoor(294, 72, -54);
    await lib.obtain('shield', 1);
    console.log('Shield obtained!');
  } catch (e) {
    console.log('Shield obtain note:', e.message);
  }
}

// 6. Ensure stone sword and cobblestone
if (lib.count('stone_sword') === 0) {
  try { await lib.obtain('stone_sword', 1); } catch (e) {}
}
if (lib.count('cobblestone') < 24) {
  try { await lib.collect('stone', 24 - lib.count('cobblestone')); } catch (e) {}
}

// 7. Equip shield and weapon
try {
  await lib.equipArmor();
  await lib.equipWeapon();
  console.log('Equipped gear! Offhand:', bot.inventory.slots[45]?.name, 'Held:', bot.heldItem?.name);
} catch (e) {}

console.log('Status:', JSON.stringify(lib.status()));
