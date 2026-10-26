// programs/200-quick-rearm-and-nether-recovery.js
console.log('Pos before:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('Health:', bot.health, 'Food:', bot.food);

// 1. Step outside base door
const doorPos = new Vec3(294, 73, -54);
console.log('Stepping outside door...');
try {
  await lib.goThroughDoor(doorPos.x, doorPos.y, doorPos.z);
} catch (e) {
  await lib.goTo(296, 73, -54, 1);
}

// 2. Harvest 2 logs
console.log('Harvesting 2 logs for quick tools...');
try {
  await lib.collect('*_log', 2);
} catch (e) {
  console.log('Log collect error:', e.message);
}

// 3. Craft planks, sticks, wooden pickaxe
try {
  if (lib.count('birch_log') > 0) await lib.craft('birch_planks', lib.count('birch_log') * 4);
  if (lib.count('oak_log') > 0) await lib.craft('oak_planks', lib.count('oak_log') * 4);
  await lib.craft('stick', 4);
  await lib.craft('wooden_pickaxe', 1);
} catch (e) {
  console.log('Wood craft error:', e.message);
}

// 4. Mine 8 stone
console.log('Mining 8 stone...');
try {
  await lib.collect('stone', 8);
} catch (e) {
  console.log('Stone collect error:', e.message);
}

// 5. Craft stone sword & stone pickaxe
try {
  if (lib.count('cobblestone') >= 2) await lib.craft('stone_sword', 1);
  if (lib.count('cobblestone') >= 3) await lib.craft('stone_pickaxe', 1);
} catch (e) {
  console.log('Stone craft error:', e.message);
}

console.log('Inventory before portal:', JSON.stringify(lib.inv()));

// 6. Enter Nether portal at (298, 73, -54)
console.log('Heading to Nether portal...');
try {
  await lib.goTo(298, 73, -54, 1);
} catch (e) {}

const portals = bot.findBlocks({
  matching: b => b.name === 'nether_portal',
  maxDistance: 12,
  count: 3
});

if (portals.length > 0) {
  const p = portals[0];
  try {
    await bot.pathfinder.goto(new goals.GoalBlock(p.x, p.y, p.z));
  } catch (e) {
    await lib.goTo(p.x, p.y, p.z, 0);
  }
}

// Wait for dimension change
const startDim = bot.game.dimension;
console.log('Transiting to Nether...');
bot.chat('delta: Transiting Nether portal to recover items and secure mountain breach at (44, 65, -149)...');
for (let i = 0; i < 15; i++) {
  await sleep(1000);
  if (bot.game.dimension !== startDim) {
    console.log(`TELEPORT SUCCESS! Dimension: ${bot.game.dimension}`);
    break;
  }
}

// 7. Advance along East Ridge to Fortress
if (bot.game.dimension.includes('nether')) {
  bot.chat(`delta: Arrived in Nether at ${lib.fmt(bot.entity.position)}! Marching along East Ridge to recover 34 cobble at z=-146.`);
  await lib.equipWeapon();

  const waypoints = [
    new Vec3(63, 64, -5),
    new Vec3(63, 66, -20),
    new Vec3(63, 66, -35),
    new Vec3(62, 67, -50),
    new Vec3(61, 67, -65),
    new Vec3(54, 65, -90),
    new Vec3(44, 66, -127),
    new Vec3(44, 65, -135),
    new Vec3(44, 65, -146)
  ];

  for (const wp of waypoints) {
    if (isCancelled()) break;
    try {
      await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2));
    } catch (e) {}
  }

  // 8. Pick up dropped items at z=-146
  console.log('Arrived at z=-146! Picking up items...');
  try {
    const gained = await lib.pickup(8);
    console.log('Items recovered:', gained);
  } catch (e) {
    console.log('Pickup error:', e.message);
  }

  // 9. Fix floor gap at (44, 64, -149)
  if (lib.count('cobblestone') > 0 || lib.count('*_planks') > 0) {
    const mat = lib.count('cobblestone') > 0 ? 'cobblestone' : 'birch_planks';
    try {
      await lib.place(mat, 44, 64, -149);
      console.log(`Placed floor at (44, 64, -149) with ${mat}!`);
    } catch (e) {
      console.log('Floor gap place notice:', e.message);
    }
  }

  bot.chat(`delta: Reached (44, 65, -146)! Inventory: Cobble=${lib.count('cobblestone')}, Planks=${lib.count('*_planks')}. Securing mountain breach!`);
}

console.log('Final pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('Final inventory:', JSON.stringify(lib.inv()));
