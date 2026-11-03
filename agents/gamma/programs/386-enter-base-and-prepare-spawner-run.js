// programs/386-enter-base-and-prepare-spawner-run.js
console.log('=== ASCEND GENTLE SLOPE TO BASE & CRAFT ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'Inv:', JSON.stringify(lib.inv()));

// 1. Move via gentle west slope to base
try {
  await lib.goTo(280, 71, -60, 2, { timeoutMs: 12000 });
  await lib.goTo(294, 72, -53, 1, { timeoutMs: 8000 });
} catch (e) {
  console.log('Slope navigation fallback to goToXZ:', e.message);
  try {
    await lib.goToXZ(280, -60, { timeoutMs: 8000 });
    await lib.goTo(294, 72, -53, 1, { dig: true, timeoutMs: 8000 });
  } catch (e2) {}
}

// 2. Step inside base
console.log('Entering base door...');
try {
  await lib.goThroughDoor(294, 72, -54);
  console.log('Inside base!');
} catch (e) {
  try {
    await lib.door(294, 72, -54, true);
    await lib.walkTo(294.5, -55.5, 3000);
    await lib.door(294, 72, -54, false);
  } catch (e2) {}
}

console.log('Inside base at:', lib.fmt(bot.entity.position));

// 3. Craft stone pickaxe
if (lib.count('stone_pickaxe') === 0 && lib.count('cobblestone') >= 3 && lib.count('stick') >= 2) {
  console.log('Crafting stone_pickaxe inside base...');
  try {
    await lib.craft('stone_pickaxe', 1);
    console.log('Stone pickaxe crafted!');
  } catch (e) {
    console.log('Craft pickaxe error:', e.message);
  }
}

// 4. Check chest for food or supplies
try {
  const contents = await lib.chestContents(293, 72, -57);
  console.log('Base chest:', JSON.stringify(contents));
  for (const it of ['cooked_porkchop', 'bread', 'apple', 'cobblestone', 'iron_ingot', 'shield']) {
    if (contents && contents[it] > 0) {
      await lib.withdraw({ [it]: 'all' }, 293, 72, -57);
    }
  }
} catch (e) {}

// 5. Sleep if dusk/night
const t = lib.time();
console.log(`Time: ${t.timeOfDay}, night in: ${t.secondsUntilNight}s, canSleep: ${t.canSleep}`);
if (t.canSleep || t.timeOfDay >= 12542) {
  console.log('Sleeping in base bed...');
  try { await lib.sleepInBed(); } catch (e) {}
}

// 6. Equip weapon
await lib.equipWeapon();

console.log('Ending inventory:', JSON.stringify(lib.inv()));
console.log('Ending status:', JSON.stringify(lib.status()));
