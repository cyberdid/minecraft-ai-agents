// programs/248-craft-sword-and-nether-march.js
console.log('=== GET 1 LOG, CRAFT SWORD, AND TRANSIT NETHER ===');
console.log('Start pos:', lib.fmt(bot.entity.position));
console.log('Offhand:', bot.entity.equipment[1]?.name);

// 1. Step outside base door to (294.5, 72, -52)
console.log('Stepping outside base door...');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  try { await lib.walkTo(294.5, -52.0, 3000); } catch (e2) {}
}
bot.clearControlStates();
console.log('Outside doorstep! Pos:', lib.fmt(bot.entity.position));

// 2. Chop 1 log to get planks for sword stick
const logs = lib.find('*_log', { maxDistance: 24, count: 5 });
if (logs.length > 0 && lib.count('*_planks') < 2) {
  console.log(`Chopping log at ${lib.fmt(logs[0].position)}...`);
  try {
    await lib.dig(logs[0].position.x, logs[0].position.y, logs[0].position.z);
    await lib.pickup(6);
  } catch (e) {
    console.log('Log dig error:', e.message);
  }
}

// 3. Craft planks, sticks, stone_sword
const logKey = Object.keys(lib.inv()).find(k => k.endsWith('_log'));
if (logKey) {
  const plankName = logKey.replace('_log', '_planks');
  await lib.craft(plankName, 4);
}

if (lib.count('*_planks') >= 2) {
  await lib.craft('stick', 4);
  if (lib.count('cobblestone') >= 2) {
    await lib.craft('stone_sword', 1);
    console.log('Stone sword crafted successfully!');
  }
}

// 4. Equip sword in mainhand, shield in offhand
await lib.equipWeapon();
await lib.equipArmor();

console.log('Mainhand:', bot.entity.equipment[0]?.name);
console.log('Offhand:', bot.entity.equipment[1]?.name);
console.log('Cobblestone:', lib.count('cobblestone'));

bot.chat(`gamma fully armed: SHIELD in offhand, ${bot.entity.equipment[0]?.name || 'pickaxe'} in mainhand, cobble x${lib.count('cobblestone')}! Entering Nether portal.`);

// 5. Walk to Nether portal at (299.5, 73.0, -54.0)
console.log('Walking to Nether portal...');
try {
  await lib.goTo(299, 72, -52, 1, { timeoutMs: 8000 });
} catch (e) {
  await lib.walkTo(299.5, -52.0, 3000);
}

// Step up into portal block
bot.setControlState('jump', true);
await lib.walkTo(299.5, -54.0, 3000);
bot.clearControlStates();

console.log('Inside portal! Pos:', lib.fmt(bot.entity.position), 'Block:', bot.blockAt(bot.entity.position)?.name);

// 6. Stand still for dimension transit (up to 15s)
console.log('Waiting for dimension change to the_nether...');
const t0 = Date.now();
while (!isCancelled() && !String(bot.game.dimension).includes('nether') && (Date.now() - t0 < 15000)) {
  await sleep(500);
}

console.log('Dimension now:', bot.game.dimension);

if (String(bot.game.dimension).includes('nether')) {
  console.log('TRANSIT SUCCESSFUL!');
  await sleep(400);
  // Step out to bunker floor
  await lib.walkTo(40.5, -5.0, 3000);
  bot.clearControlStates();

  console.log('Bunker pos:', lib.fmt(bot.entity.position));
  console.log('HP:', bot.health, 'Food:', bot.food);
  console.log('Offhand:', bot.entity.equipment[1]?.name);
  console.log('Mainhand:', bot.entity.equipment[0]?.name);
  console.log('Inv:', JSON.stringify(lib.inv()));

  bot.chat(`gamma arrived in Nether with SHIELD and stone weapon! Advancing to Spawner front!`);
} else {
  console.log('Still in overworld. Pos:', lib.fmt(bot.entity.position));
}
