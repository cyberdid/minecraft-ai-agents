// programs/383-sprint-base-and-complete-kit.js
console.log('=== SPRINT TO BASE & ASSEMBLE COMBAT KIT ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'Time:', lib.time().timeOfDay, 'Night in:', lib.time().secondsUntilNight);

bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();
await sleep(100);

// 1. Waypoint sprint from spawn to base
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

// 2. Step inside base
console.log('Outside base! Entering door...');
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
  console.log('Spawn successfully set at base bed!');
  bot.chat('gamma: spawn point locked at base bed!');
} catch (e) {
  const bedBlock = bot.blockAt(new Vec3(294, 72, -55)) || bot.blockAt(new Vec3(293, 72, -55));
  if (bedBlock) {
    try { await bot.activateBlock(bedBlock); } catch (e2) {}
  }
}

// 4. Check chest for shield, tools, food
try {
  const contents = await lib.chestContents(293, 72, -57);
  console.log('Chest contents:', JSON.stringify(contents));
  for (const it of ['shield', 'iron_ingot', 'stone_sword', 'cobblestone', 'cooked_porkchop', 'bread']) {
    if (contents && contents[it] > 0) {
      await lib.withdraw({ [it]: 'all' }, 293, 72, -57);
    }
  }
} catch (e) {}

// 5. If no shield, obtain it via lib.obtain
if (lib.count('shield') === 0 && bot.inventory.slots[45]?.name !== 'shield') {
  console.log('Obtaining shield via lib.obtain...');
  try {
    await lib.goThroughDoor(294, 72, -54);
    await lib.obtain('shield', 1);
    console.log('Shield obtained successfully!');
  } catch (e) {
    console.log('Shield note:', e.message);
  }
}

// 6. Ensure stone_sword & cobblestone
if (lib.count('stone_sword') === 0) {
  try { await lib.obtain('stone_sword', 1); } catch (e) {}
}
if (lib.count('cobblestone') < 24) {
  try { await lib.collect('stone', 24 - lib.count('cobblestone')); } catch (e) {}
}

// 7. Equip shield and sword
try {
  await lib.equipArmor();
  await lib.equipWeapon();
  console.log('Gear equipped! Offhand:', bot.inventory.slots[45]?.name, 'Held:', bot.heldItem?.name);
} catch (e) {}

console.log('Final inventory:', JSON.stringify(lib.inv()));
console.log('Final status:', JSON.stringify(lib.status()));
