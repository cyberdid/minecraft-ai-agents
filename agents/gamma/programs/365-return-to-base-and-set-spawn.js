// programs/365-return-to-base-and-set-spawn.js
console.log('=== SPRINT TO BASE & SET SPAWN ===');
console.log('Spawn pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('HP:', bot.health, 'Food:', bot.food);

bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();
await sleep(100);

const waypoints = [
  new Vec3(215, 63, -100),
  new Vec3(245, 65, -80),
  new Vec3(270, 69, -60),
  new Vec3(290, 71, -54),
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
      console.log(`Fallback run to WP ${i + 1}:`, e2.message);
      await bot.lookAt(new Vec3(wp.x, wp.y + 1, wp.z), true);
      bot.setControlState('forward', true);
      bot.setControlState('sprint', true);
      bot.setControlState('jump', true);
      await sleep(2500);
      bot.clearControlStates();
    }
  }
}

console.log('Outside base door! Current pos:', lib.fmt(bot.entity.position));

// Enter base through door at (294, 72, -54)
try {
  await lib.goThroughDoor(294, 72, -54);
  console.log('Stepped through door!');
} catch (e) {
  try {
    await lib.door(294, 72, -54, true);
    await lib.walkTo(294.5, -55.5, 3000);
    await lib.door(294, 72, -54, false);
    console.log('Manually stepped into base!');
  } catch (e2) {
    console.log('Door entry error:', e2.message);
  }
}

// Pickup any drops in base
try {
  const picked = await lib.pickup(6);
  console.log('Picked up drops in base:', picked);
} catch (e) {}

// Set spawn at base bed!
try {
  await lib.setSpawn();
  console.log('Spawn successfully set at base bed!');
  bot.chat('gamma: spawn point locked at base bed!');
} catch (e) {
  console.log('setSpawn note:', e.message);
  const bedBlock = bot.blockAt(new Vec3(294, 72, -55)) || bot.blockAt(new Vec3(293, 72, -55));
  if (bedBlock) {
    try {
      await bot.activateBlock(bedBlock);
      console.log('Activated bed block for spawn set!');
    } catch (e2) {}
  }
}

// Check chest
try {
  const contents = await lib.chestContents(293, 72, -57);
  console.log('Base chest contents:', JSON.stringify(contents));
  // Withdraw food, tools, or building materials if available
  const useful = ['cooked_porkchop', 'cooked_beef', 'cooked_mutton', 'bread', 'apple', 'stone_sword', 'iron_sword', 'stone_pickaxe', 'iron_pickaxe', 'cobblestone', 'shield'];
  for (const item of useful) {
    if (contents && contents[item] > 0) {
      console.log(`Withdrawing ${item} from chest...`);
      await lib.withdraw({ [item]: 'all' }, 293, 72, -57);
    }
  }
} catch (e) {
  console.log('Chest error:', e.message);
}

// Equip best available gear
try {
  await lib.equipArmor();
  await lib.equipWeapon();
} catch (e) {}

console.log('Inventory now:', JSON.stringify(lib.inv()));
console.log('Ending status:', JSON.stringify(lib.status()));
