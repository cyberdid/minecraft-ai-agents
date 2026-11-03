// programs/388-ascend-to-base-and-craft-pickaxe.js
console.log('=== ASCEND TO BASE WITH DIG ENABLED ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'Inv:', JSON.stringify(lib.inv()));

// 1. Ascend to base entrance with dig: true
console.log('Pathfinding to base door (294, 72, -53) with dig: true...');
try {
  await lib.goTo(294, 72, -53, 1, { dig: true, timeoutMs: 25000 });
  console.log('Arrived at base entrance!');
} catch (e) {
  console.log('goTo error:', e.message);
  // Manual stepping towards +Z
  bot.setControlState('forward', true);
  bot.setControlState('jump', true);
  await sleep(3000);
  bot.clearControlStates();
  try {
    await lib.goToXZ(294, -53, { timeoutMs: 15000 });
  } catch (e2) {}
}

// 2. Step through door into base
console.log('Stepping through base door...');
try {
  await lib.goThroughDoor(294, 72, -54);
  console.log('Successfully inside base!');
} catch (e) {
  try {
    await lib.door(294, 72, -54, true);
    await lib.walkTo(294.5, -55.5, 3000);
    await lib.door(294, 72, -54, false);
    console.log('Manually entered base!');
  } catch (e2) {
    console.log('Door entry error:', e2.message);
  }
}

console.log('Inside base at:', lib.fmt(bot.entity.position));

// 3. Craft stone pickaxe at base crafting table
if (lib.count('stone_pickaxe') === 0 && lib.count('cobblestone') >= 3 && lib.count('stick') >= 2) {
  console.log('Crafting stone_pickaxe...');
  try {
    await lib.craft('stone_pickaxe', 1);
    console.log('Stone pickaxe crafted successfully!');
  } catch (e) {
    console.log('Craft pickaxe error:', e.message);
  }
}

// 4. Check chest
try {
  const contents = await lib.chestContents(293, 72, -57);
  console.log('Base chest contents:', JSON.stringify(contents));
  for (const it of ['cooked_porkchop', 'bread', 'apple', 'cobblestone', 'iron_ingot', 'shield']) {
    if (contents && contents[it] > 0) {
      await lib.withdraw({ [it]: 'all' }, 293, 72, -57);
    }
  }
} catch (e) {}

// 5. Equip weapon
await lib.equipWeapon();

console.log('Final inv:', JSON.stringify(lib.inv()));
console.log('Ending status:', JSON.stringify(lib.status()));
