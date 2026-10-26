// programs/435-sprint-base-and-reenter-nether.js
console.log('=== Program 435: Sprint to Base, Gear Up & Transit to Nether ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

// 1. Sprint 66m East to base door (294, 72, -54)
console.log('Sprinting to base door (294, 72, -54)...');
try {
  await lib.goTo(294, 72, -53, 1, { timeoutMs: 20000 });
} catch (e) {
  try { await lib.goToXZ(294, -54); } catch (e2) {}
}

console.log('Entering base shelter...');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  try { await lib.goTo(294, 72, -55, 1); } catch (e2) {}
}

console.log('Inside base at:', lib.fmt(bot.entity.position));

// 2. Set spawn at Bed 1 (294, 72, -55)
try {
  await lib.setSpawn();
  console.log('Spawn confirmed at Bed 1.');
} catch (e) {}

// 3. Inspect base chest (293, 72, -57)
try {
  const contents = await lib.chestContents(293, 72, -57);
  console.log('Base chest contents:', JSON.stringify(contents));
  const toWithdraw = {};
  for (const item of ['cobblestone', 'oak_planks', 'birch_planks', 'stick', 'stone_pickaxe', 'stone_sword', 'wooden_pickaxe', 'iron_ingot', 'shield', 'bread']) {
    if (contents[item] > 0) toWithdraw[item] = contents[item];
  }
  if (Object.keys(toWithdraw).length > 0) {
    await lib.withdraw(toWithdraw, 293, 72, -57);
  }
} catch (e) {}

console.log('Inventory after chest check:', JSON.stringify(lib.inv()));

// 4. Quick gear check: ensure Alpha carries pickaxe, weapon, and 16+ cobblestone
if (lib.count('*_pickaxe') === 0) {
  try { await lib.obtain('wooden_pickaxe', 1); } catch (e) {}
}

if (lib.count('cobblestone') < 16) {
  try {
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

try {
  if (lib.count('stone_pickaxe') === 0 && lib.count('cobblestone') >= 3) {
    await lib.craft('stone_pickaxe', 1);
  }
  if (lib.count('stone_sword') === 0 && lib.count('cobblestone') >= 2) {
    await lib.craft('stone_sword', 1);
  }
} catch (e) {}

await lib.equipWeapon();
console.log('Gear ready:', JSON.stringify(lib.inv()));

// 5. Step up portal steps into Nether portal (299.5, 73.0, -54.0)
console.log('Walking up steps into Nether portal (299.5, 73.0, -54.0)...');
try {
  await globalThis.passDoorOut();
} catch (e) {
  try { await lib.goThroughDoor(294, 72, -54); } catch (e2) {}
}

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

console.log('Dimension:', bot.game.dimension);
console.log('Alpha at:', lib.fmt(bot.entity.position));

if (bot.game.dimension === 'the_nether') {
  bot.chat(`team: Alpha in the Nether at ${lib.fmt(bot.entity.position)}! HP=${bot.health}, Food=${bot.food}, Cobble=${lib.count('cobblestone')}. Advancing along East Ridge trail to join Delta & Gamma at (44, 65, -135)!`);
}

console.log('Final inventory:', JSON.stringify(lib.inv()));
console.log('Final status:', JSON.stringify(lib.status()));
