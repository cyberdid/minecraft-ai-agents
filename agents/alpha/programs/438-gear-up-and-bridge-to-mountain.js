// programs/438-gear-up-and-bridge-to-mountain.js
console.log('=== Program 438: Base Quick Gear-Up & Advance to Fortress Bridge ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

// 1. Exit base door
console.log('Exiting base door...');
try {
  await globalThis.passDoorOut();
} catch (e) {
  try { await lib.goThroughDoor(294, 72, -54); } catch (e2) {}
}

// 2. Collect 2 logs
console.log('Gathering 2 logs...');
try {
  await lib.collect('*_log', 2);
} catch (e) {}

// 3. Craft planks, sticks, wooden pickaxe
try {
  const log = Object.keys(lib.inv()).find(k => k.endsWith('_log'));
  if (log) await lib.craft(log.replace('_log', '_planks'), 4);
  if (lib.count('stick') < 4) await lib.craft('stick', 4);
  if (lib.count('wooden_pickaxe') === 0 && lib.count('*_planks') >= 3) await lib.craft('wooden_pickaxe', 1);
} catch (e) {}

// 4. Mine 12 cobblestone near base
console.log('Mining 12 cobblestone...');
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
console.log('Overworld gear ready:', JSON.stringify(lib.inv()));

// 6. Walk up steps at (299, 72, -53) into portal at (299.5, 73.0, -54.0)
console.log('Entering Nether portal...');
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

// Wait for dimension transit
for (let wait = 0; wait < 30; wait++) {
  if (bot.game.dimension === 'the_nether') break;
  await sleep(500);
}

console.log('Dimension:', bot.game.dimension);
console.log('Alpha at:', lib.fmt(bot.entity.position));

if (bot.game.dimension === 'the_nether') {
  bot.chat(`team: Alpha entered the Nether at ${lib.fmt(bot.entity.position)}! HP=${bot.health}, Cobble=${lib.count('cobblestone')}. Mining netherrack and advancing to join Gamma at (44, 65, -142)!`);

  // 7. Mine 24 netherrack blocks at bunker exit
  const nbBlocks = bot.findBlocks({ matching: b => b.name === 'netherrack', maxDistance: 8, count: 24 });
  for (const nb of nbBlocks) {
    if (lib.count('netherrack') >= 24 || isCancelled()) break;
    if (nb.x === Math.floor(bot.entity.position.x) && nb.z === Math.floor(bot.entity.position.z)) continue;
    try { await lib.dig(nb.x, nb.y, nb.z); } catch (e) {}
  }
  await lib.pickup(6);

  // 8. Follow paved East Ridge trail to Fortress Workshop (44, 65, -128)
  try { await lib.goTo(63, 64, -3, 2, { timeoutMs: 15000 }); } catch (e) { try { await lib.goToXZ(63, -3); } catch (e2) {} }
  try { await lib.goTo(62, 66, -30, 2, { timeoutMs: 15000 }); } catch (e) { try { await lib.goToXZ(62, -30); } catch (e2) {} }
  try { await lib.goTo(61, 67, -60, 2, { timeoutMs: 15000 }); } catch (e) { try { await lib.goToXZ(61, -60); } catch (e2) {} }
  try { await lib.goTo(54, 65, -90, 2, { timeoutMs: 15000 }); } catch (e) { try { await lib.goToXZ(54, -90); } catch (e2) {} }
  
  // Enter Fortress Workshop (paved gap at z=-122..-126)
  try { await lib.goTo(44, 65, -128, 1, { timeoutMs: 20000 }); } catch (e) { try { await lib.goToXZ(44, -128); } catch (e2) {} }
  
  // Advance to safe bridgehead at (44, 65, -141) — DO NOT STEP PAST -142!
  try { await lib.goTo(44, 65, -141, 0, { timeoutMs: 15000 }); } catch (e) { try { await lib.goToXZ(44, -141); } catch (e2) {} }

  console.log('Alpha final position:', lib.fmt(bot.entity.position));
  bot.chat(`team: Alpha arrived at Fortress bridgehead ${lib.fmt(bot.entity.position)}! Netherrack=${lib.count('netherrack')}, Cobble=${lib.count('cobblestone')}. Paving floor to mountain z=-148!`);
}

console.log('Final status:', JSON.stringify(lib.status()));
console.log('Final inventory:', JSON.stringify(lib.inv()));
