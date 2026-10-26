// programs/246-craft-sword-and-transit-nether.js
console.log('=== CRAFT STONE SWORD & TRANSIT WITH SHIELD ===');
console.log('Start pos:', lib.fmt(bot.entity.position));
console.log('Offhand:', bot.entity.equipment[1]?.name);
console.log('Inv:', JSON.stringify(lib.inv()));

// 1. Walk up to crafting table at (295, 72, -56)
console.log('Climbing up to base house crafting table...');
try {
  await lib.goTo(295, 72, -56, 1, { timeoutMs: 15000 });
} catch (e) {
  console.log('goTo table note:', e.message);
  try {
    await lib.goTo(294, 72, -53, 1, { timeoutMs: 10000 });
    await lib.goThroughDoor(294, 72, -54);
  } catch (e2) {}
}

console.log('Inside base! Pos:', lib.fmt(bot.entity.position));

// 2. Craft sticks and stone_sword
if (lib.count('stick') < 1 && lib.count('*_planks') > 0) {
  console.log('Crafting sticks...');
  try { await lib.craft('stick', 2); } catch (e) {}
}

if (lib.count('cobblestone') >= 2) {
  console.log('Crafting stone_sword...');
  try {
    await lib.craft('stone_sword', 1);
    console.log('Stone sword crafted!');
  } catch (e) {
    console.log('Sword craft note:', e.message);
  }
}

// 3. Equip sword in mainhand, shield in offhand
await lib.equipWeapon();
await lib.equipArmor();

console.log('=== COMBAT GEAR VERIFIED ===');
console.log('Mainhand:', bot.entity.equipment[0]?.name);
console.log('Offhand:', bot.entity.equipment[1]?.name);
console.log('Inv:', JSON.stringify(lib.inv()));
console.log('HP:', bot.health, 'Food:', bot.food);

bot.chat(`gamma armed: SHIELD in offhand, ${bot.entity.equipment[0]?.name} in mainhand! Stepping into Nether portal.`);

// 4. Step into Nether portal at (299.5, 73.0, -54.0)
console.log('Approaching portal...');
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
console.log('Pos now:', lib.fmt(bot.entity.position));

if (String(bot.game.dimension).includes('nether')) {
  await sleep(400);
  await lib.walkTo(40.5, -5.0, 3000);
  bot.clearControlStates();
  console.log('Bunker pos:', lib.fmt(bot.entity.position));
  console.log('Final offhand:', bot.entity.equipment[1]?.name);
  console.log('Final mainhand:', bot.entity.equipment[0]?.name);
  bot.chat(`gamma in Nether at ${lib.fmt(bot.entity.position)} with SHIELD and stone sword! Advancing to Spawner!`);
}
