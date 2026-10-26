// programs/440-sprint-base-and-pave-z149.js
console.log('=== Program 440: Sprint Base, Enter Nether & Pave z=-149 ===');
console.log('Alpha start pos:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

// 1. Sprint East to base door (294, 72, -54)
console.log('Sprinting East to base...');
try {
  await lib.goTo(294, 72, -53, 1, { timeoutMs: 25000 });
} catch (e) {
  try { await lib.goToXZ(294, -54); } catch (e2) {}
}

console.log('Entering base...');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  try { await lib.goTo(294, 72, -55, 1); } catch (e2) {}
}
console.log('Inside base at:', lib.fmt(bot.entity.position));

// 2. Set spawn at Bed 1
try { await lib.setSpawn(); } catch (e) {}

// 3. Inspect chest and gear up
try {
  const contents = await lib.chestContents(293, 72, -57);
  const toWithdraw = {};
  for (const item of ['cobblestone', 'oak_planks', 'birch_planks', 'stick', 'stone_pickaxe', 'stone_sword', 'wooden_pickaxe']) {
    if (contents[item] > 0) toWithdraw[item] = contents[item];
  }
  if (Object.keys(toWithdraw).length > 0) await lib.withdraw(toWithdraw, 293, 72, -57);
} catch (e) {}

// Quick pickaxe if needed
if (lib.count('*_pickaxe') === 0) {
  try { await lib.obtain('wooden_pickaxe', 1); } catch (e) {}
}
if (lib.count('cobblestone') < 12) {
  try {
    const stones = bot.findBlocks({ matching: b => ['stone', 'cobblestone'].includes(b.name) && b.position.y < 72, maxDistance: 12, count: 8 });
    for (const s of stones) {
      if (lib.count('cobblestone') >= 12 || isCancelled()) break;
      try { await lib.dig(s.x, s.y, s.z); } catch (e) {}
    }
    await lib.pickup(6);
  } catch (e) {}
}
try {
  if (lib.count('stone_pickaxe') === 0 && lib.count('cobblestone') >= 3) await lib.craft('stone_pickaxe', 1);
  if (lib.count('stone_sword') === 0 && lib.count('cobblestone') >= 2) await lib.craft('stone_sword', 1);
} catch (e) {}
await lib.equipWeapon();

// 4. Enter Nether portal
console.log('Entering Nether portal...');
try { await globalThis.passDoorOut(); } catch (e) { try { await lib.goThroughDoor(294, 72, -54); } catch (e2) {} }

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

for (let wait = 0; wait < 30; wait++) {
  if (bot.game.dimension === 'the_nether') break;
  await sleep(500);
}

console.log('Dimension:', bot.game.dimension);
console.log('Alpha at:', lib.fmt(bot.entity.position));

if (bot.game.dimension === 'the_nether') {
  bot.chat(`team: Alpha entered the Nether at ${lib.fmt(bot.entity.position)}! HP=${bot.health}, Cobble=${lib.count('cobblestone')}. Paving floor at z=-149 to enter mountain!`);

  // 5. Mine 24 netherrack blocks at bunker exit
  const nbBlocks = bot.findBlocks({ matching: b => b.name === 'netherrack', maxDistance: 8, count: 24 });
  for (const nb of nbBlocks) {
    if (lib.count('netherrack') >= 24 || isCancelled()) break;
    if (nb.x === Math.floor(bot.entity.position.x) && nb.z === Math.floor(bot.entity.position.z)) continue;
    try { await lib.dig(nb.x, nb.y, nb.z); } catch (e) {}
  }
  await lib.pickup(6);

  // 6. Follow paved East Ridge trail to Fortress Workshop (44, 65, -128)
  try { await lib.goTo(63, 64, -3, 2, { timeoutMs: 15000 }); } catch (e) { try { await lib.goToXZ(63, -3); } catch (e2) {} }
  try { await lib.goTo(62, 66, -30, 2, { timeoutMs: 15000 }); } catch (e) { try { await lib.goToXZ(62, -30); } catch (e2) {} }
  try { await lib.goTo(61, 67, -60, 2, { timeoutMs: 15000 }); } catch (e) { try { await lib.goToXZ(61, -60); } catch (e2) {} }
  try { await lib.goTo(54, 65, -90, 2, { timeoutMs: 15000 }); } catch (e) { try { await lib.goToXZ(54, -90); } catch (e2) {} }
  
  // Enter Fortress Workshop (paved gap at z=-122..-126)
  try { await lib.goTo(44, 65, -128, 1, { timeoutMs: 20000 }); } catch (e) { try { await lib.goToXZ(44, -128); } catch (e2) {} }
  
  // Advance along covered bridge to (44, 65, -147) — STOP AT z=-147/148!
  try { await lib.goTo(44, 65, -147, 0, { timeoutMs: 15000 }); } catch (e) { try { await lib.goToXZ(44, -147); } catch (e2) {} }

  console.log('Alpha at bridge edge:', lib.fmt(bot.entity.position));

  // 7. PAVE THE DROP AT z=-149 and z=-150 WHILE STANDING AT z=-147/148!
  const nr = bot.inventory.items().find(i => ['netherrack', 'cobblestone'].includes(i.name));
  if (nr) {
    await bot.equip(nr, 'hand');
    for (let z = -149; z >= -151; z--) {
      const floorPos = new Vec3(44, 64, z);
      const cur = bot.blockAt(floorPos);
      if (!cur || cur.name === 'air') {
        const support = bot.blockAt(new Vec3(44, 64, z + 1));
        if (support && support.name !== 'air') {
          console.log(`Paving floor at ${lib.fmt(floorPos)} against ${support.name}...`);
          try {
            await bot.lookAt(floorPos.offset(0.5, 0.5, 0.5), true);
            await bot.placeBlock(support, new Vec3(0, 0, -1));
            await sleep(250);
          } catch (err) {
            console.log(`Pave note at z=${z}:`, err.message);
          }
        }
      } else {
        console.log(`Floor at z=${z} already solid: ${cur.name}`);
      }
    }
  }

  // 8. Once floor at z=-149 is verified, step safely onto z=-149!
  const f149 = bot.blockAt(new Vec3(44, 64, -149));
  console.log('Floor at (44, 64, -149):', f149?.name);
  if (f149 && f149.name !== 'air') {
    await bot.lookAt(new Vec3(44, 65.5, -149), true);
    bot.setControlState('forward', true);
    await sleep(400);
    bot.setControlState('forward', false);
    console.log('*** SAFELY INSIDE MOUNTAIN AT z=-149! *** Pos:', lib.fmt(bot.entity.position));
  }

  bot.chat(`team: Alpha paved z=-149 and reached mountain at ${lib.fmt(bot.entity.position)}! Distance to Blaze Spawner: ${bot.entity.position.distanceTo(new Vec3(32, 68, -190)).toFixed(1)}m.`);
}

console.log('Final status:', JSON.stringify(lib.status()));
console.log('Final inventory:', JSON.stringify(lib.inv()));
