// programs/247-craft-sword-and-transit.js
console.log('=== CRAFT SWORD AND ENTER NETHER ===');
console.log('Start pos:', lib.fmt(bot.entity.position));
console.log('Offhand:', bot.entity.equipment[1]?.name);
console.log('Inv:', JSON.stringify(lib.inv()));

// 1. Move into base near crafting table
console.log('Moving into base near table (295, 72, -56)...');
try {
  await lib.walkTo(295.5, -55.5, 3000);
} catch (e) {
  try {
    await lib.goThroughDoor(294, 72, -54);
    await lib.walkTo(295.5, -55.5, 3000);
  } catch (e2) {}
}
bot.clearControlStates();

// 2. Craft sticks and stone_sword
if (lib.count('stick') < 1 && lib.count('*_planks') > 0) {
  console.log('Crafting sticks...');
  try { await lib.craft('stick', 4); } catch (e) { console.log('Stick note:', e.message); }
}

if (lib.count('cobblestone') >= 2) {
  console.log('Crafting stone_sword...');
  try {
    await lib.craft('stone_sword', 1);
    console.log('Stone sword crafted successfully!');
  } catch (e) {
    console.log('Sword craft note:', e.message);
  }
}

// 3. Equip sword and shield
try { await lib.equipWeapon(); } catch (e) {}
try { await lib.equipArmor(); } catch (e) {}

console.log('Mainhand:', bot.entity.equipment[0]?.name);
console.log('Offhand:', bot.entity.equipment[1]?.name);
console.log('Cobblestone:', lib.count('cobblestone'));

bot.chat(`gamma geared: SHIELD in offhand, ${bot.entity.equipment[0]?.name} in mainhand, cobble x${lib.count('cobblestone')}! Entering Nether portal.`);

// 4. Step out base door to portal
console.log('Walking to Nether portal...');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {}

// Step into portal block (299.5, 73.0, -54.0)
bot.setControlState('jump', true);
await lib.walkTo(299.5, -54.0, 3000);
bot.clearControlStates();

console.log('Inside portal! Pos:', lib.fmt(bot.entity.position), 'Block:', bot.blockAt(bot.entity.position)?.name);
console.log('Standing still for Nether transit...');

const t0 = Date.now();
while (!isCancelled() && !String(bot.game.dimension).includes('nether') && (Date.now() - t0 < 15000)) {
  await sleep(500);
}

console.log('Dimension now:', bot.game.dimension);
if (String(bot.game.dimension).includes('nether')) {
  console.log('NETHER TRANSIT SUCCESS!');
  await sleep(400);
  // Step out to bunker floor
  await lib.walkTo(40.5, -5.0, 3000);
  bot.clearControlStates();

  console.log('Nether bunker pos:', lib.fmt(bot.entity.position));
  console.log('HP:', bot.health, 'Food:', bot.food);
  console.log('Offhand:', bot.entity.equipment[1]?.name);
  console.log('Mainhand:', bot.entity.equipment[0]?.name);

  bot.chat(`gamma arrived in Nether with SHIELD (offhand) & stone sword! Sprinting along covered ridge to Spawner!`);
} else {
  console.log('Transit still pending or in overworld. Pos:', lib.fmt(bot.entity.position));
}
