// programs/656-team-gearup.js
console.log('=== Program 656: Team Gear-Up (Logs, Stone Tools, 64 Cobble) ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'Inv:', JSON.stringify(lib.inv()));

bot.clearControlStates();
bot.pathfinder.stop();
await sleep(100);

bot.chat('beta: Team united at base! Gearing up with stone tools and 64 cobble before Nether re-entry!');

// Step 1: Exit base door
console.log('Step 1: Exiting base door...');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  try {
    await lib.door(294, 72, -54, true);
    await lib.goTo(295, 72, -53, 1, { dig: false });
    await lib.door(294, 72, -54, false);
  } catch (e2) {}
}

// Step 2: Sprint to oak tree at (272, 70, -78)
console.log('Step 2: Sprinting to oak tree at (272, 70, -78)...');
try {
  await lib.goTo(273, 70, -77, 1.5, { dig: false, timeoutMs: 15000 });
} catch (e) {
  try { await bot.pathfinder.goto(new goals.GoalNear(273, 70, -77, 1.5)); } catch (e2) {}
}

// Dig 5 oak logs
for (const y of [70, 71, 72, 73, 74]) {
  const b = bot.blockAt(new Vec3(272, y, -78));
  if (b && b.name.includes('log')) {
    try {
      console.log(`Digging log at (272, ${y}, -78)...`);
      await lib.dig(272, y, -78);
    } catch (e) {}
  }
}
await lib.pickup(5);
console.log('Logs gathered:', lib.count('*_log'));

// Convert logs to planks in 2x2
for (const item of bot.inventory.items()) {
  if (item.name.endsWith('_log')) {
    const pName = item.name.replace('_log', '_planks');
    const r = bot.recipesFor(mcData.itemsByName[pName].id, null, 1, null)[0];
    if (r) {
      try {
        await bot.craft(r, item.count, null);
        console.log(`Crafted planks! Total:`, lib.count('*_planks'));
      } catch (e) {}
    }
  }
}

// Craft sticks in 2x2
if (lib.count('stick') < 8 && lib.count('*_planks') >= 4) {
  try { await lib.craft('stick', 8); } catch (e) {}
}

// Craft portable crafting table in 2x2
if (lib.count('crafting_table') < 1 && lib.count('*_planks') >= 4) {
  try { await lib.craft('crafting_table', 1); } catch (e) {}
}

// Step 3: Walk to quarry ledge (302, 68, -42)
console.log('Step 3: Moving to quarry ledge (302, 68, -42)...');
try {
  await lib.goTo(302, 68, -42, 1.5, { dig: false, timeoutMs: 20000 });
} catch (e) {
  try { await bot.pathfinder.goto(new goals.GoalNear(302, 68, -42, 1.5)); } catch (e2) {}
}

// Ensure crafting table placed nearby
let ct = bot.findBlock({ matching: mcData.blocksByName.crafting_table.id, maxDistance: 6 });
if (!ct && lib.count('crafting_table') >= 1) {
  try {
    const spot = await lib.freeSpot();
    await lib.place('crafting_table', spot.x, spot.y, spot.z);
    ct = bot.blockAt(spot);
  } catch (e) {}
}

// Craft wooden pickaxe if needed
if (lib.count('wooden_pickaxe') < 1 && lib.count('stone_pickaxe') < 1) {
  console.log('Crafting wooden pickaxe...');
  try { await lib.craft('wooden_pickaxe', 1); } catch (e) {}
}

// Equip wooden pickaxe
const wp = bot.inventory.items().find(i => i.name.includes('pickaxe'));
if (wp) await bot.equip(wp, 'hand');

// Mine 3 stone for stone pickaxe
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

// Mine cobblestone up to 64
console.log('Mining cobblestone up to 64...');
let q = 0;
while (lib.count('cobblestone') < 64 && q < 70 && !isCancelled()) {
  q++;
  const stone = bot.findBlock({ matching: mcData.blocksByName.stone.id, maxDistance: 4.5 });
  if (stone) {
    try {
      await bot.dig(stone, true);
      await sleep(100);
    } catch (e) {}
  } else {
    // If no stone in immediate reach, step forward slightly along ledge
    break;
  }
}
await lib.pickup(6);
console.log('Cobblestone mined:', lib.count('cobblestone'));

// Craft 2 stone swords
if (lib.count('cobblestone') >= 4 && lib.count('stone_sword') < 2) {
  console.log('Crafting stone swords...');
  try { await lib.craft('stone_sword', 2); } catch (e) {}
}

await lib.equipWeapon();
console.log('Armed! Final Inv:', JSON.stringify(lib.inv()));

// Step 4: Step back near base door (294, 72, -53)
console.log('Step 4: Returning to base door exterior...');
try {
  await lib.goTo(294, 72, -53, 1.5, { dig: false });
} catch (e) {}

const t = lib.time();
console.log(`Current time: ${t.timeOfDay}, secondsUntilNight: ${t.secondsUntilNight}`);
if (t.secondsUntilNight < 90) {
  console.log('Night approaching! Entering base shelter...');
  try {
    await lib.goThroughDoor(294, 72, -54);
    await lib.setSpawn();
  } catch (e) {}
}

return {
  pos: bot.entity.position,
  health: bot.health,
  food: bot.food,
  cobblestone: lib.count('cobblestone'),
  swords: lib.count('stone_sword'),
  pickaxes: lib.count('stone_pickaxe'),
  inv: lib.inv()
};
