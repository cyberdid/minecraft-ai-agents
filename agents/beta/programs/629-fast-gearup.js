// programs/629-fast-gearup.js
console.log('=== Program 629: Fast Overworld Gear-Up ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'Inv:', JSON.stringify(lib.inv()));

bot.clearControlStates();
bot.pathfinder.stop();
await sleep(100);

// 1. Exit base shelter
console.log('Exiting base door (294, 72, -54)...');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  console.log('Door pass note:', e.message);
  try {
    await lib.door(294, 72, -54, true);
    await lib.goTo(295, 72, -53, 1, { dig: false });
    await lib.door(294, 72, -54, false);
  } catch (e2) {}
}

console.log('Outside base at:', lib.fmt(bot.entity.position));

// 2. Gather 4 logs
console.log('Collecting 4 logs from nearby trees...');
try {
  await lib.collect('*_log', 4, { maxDistance: 40 });
} catch (e) {
  console.log('Collect log note:', e.message);
}
console.log('Logs collected! Count:', lib.count('*_log'), 'Inv:', JSON.stringify(lib.inv()));

// 3. Craft planks in 2x2 crafting grid
for (const item of bot.inventory.items()) {
  if (item.name.endsWith('_log')) {
    const pName = item.name.replace('_log', '_planks');
    const r = bot.recipesFor(mcData.itemsByName[pName].id, null, 1, null)[0];
    if (r) {
      try {
        await bot.craft(r, item.count, null);
        console.log(`Crafted ${pName}! Planks:`, lib.count('*_planks'));
      } catch (e) {}
    }
  }
}

// 4. Craft sticks in 2x2 crafting grid
if (lib.count('stick') < 4 && lib.count('*_planks') >= 2) {
  try {
    await lib.craft('stick', 4);
    console.log('Sticks crafted! Count:', lib.count('stick'));
  } catch (e) {}
}

// 5. Ensure crafting table exists near portal/shaft at (299, 72, -52)
let ct = bot.findBlock({ matching: mcData.blocksByName.crafting_table.id, maxDistance: 12 });
if (!ct && lib.count('*_planks') >= 4) {
  try {
    await lib.craft('crafting_table', 1);
    await lib.place('crafting_table', 299, 72, -52);
  } catch (e) {}
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

// 7. Go to mine shaft quarry ledge at (302, 68, -42)
console.log('Navigating to shaft quarry ledge at (302, 68, -42)...');
try {
  await bot.pathfinder.goto(new goals.GoalBlock(302, 68, -42));
} catch (e) {
  try { await lib.goTo(302, 68, -42, 1, { dig: false }); } catch (e2) {}
}

console.log('At quarry ledge:', lib.fmt(bot.entity.position));

// Equip pickaxe
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

// 9. Mine 16 cobblestone with stone pickaxe
console.log('Mining 16 cobblestone...');
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
    console.log('Stone sword ready!');
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
