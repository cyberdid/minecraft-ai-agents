// programs/631-craft-and-mine-gear.js
console.log('=== Program 631: Craft Gear & Mine Stone ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'Inv:', JSON.stringify(lib.inv()));

bot.clearControlStates();
bot.pathfinder.stop();
await sleep(100);

// 1. Craft 16 birch planks
const rPlanks = bot.recipesFor(mcData.itemsByName.birch_planks.id, null, 1, null)[0];
if (rPlanks) {
  try {
    await bot.craft(rPlanks, 4, null);
    console.log('Crafted planks! Count:', lib.count('birch_planks'));
  } catch (e) {}
}

// 2. Craft sticks
const rSticks = bot.recipesFor(mcData.itemsByName.stick.id, null, 1, null)[0];
if (rSticks) {
  try {
    await bot.craft(rSticks, 1, null);
    console.log('Crafted sticks! Count:', lib.count('stick'));
  } catch (e) {}
}

// 3. Craft crafting table
const rCt = bot.recipesFor(mcData.itemsByName.crafting_table.id, null, 1, null)[0];
if (rCt) {
  try {
    await bot.craft(rCt, 1, null);
    console.log('Crafted crafting table! Count:', lib.count('crafting_table'));
  } catch (e) {}
}

// 4. Walk to mine shaft quarry ledge at (302, 68, -42)
console.log('Walking to shaft quarry ledge at (302, 68, -42)...');
try {
  await lib.goTo(302, 68, -42, 1, { dig: false, timeoutMs: 25000 });
} catch (e) {
  try { await bot.pathfinder.goto(new goals.GoalBlock(302, 68, -42)); } catch (e2) {}
}
console.log('At quarry ledge:', lib.fmt(bot.entity.position));

// 5. Place crafting table
let ct = bot.findBlock({ matching: mcData.blocksByName.crafting_table.id, maxDistance: 5 });
if (!ct && lib.count('crafting_table') >= 1) {
  try {
    const spot = await lib.freeSpot();
    await lib.place('crafting_table', spot.x, spot.y, spot.z);
    ct = bot.blockAt(spot);
  } catch (e) {
    console.log('Place table note:', e.message);
  }
}

// 6. Craft wooden pickaxe
if (lib.count('wooden_pickaxe') < 1 && lib.count('stone_pickaxe') < 1) {
  console.log('Crafting wooden pickaxe...');
  try {
    await lib.craft('wooden_pickaxe', 1);
    console.log('Wooden pickaxe ready!');
  } catch (e) {
    console.log('Craft wooden pick note:', e.message);
  }
}

// Equip wooden pickaxe
const wp = bot.inventory.items().find(i => i.name.includes('pickaxe'));
if (wp) await bot.equip(wp, 'hand');

// 7. Mine 3 stone for stone pickaxe
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

// 8. Craft stone pickaxe
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

// 9. Mine 16 cobblestone with stone pickaxe
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

// 10. Craft stone sword
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
console.log('Gear-Up Complete! Held:', bot.inventory.selectedItem?.name, 'Inv:', JSON.stringify(lib.inv()));

// 11. Check time: if night is near, go to base; otherwise go to Nether portal
const t = lib.time();
console.log('Time until night:', t.secondsUntilNight);

if (t.secondsUntilNight < 75) {
  console.log('Night approaching! Entering base shelter at (294, 72, -54)...');
  try {
    await lib.goThroughDoor(294, 72, -54);
    await lib.setSpawn();
    console.log('Safely inside base shelter, spawn set!');
  } catch (e) {
    console.log('Base entry note:', e.message);
  }
} else {
  console.log('Sprinting into Nether portal at (299.5, 73.0, -54.0)...');
  try {
    await bot.pathfinder.goto(new goals.GoalBlock(299, 73, -54));
  } catch (e) {
    try { await lib.goTo(299.5, 73.0, -54.0, 0.2, { dig: false }); } catch (e2) {}
  }
}

return {
  pos: bot.entity.position,
  inv: lib.inv(),
  held: bot.inventory.selectedItem?.name,
  health: bot.health,
  food: bot.food,
  time: t.secondsUntilNight
};
