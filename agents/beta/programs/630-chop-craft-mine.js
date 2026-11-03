// programs/630-chop-craft-mine.js
console.log('=== Program 630: Chop Tree at (303, 72, -17), Craft Tools & Mine Stone ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'Inv:', JSON.stringify(lib.inv()));

bot.clearControlStates();
bot.pathfinder.stop();
await sleep(100);

// 1. Walk to tree at (303, 71, -19)
console.log('Walking to birch tree at (303, 71, -19)...');
try {
  await lib.goTo(303, 71, -19, 1.5, { dig: false, timeoutMs: 25000 });
} catch (e) {
  console.log('goTo tree note:', e.message);
  await bot.pathfinder.goto(new goals.GoalNear(303, 71, -19, 1.5));
}
console.log('At tree:', lib.fmt(bot.entity.position));

// 2. Dig birch logs
for (let y = 72; y <= 75; y++) {
  const b = bot.blockAt(new Vec3(303, y, -17));
  if (b && b.name.includes('log')) {
    try {
      console.log(`Digging log at (303, ${y}, -17)...`);
      await lib.dig(303, y, -17);
    } catch (e) {
      console.log(`Dig note y=${y}:`, e.message);
    }
  }
}
await lib.pickup(5);
console.log('Inv after chopping:', JSON.stringify(lib.inv()));

// 3. Craft planks
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

// 4. Craft sticks
if (lib.count('stick') < 4 && lib.count('*_planks') >= 2) {
  try {
    await lib.craft('stick', 4);
    console.log('Sticks crafted! Count:', lib.count('stick'));
  } catch (e) {}
}

// 5. Craft portable crafting table
if (lib.count('crafting_table') < 1 && lib.count('*_planks') >= 4) {
  try {
    await lib.craft('crafting_table', 1);
    console.log('Crafted crafting table!');
  } catch (e) {}
}

// 6. Walk to mine shaft quarry ledge at (302, 68, -42)
console.log('Walking to mine shaft quarry ledge at (302, 68, -42)...');
try {
  await lib.goTo(302, 68, -42, 1, { dig: false, timeoutMs: 25000 });
} catch (e) {
  await bot.pathfinder.goto(new goals.GoalBlock(302, 68, -42));
}
console.log('At shaft ledge:', lib.fmt(bot.entity.position));

// Place crafting table nearby if not present
let ct = bot.findBlock({ matching: mcData.blocksByName.crafting_table.id, maxDistance: 6 });
if (!ct && lib.count('crafting_table') >= 1) {
  try {
    const spot = await lib.freeSpot();
    await lib.place('crafting_table', spot.x, spot.y, spot.z);
    ct = bot.blockAt(spot);
  } catch (e) {
    console.log('Place table note:', e.message);
  }
}

// 7. Craft wooden pickaxe
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

// 8. Dig 3 stone for stone pickaxe
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

// 9. Craft stone pickaxe
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

// 10. Mine 16 cobblestone with stone pickaxe
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

// 11. Craft stone sword
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

return {
  pos: bot.entity.position,
  inv: lib.inv(),
  held: bot.inventory.selectedItem?.name,
  health: bot.health,
  food: bot.food
};
