// programs/680-gear-and-spawner-assault.js
console.log('=== Program 680: Full Gear-Up & Nether Spawner Assault ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'Inv:', JSON.stringify(lib.inv()));

bot.clearControlStates();
bot.pathfinder.stop();
await sleep(100);

// --- Phase 1: Wood & Stone Gear-Up ---
console.log('--- Phase 1: Gathering Wood & Cobblestone ---');
// Step outside base door
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  try {
    await lib.door(294, 72, -54, true);
    await lib.goTo(295, 72, -53, 1, { dig: false });
    await lib.door(294, 72, -54, false);
  } catch (e2) {}
}

// Walk to birch tree at (308, y, -28)
console.log('Walking to birch tree at (308, y, -28)...');
try {
  await lib.goTo(307, 74, -28, 1.5, { dig: false, timeoutMs: 15000 });
} catch (e) {
  try { await bot.pathfinder.goto(new goals.GoalNear(307, 74, -28, 1.5)); } catch (e2) {}
}

// Dig 4-5 logs from (308, 74..78, -28)
for (let y = 74; y <= 78; y++) {
  const p = new Vec3(308, y, -28);
  const b = bot.blockAt(p);
  if (b && b.name.includes('log')) {
    console.log(`Digging log at ${p}...`);
    try { await lib.dig(p.x, p.y, p.z); } catch (e) {}
  }
}
await lib.pickup(5);
console.log('Logs collected:', lib.count('*_log'));

// Convert logs to planks in 2x2
for (const item of bot.inventory.items()) {
  if (item.name.endsWith('_log')) {
    const pName = item.name.replace('_log', '_planks');
    const r = bot.recipesFor(mcData.itemsByName[pName].id, null, 1, null)[0];
    if (r) {
      try { await bot.craft(r, item.count, null); } catch (e) {}
    }
  }
}
console.log('Planks:', lib.count('*_planks'));

// Craft sticks in 2x2
if (lib.count('stick') < 8 && lib.count('*_planks') >= 4) {
  try { await lib.craft('stick', 8); } catch (e) {}
}

// Craft portable crafting table in 2x2
if (lib.count('crafting_table') < 1 && lib.count('*_planks') >= 4) {
  try { await lib.craft('crafting_table', 1); } catch (e) {}
}

// Walk to quarry ledge (302, 68, -42)
console.log('Moving to quarry ledge (302, 68, -42)...');
try {
  await lib.goTo(302, 68, -42, 1.5, { dig: false, timeoutMs: 15000 });
} catch (e) {
  try { await bot.pathfinder.goto(new goals.GoalNear(302, 68, -42, 1.5)); } catch (e2) {}
}

// Place crafting table
let ct = bot.findBlock({ matching: mcData.blocksByName.crafting_table.id, maxDistance: 6 });
if (!ct && lib.count('crafting_table') >= 1) {
  try {
    const spot = await lib.freeSpot();
    await lib.place('crafting_table', spot.x, spot.y, spot.z);
    ct = bot.blockAt(spot);
  } catch (e) {}
}

// Craft wooden pickaxe
if (lib.count('wooden_pickaxe') < 1 && lib.count('stone_pickaxe') < 1) {
  console.log('Crafting wooden pickaxe...');
  try { await lib.craft('wooden_pickaxe', 1); } catch (e) {}
}

// Equip wooden pickaxe
const wp = bot.inventory.items().find(i => i.name.includes('pickaxe'));
if (wp) await bot.equip(wp, 'hand');

// Mine 3 stone
console.log('Mining 3 stone for stone pickaxe...');
let dugStone = 0;
while (lib.count('cobblestone') < 3 && dugStone < 10 && !isCancelled()) {
  dugStone++;
  const stone = bot.findBlock({ matching: mcData.blocksByName.stone.id, maxDistance: 4.5 });
  if (stone) {
    try {
      await bot.dig(stone, true);
      await sleep(150);
    } catch (e) {}
  }
}
await lib.pickup(5);

// Craft stone pickaxe
if (lib.count('cobblestone') >= 3 && lib.count('stone_pickaxe') < 1) {
  console.log('Crafting stone pickaxe...');
  try { await lib.craft('stone_pickaxe', 1); } catch (e) {}
}

// Equip stone pickaxe
const sp = bot.inventory.items().find(i => i.name === 'stone_pickaxe');
if (sp) await bot.equip(sp, 'hand');

// Mine 35 cobblestone
console.log('Mining 35 cobblestone...');
let q = 0;
while (lib.count('cobblestone') < 35 && q < 45 && !isCancelled()) {
  q++;
  const stone = bot.findBlock({ matching: mcData.blocksByName.stone.id, maxDistance: 4.5 });
  if (stone) {
    try {
      await bot.dig(stone, true);
      await sleep(100);
    } catch (e) {}
  } else {
    break;
  }
}
await lib.pickup(6);
console.log('Cobblestone total:', lib.count('cobblestone'));

// Craft 2 stone swords
if (lib.count('cobblestone') >= 4 && lib.count('stone_sword') < 2) {
  console.log('Crafting stone swords...');
  try { await lib.craft('stone_sword', 2); } catch (e) {}
}

await lib.equipWeapon();
console.log('Armed! Inv:', JSON.stringify(lib.inv()));

// --- Phase 2: Walk to Nether Portal & Warp ---
console.log('--- Phase 2: Entering Nether Portal ---');
try {
  await lib.goTo(298, 73, -53, 1.5, { dig: false, timeoutMs: 15000 });
} catch (e) {
  try { await bot.pathfinder.goto(new goals.GoalNear(298, 73, -53, 1.5)); } catch (e2) {}
}

console.log('Stepping into portal block (299.5, 73.0, -54.0)...');
for (let attempt = 0; attempt < 5; attempt++) {
  const target = new Vec3(299.5, 73.0, -54.0);
  await bot.lookAt(target, true);
  bot.setControlState('forward', true);
  bot.setControlState('jump', true);
  await sleep(1200);
  bot.clearControlStates();

  const dist = bot.entity.position.distanceTo(target);
  if (dist < 1.3) {
    console.log('Inside portal block! Holding position for warp...');
    break;
  }
  await sleep(300);
}

// Wait for Nether warp
const startDim = bot.game.dimension;
for (let s = 0; s < 20; s++) {
  await sleep(1000);
  if (isCancelled()) break;
  if (bot.game.dimension !== startDim || bot.game.dimension.includes('nether')) {
    console.log(`WARPED TO THE NETHER! Dimension: ${bot.game.dimension}`);
    break;
  }
}

if (!bot.game.dimension.includes('nether')) {
  console.log('Failed to warp to Nether. Current pos:', lib.fmt(bot.entity.position));
  return { dimension: bot.game.dimension, pos: bot.entity.position, inv: lib.inv() };
}

// --- Phase 3: March to Spawner Pillbox ---
console.log('--- Phase 3: Marching Covered Trail to Spawner ---');
await bot.lookAt(new Vec3(46, 65, -7), true);
bot.setControlState('forward', true);
await sleep(1500);
bot.clearControlStates();

bot.chat('beta: In Nether with stone swords & 30+ cobble! Marching to Spawner Pillbox!');

// Configure movement with strict fire and lava avoidance
const moves = new Movements(bot, mcData);
if (mcData.blocksByName.fire) moves.blocksToAvoid.add(mcData.blocksByName.fire.id);
if (mcData.blocksByName.soul_fire) moves.blocksToAvoid.add(mcData.blocksByName.soul_fire.id);
if (mcData.blocksByName.lava) moves.blocksToAvoid.add(mcData.blocksByName.lava.id);
moves.canDig = false;
moves.allowSprinting = true;
bot.pathfinder.setMovements(moves);

const waypoints = [
  new Vec3(50, 68, -8),
  new Vec3(63, 65, -10),
  new Vec3(63, 66, -20),
  new Vec3(62, 66, -35),
  new Vec3(62, 67, -50),
  new Vec3(61, 67, -65),
  new Vec3(62, 67, -80),
  new Vec3(61, 66, -100),
  new Vec3(50, 65, -115),
  new Vec3(44, 65, -127), // Fortress Workshop Outpost
  new Vec3(44, 65, -145),
  new Vec3(44, 65, -160),
  new Vec3(44, 65, -169),
  new Vec3(44, 65, -176),
  new Vec3(38, 65, -176),
  new Vec3(38, 65, -178),
  new Vec3(37, 65, -184),
  new Vec3(35, 67, -186),
  new Vec3(34, 68, -188)  // Inside Spawner Pillbox
];

for (let i = 0; i < waypoints.length && !isCancelled(); i++) {
  const wp = waypoints[i];
  console.log(`[WP ${i+1}/${waypoints.length}] Navigating to ${wp}...`);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 1.8));
  } catch (e) {
    console.log(`WP ${i+1} path note:`, e.message);
    const d = bot.entity.position.distanceTo(wp);
    if (d < 6) {
      try {
        await bot.lookAt(wp, true);
        bot.setControlState('forward', true);
        await sleep(1000);
        bot.clearControlStates();
      } catch (e2) {}
    }
  }

  // Check for nearby Piglins and defend with sword
  const hostilePiglin = bot.nearestEntity(e => e.name === 'piglin' && bot.entity.position.distanceTo(e.position) < 4.0);
  if (hostilePiglin) {
    console.log('Piglin encountered! Defending with sword...');
    await lib.equipWeapon();
    await bot.lookAt(hostilePiglin.position.offset(0, 1, 0), true);
    bot.attack(hostilePiglin);
    await sleep(600);
  }
}

console.log('INSIDE SPAWNER PILLBOX! Pos:', lib.fmt(bot.entity.position));

// Safety block placements to seal pit and back wall
if (lib.count('cobblestone') > 0) {
  const pit = bot.blockAt(new Vec3(33, 66, -187));
  if (!pit || pit.name === 'air') {
    try { await lib.place('cobblestone', 33, 66, -187); } catch (e) {}
  }
  const wall1 = bot.blockAt(new Vec3(34, 68, -187));
  if (!wall1 || wall1.name === 'air') {
    try { await lib.place('cobblestone', 34, 68, -187); } catch (e) {}
  }
  const wall2 = bot.blockAt(new Vec3(35, 68, -187));
  if (!wall2 || wall2.name === 'air') {
    try { await lib.place('cobblestone', 35, 68, -187); } catch (e) {}
  }
}

// Vacuum dropped gear on the deck
console.log('Vacuuming dropped items...');
await lib.pickup(10);
await lib.equipArmor();
await lib.equipWeapon();
console.log('Equipped gear! Held:', bot.inventory.selectedItem?.name, 'Inv:', JSON.stringify(lib.inv()));
console.log('Blaze rods currently carried:', lib.count('blaze_rod'));

bot.chat(`beta: In Spawner Pillbox! Slaying Blazes for Milestone 8! Rods: ${lib.count('blaze_rod')}`);

// --- Phase 4: Slay Blazes & Harvest 7+ Blaze Rods ---
let rounds = 0;
while (rounds < 100 && !isCancelled()) {
  rounds++;
  const blaze = bot.nearestEntity(e => e.name === 'blaze' && bot.entity.position.distanceTo(e.position) <= 4.2);
  if (blaze) {
    const dist = bot.entity.position.distanceTo(blaze.position).toFixed(1);
    console.log(`[Round ${rounds}] Striking Blaze at dist ${dist}m...`);
    await lib.equipWeapon();
    await bot.lookAt(blaze.position.offset(0, 0.5, 0), true);
    bot.attack(blaze);
    await sleep(600);
  } else {
    if (bot.inventory.slots[45]?.name === 'shield') {
      try { bot.activateItem(true); } catch (e) {}
    }
    await sleep(300);
  }

  if (rounds % 3 === 0) {
    const gained = await lib.pickup(6);
    if (gained > 0) {
      console.log('Drops scooped! Blaze rods:', lib.count('blaze_rod'), 'Inv:', JSON.stringify(lib.inv()));
    }
  }

  if (lib.count('blaze_rod') >= 7) {
    console.log('====================================');
    console.log('MILESTONE 8 COMPLETE! 7+ BLAZE RODS!');
    console.log('====================================');
    bot.chat(`beta: MILESTONE 8 COMPLETE! Harvested ${lib.count('blaze_rod')} Blaze Rods from Spawner!`);
    break;
  }
}

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  blaze_rods: lib.count('blaze_rod'),
  health: bot.health,
  food: bot.food,
  inv: lib.inv()
};
