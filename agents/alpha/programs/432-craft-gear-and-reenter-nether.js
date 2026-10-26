// programs/432-craft-gear-and-reenter-nether.js
console.log('=== Program 432: Craft Gear & Re-Enter Nether ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

// 1. Exit base door
console.log('Exiting base door (294, 72, -54)...');
try {
  await globalThis.passDoorOut();
} catch (e) {
  try { await lib.goThroughDoor(294, 72, -54); } catch (e2) {}
}

// 2. Collect 2 logs
console.log('Chop 2 logs...');
try {
  await lib.collect('*_log', 2);
} catch (e) {
  console.log('Log collect note:', e.message);
}

// 3. Craft planks, sticks, wooden pickaxe
try {
  const log = Object.keys(lib.inv()).find(k => k.endsWith('_log'));
  if (log) await lib.craft(log.replace('_log', '_planks'), 4);
  if (lib.count('stick') < 4) await lib.craft('stick', 4);
  if (lib.count('wooden_pickaxe') === 0 && lib.count('*_planks') >= 3) await lib.craft('wooden_pickaxe', 1);
} catch (e) {}

// 4. Mine 12 cobblestone near base
console.log('Mining 12 cobblestone near base...');
try {
  const stones = bot.findBlocks({
    matching: b => ['stone', 'cobblestone'].includes(b.name) && b.position.y < 72,
    maxDistance: 12,
    count: 10
  });
  for (const s of stones) {
    if (lib.count('cobblestone') >= 12 || isCancelled()) break;
    try { await lib.dig(s.x, s.y, s.z); } catch (e) {}
  }
  await lib.pickup(6);
} catch (e) {}

// 5. Craft stone pickaxe and stone sword
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

// 6. Walk up steps at (299, 72, -53) into portal at (299.5, 73.0, -54.0)
console.log('Walking up steps into Nether portal (299.5, 73.0, -54.0)...');
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
  bot.chat(`team: Alpha re-entered the Nether at ${lib.fmt(bot.entity.position)}! HP=${bot.health}, Food=${bot.food}, Cobble=${lib.count('cobblestone')}. Moving to join Delta at (44, 65, -133)!`);
}

console.log('Final inventory:', JSON.stringify(lib.inv()));
console.log('Final status:', JSON.stringify(lib.status()));
