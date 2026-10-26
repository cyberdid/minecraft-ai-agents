// programs/268-sprint-base-and-transit.js
console.log('=== SPRINT TO BASE & NETHER TRANSIT ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension);

// 1. Sprint East to base house
console.log('Sprinting East to base at (294, 72, -54)...');
try {
  await lib.goTo(294, 72, -53, 2, { timeoutMs: 25000 });
} catch (e) {
  try { await lib.goToXZ(294, -54, { timeoutMs: 15000 }); } catch (e2) {}
}

console.log('At base area! Pos:', lib.fmt(bot.entity.position));

// 2. Enter base, set spawn & check chest
try {
  await lib.goThroughDoor(294, 72, -54);
  await lib.setSpawn();
  console.log('Spawn set on Bed 1!');
} catch (e) {
  console.log('Spawn set note:', e.message);
}

try {
  const chest = await bot.openContainer(bot.blockAt(new Vec3(293, 72, -57)));
  for (const it of chest.items()) {
    if (['stone_sword', 'stone_pickaxe', 'shield', 'cobblestone', 'iron_ingot', 'stick'].includes(it.name)) {
      console.log(`Withdrawing ${it.name} x${it.count}...`);
      await chest.withdraw(it.type, null, it.count);
    }
  }
  await chest.close();
} catch (e) {}

// Equip
try { await lib.equipWeapon(); } catch (e) {}
try { await lib.equipArmor(); } catch (e) {}

console.log('Inv before portal:', JSON.stringify(lib.inv()));
bot.chat(`gamma at base, stepping into Nether portal.`);

// 3. Step outside to portal at (299.5, 73.0, -53.5)
try { await lib.goThroughDoor(294, 72, -54); } catch (e) {}

console.log('Walking to center of portal (299.5, 73.0, -53.5)...');
try {
  await lib.goTo(299, 72, -52, 1, { timeoutMs: 8000 });
} catch (e) {
  await lib.walkTo(299.5, -52.0, 3000);
}

bot.setControlState('jump', true);
await lib.walkTo(299.5, -53.5, 3000);
bot.clearControlStates();

console.log('Inside portal! Pos:', lib.fmt(bot.entity.position), 'Block:', bot.blockAt(bot.entity.position)?.name);

// 4. Stand still for dimension transit (up to 15s)
const t0 = Date.now();
while (!isCancelled() && !String(bot.game.dimension).includes('nether') && (Date.now() - t0 < 15000)) {
  await sleep(500);
}

console.log('Dimension now:', bot.game.dimension);

if (String(bot.game.dimension).includes('nether')) {
  console.log('=== ARRIVED IN THE NETHER ===');
  await sleep(400);

  // CRITICAL: Step out strictly at z = -7.5 to avoid z > -7 fire pit!
  await lib.walkTo(40.5, -7.5, 2000);
  bot.clearControlStates();

  console.log('Nether bunker safe pos:', lib.fmt(bot.entity.position));
  console.log('HP:', bot.health, 'Food:', bot.food);
  console.log('Inv:', JSON.stringify(lib.inv()));

  bot.chat(`gamma arrived safely in Nether at (40, 65, -7.5)! Strictly following z<=-7 safe route to East Ridge!`);
}
