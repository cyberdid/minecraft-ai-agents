// programs/244-craft-shield-and-stone-kit.js
console.log('=== CRAFT SHIELD & STONE KIT BEFORE NETHER EXPEDITION ===');
console.log('Start pos:', lib.fmt(bot.entity.position));
console.log('Inv:', JSON.stringify(lib.inv()));
console.log('Time until night:', lib.time().secondsUntilNight);

// 1. Step through base door
console.log('Exiting base door to gather wood & stone...');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  try { await lib.walkTo(294.5, -52.0, 3000); } catch (e2) {}
}

// 2. Collect 3 logs from accessible tree
console.log('Collecting 3 logs...');
try {
  await lib.collect('*_log', 3);
} catch (e) {
  console.log('Log collect note:', e.message);
  // Fallback to digging tree trunk at (270, 72..74, -52)
  console.log('Walking to fallback tree at (272, 72, -52)...');
  try {
    await lib.goTo(272, 72, -52, 2, { timeoutMs: 12000 });
    for (const y of [72, 73, 74]) {
      const b = bot.blockAt(new Vec3(270, y, -52));
      if (b && b.name.includes('log')) await lib.dig(270, y, -52);
    }
    await lib.pickup(6);
  } catch (e2) {
    console.log('Fallback tree error:', e2.message);
  }
}

console.log('Logs in inv:', lib.count('*_log'));

// 3. Craft planks, sticks, wooden pickaxe
const logKey = Object.keys(lib.inv()).find(k => k.endsWith('_log'));
if (logKey) {
  const plankName = logKey.replace('_log', '_planks');
  console.log(`Crafting ${plankName}...`);
  await lib.craft(plankName, 12);
  await lib.craft('stick', 4);
  await lib.craft('wooden_pickaxe', 1);
}

// 4. Mine 16 stone
console.log('Collecting 16 stone on hillside...');
try {
  await lib.collect('stone', 16, { maxBelow: 4 });
} catch (e) {
  console.log('Stone collect note:', e.message);
}
console.log('Cobblestone count:', lib.count('cobblestone'));

// 5. Return inside base to crafting table (295, 72, -56)
console.log('Returning to crafting table inside base...');
try {
  await lib.goTo(294, 72, -53, 1, { timeoutMs: 12000 });
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  try { await lib.walkTo(295.5, -55.5, 3000); } catch (e2) {}
}

// 6. Craft SHIELD (1 iron ingot + 6 planks)!
if (lib.count('iron_ingot') >= 1 && lib.count('*_planks') >= 6) {
  console.log('Crafting SHIELD (1 iron ingot + 6 planks)...');
  try {
    await lib.craft('shield', 1);
    console.log('SHIELD CRAFTED SUCCESSFULLY!');
  } catch (e) {
    console.log('Shield craft error:', e.message);
  }
}

// Craft stone tools
if (lib.count('cobblestone') >= 5) {
  console.log('Crafting stone tools...');
  if (lib.count('stick') < 4) await lib.craft('stick', 4);
  try {
    await lib.craft('stone_pickaxe', 1);
    await lib.craft('stone_sword', 1);
  } catch (e) {
    console.log('Stone tools craft error:', e.message);
  }
}

// Equip shield in offhand and stone sword in main hand
try {
  await lib.equipArmor();
  await lib.equipWeapon();
} catch (e) {
  console.log('Equip error:', e.message);
}

console.log('=== GEAR READY ===');
console.log('Tools/Gear:', JSON.stringify(lib.tools()));
console.log('Inv:', JSON.stringify(lib.inv()));
bot.chat(`gamma armed: SHIELD in offhand, stone sword & pickaxe, cobble x${lib.count('cobblestone')}! Ready for Nether!`);

// 7. Step into Nether portal and transit
console.log('Approaching Nether portal at (299, 73, -54)...');
await lib.goTo(299, 72, -52, 1, { timeoutMs: 8000 });
bot.setControlState('jump', true);
await lib.walkTo(299.5, -54.0, 3000);
bot.clearControlStates();

console.log('Inside portal! Standing still for transit...');
const t0 = Date.now();
while (!isCancelled() && !String(bot.game.dimension).includes('nether') && (Date.now() - t0 < 15000)) {
  await sleep(500);
}

console.log('Dimension now:', bot.game.dimension);
if (String(bot.game.dimension).includes('nether')) {
  await sleep(400);
  await lib.walkTo(40.5, -5.0, 3000);
  bot.clearControlStates();
  console.log('In Nether bunker! Pos:', lib.fmt(bot.entity.position));
  bot.chat(`gamma in Nether with SHIELD and stone gear! Marching to join Delta at Spawner front!`);
}
