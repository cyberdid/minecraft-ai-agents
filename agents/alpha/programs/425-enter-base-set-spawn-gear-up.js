// programs/425-enter-base-set-spawn-gear-up.js
console.log('=== Program 425: Enter Base, Set Spawn, Gear Up & Enter Nether ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

// 1. Move final 30m into base door (294, 72, -54)
console.log('Approaching base...');
try {
  await lib.goTo(294, 72, -53, 1, { timeoutMs: 15000 });
} catch (e) {
  try { await lib.goToXZ(294, -54); } catch (e2) {}
}

console.log('Entering base shelter through door...');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  try { await lib.goTo(294, 72, -55, 1); } catch (e2) {}
}

console.log('Safely inside base at:', lib.fmt(bot.entity.position));

// 2. Set spawn at Bed 1 (294, 72, -55)
try {
  console.log('Setting spawn at Bed 1...');
  const res = await lib.setSpawn();
  console.log('setSpawn result:', res);
} catch (e) {
  console.log('setSpawn note:', e.message);
}

// 3. Inspect base chest (293, 72, -57)
let chest = {};
try {
  chest = await lib.chestContents(293, 72, -57);
  console.log('Base chest contents:', JSON.stringify(chest));
  const toWithdraw = {};
  for (const item of ['cobblestone', 'oak_planks', 'birch_planks', 'stick', 'stone_pickaxe', 'stone_sword', 'wooden_pickaxe', 'bread', 'cooked_beef', 'cooked_chicken', 'shield']) {
    if (chest[item] > 0) toWithdraw[item] = chest[item];
  }
  if (Object.keys(toWithdraw).length > 0) {
    await lib.withdraw(toWithdraw, 293, 72, -57);
  }
} catch (e) {
  console.log('Chest error:', e.message);
}

console.log('Inventory after chest check:', JSON.stringify(lib.inv()));

// 4. Quick tool & cobblestone check
if (lib.count('stone_pickaxe') === 0 && lib.count('wooden_pickaxe') === 0) {
  // If no pickaxe, collect 2 logs and craft wooden pickaxe
  try {
    console.log('Getting wooden pickaxe...');
    await lib.obtain('wooden_pickaxe', 1);
  } catch (e) {}
}

if (lib.count('cobblestone') < 16) {
  try {
    console.log('Gathering cobblestone...');
    // Mine stone near base
    const stones = bot.findBlocks({
      matching: b => ['stone', 'cobblestone'].includes(b.name) && b.position.y < 72,
      maxDistance: 12,
      count: 10
    });
    for (const s of stones) {
      if (lib.count('cobblestone') >= 16 || isCancelled()) break;
      try { await lib.dig(s.x, s.y, s.z); } catch (e) {}
    }
    await lib.pickup(6);
  } catch (e) {}
}

// Craft stone pickaxe and sword if needed
try {
  if (lib.count('stone_pickaxe') === 0 && lib.count('cobblestone') >= 3) {
    if (lib.count('stick') < 2) await lib.craft('stick', 4);
    await lib.craft('stone_pickaxe', 1);
  }
  if (lib.count('stone_sword') === 0 && lib.count('cobblestone') >= 2) {
    await lib.craft('stone_sword', 1);
  }
} catch (e) {}

console.log('Alpha gear before portal:', JSON.stringify(lib.inv()));
await lib.equipWeapon();

// 5. Exit base and walk up portal steps into nether_portal at (299.5, 73.0, -54.0)
console.log('Moving into Nether portal at (299.5, 73.0, -54.0)...');
try {
  await globalThis.passDoorOut();
} catch (e) {
  try { await lib.goThroughDoor(294, 72, -54); } catch (e2) {}
}

// Walk up step at (299, 72, -53) directly into portal (299.5, 73.0, -54.0)
try {
  await bot.pathfinder.goto(new goals.GoalBlock(299, 73, -54));
} catch (e) {
  await bot.lookAt(new Vec3(299.5, 73.5, -54.0), true);
  bot.setControlState('forward', true);
  bot.setControlState('jump', true);
  await sleep(800);
  bot.setControlState('jump', false);
  await sleep(400);
  bot.setControlState('forward', false);
}

bot.pathfinder.setGoal(null);
bot.clearControlStates();

console.log('Standing inside portal block. Waiting for dimension transit...');
for (let wait = 0; wait < 30; wait++) {
  if (bot.game.dimension === 'the_nether') {
    console.log('*** TRANSIT SUCCESSFUL! ALPHA IS IN THE NETHER! ***');
    break;
  }
  await sleep(500);
}

console.log('Final dimension:', bot.game.dimension);
console.log('Final position:', lib.fmt(bot.entity.position));

if (bot.game.dimension === 'the_nether') {
  bot.chat(`team: Alpha entered the Nether! Pos=${lib.fmt(bot.entity.position)}, HP=${bot.health}, Food=${bot.food}, Cobble=${lib.count('cobblestone')}. Moving along East Ridge to Fortress (44, 65, -133)!`);
}

console.log('Final status:', JSON.stringify(lib.status()));
console.log('Final inventory:', JSON.stringify(lib.inv()));
