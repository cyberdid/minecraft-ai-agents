// programs/637-finish-sprint-and-gearup.js
console.log('=== Program 637: Finish Sprint, Gather Logs, Lock Spawn & Mine Stone ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

bot.clearControlStates();
bot.pathfinder.stop();
await sleep(100);

const moves = new Movements(bot, mcData);
moves.canDig = false;
moves.allowSprinting = true;
bot.pathfinder.setMovements(moves);

// 1. Sprint to (240, 66, -75) then to birch stand at (273, 71, -74)
console.log('Moving to (240, 66, -75)...');
try {
  await bot.pathfinder.goto(new goals.GoalNear(240, 66, -75, 2.5));
} catch (e) {
  try { await lib.goTo(240, 66, -75, 2.5, { dig: false, timeoutMs: 15000 }); } catch (e2) {}
}

console.log('Moving to birch tree at (273, 71, -74)...');
try {
  await bot.pathfinder.goto(new goals.GoalNear(273, 71, -74, 1.5));
} catch (e) {
  try { await lib.goTo(273, 71, -74, 1.5, { dig: false, timeoutMs: 15000 }); } catch (e2) {}
}

// 2. Chop birch logs
console.log('Chopping birch logs at (272, 71..74, -75)...');
for (const y of [72, 73, 71, 74]) {
  const b = bot.blockAt(new Vec3(272, y, -75));
  if (b && b.name.includes('log')) {
    try {
      console.log(`Digging log at (272, ${y}, -75)...`);
      await lib.dig(272, y, -75);
    } catch (e) {}
  }
}
await lib.pickup(5);
console.log('Inv after chop:', JSON.stringify(lib.inv()));

// 3. Craft planks in 2x2
for (const item of bot.inventory.items()) {
  if (item.name.endsWith('_log')) {
    const pName = item.name.replace('_log', '_planks');
    const r = bot.recipesFor(mcData.itemsByName[pName].id, null, 1, null)[0];
    if (r) {
      try {
        await bot.craft(r, item.count, null);
        console.log(`Crafted ${pName}! Count:`, lib.count(pName));
      } catch (e) {}
    }
  }
}

// Craft sticks in 2x2
if (lib.count('stick') < 4 && lib.count('*_planks') >= 2) {
  try {
    await lib.craft('stick', 4);
    console.log('Crafted sticks! Count:', lib.count('stick'));
  } catch (e) {}
}

// Craft crafting table in 2x2
if (lib.count('crafting_table') < 1 && lib.count('*_planks') >= 4) {
  try {
    await lib.craft('crafting_table', 1);
    console.log('Crafted crafting table!');
  } catch (e) {}
}

// 4. Move to base door at (294, 72, -53)
console.log('Moving to base door at (294, 72, -53)...');
try {
  await bot.pathfinder.goto(new goals.GoalNear(294, 72, -53, 1.5));
} catch (e) {
  try { await lib.goTo(294, 72, -53, 1.5, { dig: false, timeoutMs: 15000 }); } catch (e2) {}
}

// Enter base shelter
console.log('Entering base shelter through door (294, 72, -54)...');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  try {
    await lib.door(294, 72, -54, true);
    await lib.goTo(293, 72, -55, 1, { dig: false });
    await lib.door(294, 72, -54, false);
  } catch (e2) {}
}

// Set spawn at base bed
try {
  await lib.setSpawn();
  console.log('SUCCESS: Spawn locked at base bed!');
} catch (e) {
  console.log('setSpawn note:', e.message);
}

// Craft wooden pickaxe at base table
if (lib.count('wooden_pickaxe') < 1 && lib.count('stone_pickaxe') < 1) {
  console.log('Crafting wooden pickaxe...');
  try {
    await lib.craft('wooden_pickaxe', 1);
    console.log('Wooden pickaxe ready!');
  } catch (e) {
    console.log('Craft wooden pick note:', e.message);
  }
}

// 5. Exit base to mine shaft quarry ledge at (302, 68, -42)
console.log('Exiting to quarry ledge at (302, 68, -42)...');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {}

try {
  await bot.pathfinder.goto(new goals.GoalBlock(302, 68, -42));
} catch (e) {
  try { await lib.goTo(302, 68, -42, 1, { dig: false, timeoutMs: 15000 }); } catch (e2) {}
}

// Equip wooden pickaxe
const wp = bot.inventory.items().find(i => i.name.includes('pickaxe'));
if (wp) await bot.equip(wp, 'hand');

// 6. Mine 3 stone for stone pickaxe
console.log('Mining 3 stone for stone pickaxe...');
let dug = 0;
while (lib.count('cobblestone') < 3 && dug < 8 && !isCancelled()) {
  dug++;
  const stone = bot.findBlock({
    matching: mcData.blocksByName.stone.id,
    maxDistance: 4.5
  });
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
  try {
    await lib.craft('stone_pickaxe', 1);
    console.log('Stone pickaxe ready! Count:', lib.count('stone_pickaxe'));
  } catch (e) {
    console.log('Stone pick craft note:', e.message);
  }
}

const sp = bot.inventory.items().find(i => i.name === 'stone_pickaxe');
if (sp) await bot.equip(sp, 'hand');

// 7. Mine 16 cobblestone with stone pickaxe
console.log('Mining 16 cobblestone with stone pickaxe...');
let quarry = 0;
while (lib.count('cobblestone') < 16 && quarry < 20 && !isCancelled()) {
  quarry++;
  const stone = bot.findBlock({
    matching: mcData.blocksByName.stone.id,
    maxDistance: 4.5
  });
  if (stone) {
    try {
      await bot.dig(stone, true);
      await sleep(120);
    } catch (e) {}
  }
}
await lib.pickup(5);

// 8. Craft stone sword
if (lib.count('cobblestone') >= 2 && lib.count('stone_sword') < 1) {
  if (lib.count('stick') < 1 && lib.count('*_planks') >= 2) {
    try { await lib.craft('stick', 4); } catch (e) {}
  }
  console.log('Crafting stone sword...');
  try {
    await lib.craft('stone_sword', 1);
    console.log('Stone sword ready! Count:', lib.count('stone_sword'));
  } catch (e) {
    console.log('Stone sword craft note:', e.message);
  }
}

await lib.equipWeapon();
console.log('Gear complete! Held:', bot.inventory.selectedItem?.name, 'Inv:', JSON.stringify(lib.inv()));

// 9. Sprint into Nether portal at (299.5, 73.0, -54.0)
console.log('Sprinting into Nether portal...');
try {
  await bot.pathfinder.goto(new goals.GoalBlock(299, 73, -54));
} catch (e) {
  try { await lib.goTo(299.5, 73.0, -54.0, 0.2, { dig: false }); } catch (e2) {}
}

bot.clearControlStates();
bot.pathfinder.stop();

console.log('Waiting for Nether warp...');
const startDim = bot.game.dimension;
for (let s = 0; s < 18; s++) {
  await sleep(1000);
  if (isCancelled()) break;
  if (bot.game.dimension !== startDim || bot.game.dimension.includes('nether')) {
    console.log(`WARPED TO THE NETHER! Dimension: ${bot.game.dimension}`);
    break;
  }
}

return {
  pos: bot.entity.position,
  dimension: bot.game.dimension,
  inv: lib.inv(),
  held: bot.inventory.selectedItem?.name,
  health: bot.health,
  food: bot.food
};
