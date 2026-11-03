// programs/389-base-spawn-and-resupply.js
console.log('=== STEP 1: ENTER BASE, SET SPAWN & RESUPPLY ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'Inv:', JSON.stringify(lib.inv()));
console.log('Time:', JSON.stringify(lib.time()));

// 1. Move to base entrance (294, 72, -53)
console.log('Moving to base door at (294, 72, -53)...');
try {
  await lib.goTo(294, 72, -53, 1, { dig: true });
} catch (e) {
  console.log('goTo door note:', e.message);
  await bot.pathfinder.goto(new goals.GoalNear(294, 72, -53, 1));
}

// 2. Step through door into base
console.log('Entering base...');
try {
  await lib.goThroughDoor(294, 72, -54);
  console.log('Inside base via goThroughDoor!');
} catch (e) {
  try {
    await lib.door(294, 72, -54, true);
    await sleep(200);
    await bot.pathfinder.goto(new goals.GoalBlock(294, 72, -55));
    await lib.door(294, 72, -54, false);
    console.log('Inside base via door toggle!');
  } catch (e2) {
    console.log('Door toggle note:', e2.message);
  }
}

console.log('Current pos:', lib.fmt(bot.entity.position));

// 3. Set spawn at bed
try {
  console.log('Setting spawn at base bed...');
  await lib.setSpawn();
  console.log('Spawn set successfully!');
  bot.chat('gamma: Spawn set at base bed (294, 72, -55).');
} catch (e) {
  console.log('setSpawn note:', e.message);
}

// 4. Check chest at (293, 72, -57)
const chestPos = new Vec3(293, 72, -57);
let chestItems = null;
try {
  chestItems = await lib.chestContents(chestPos.x, chestPos.y, chestPos.z);
  console.log('Base chest contents:', JSON.stringify(chestItems));
} catch (e) {
  console.log('chestContents error:', e.message);
}

// 5. Withdraw useful gear if in chest (food, shield, iron, cobble)
if (chestItems) {
  const needed = {};
  for (const item of ['cooked_porkchop', 'cooked_beef', 'bread', 'apple', 'baked_potato', 'shield', 'iron_sword', 'iron_pickaxe']) {
    if (chestItems[item] && chestItems[item] > 0) {
      needed[item] = chestItems[item];
    }
  }
  if (Object.keys(needed).length > 0) {
    console.log('Withdrawing needed items from chest:', JSON.stringify(needed));
    try {
      await lib.withdraw(needed, chestPos.x, chestPos.y, chestPos.z);
      console.log('Items withdrawn! Inventory now:', JSON.stringify(lib.inv()));
    } catch (e) {
      console.log('Withdraw note:', e.message);
    }
  }
}

// 6. Equip best armor and weapon
try {
  await lib.equipArmor();
  await lib.equipWeapon();
} catch (e) {}

console.log('Ending inventory:', JSON.stringify(lib.inv()));
console.log('Ending status:', JSON.stringify(lib.status()));
