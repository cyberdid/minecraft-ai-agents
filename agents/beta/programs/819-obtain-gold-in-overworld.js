// programs/819-obtain-gold-in-overworld.js
globalThis.isProgramCancelled = isCancelled;
console.log('=== Program 819: Return to Base & Obtain Gold Ingots ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

bot.clearControlStates();
bot.pathfinder.stop();

// Ensure golden boots stay equipped
if (bot.inventory.slots[8]?.name !== 'golden_boots') {
  const gb = bot.inventory.items().find(i => i.name === 'golden_boots');
  if (gb) { try { await bot.equip(gb, 'feet'); } catch (e) {} }
}
const sh = bot.inventory.items().find(i => i.name === 'shield');
if (sh && bot.inventory.slots[45]?.name !== 'shield') {
  try { await bot.equip(sh, 'off-hand'); } catch (e) {}
}

// Step 1: Sprint back to Base (293, 72, -55)
bot.chat('Beta: Sprinting back to base to obtain gold ingots for Piglin bartering!');

const waypoints = [
  new Vec3(180, 64, -80),
  new Vec3(220, 66, -70),
  new Vec3(260, 70, -60),
  new Vec3(290, 72, -54),
  new Vec3(293, 72, -55)
];

const moves = new Movements(bot, mcData);
moves.canDig = true;
moves.allowParkour = true;
bot.pathfinder.setMovements(moves);

for (let i = 0; i < waypoints.length && !isCancelled(); i++) {
  const wp = waypoints[i];
  if (bot.entity.position.distanceTo(wp) < 3.0) continue;
  console.log(`Advancing to waypoint ${i + 1}/${waypoints.length}: ${lib.fmt(wp)}`);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2.0));
  } catch (e) {
    try { await lib.goTo(wp.x, wp.y, wp.z, 2.5, { timeoutMs: 8000 }); } catch (e2) {}
  }
}

// Enter base door
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  try { await lib.goTo(293, 72, -55, 1.2); } catch (e2) {}
}

console.log('Pos inside base:', lib.fmt(bot.entity.position));

// Lock spawn point at bed
try {
  await lib.setSpawn();
  console.log('Spawn point locked at base bed.');
} catch (e) {}

// Step 2: Check Base Chest for raw_gold, gold_ingot, or coal
const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
if (chestBlock) {
  try {
    const chest = await bot.openChest(chestBlock);
    console.log('Base Chest items:', chest.items().map(i => `${i.name}x${i.count}`).join(', '));
    const gold = chest.items().find(i => i.name === 'gold_ingot');
    if (gold) await chest.withdraw(gold.type, null, gold.count);
    const rawGold = chest.items().find(i => i.name === 'raw_gold');
    if (rawGold) await chest.withdraw(rawGold.type, null, rawGold.count);
    const coal = chest.items().find(i => i.name === 'coal' || i.name === 'charcoal');
    if (coal) await chest.withdraw(coal.type, null, Math.min(coal.count, 16));
    await chest.close();
  } catch (e) {}
}

// Step 3: Smelt raw_gold if we have any
if (lib.count('raw_gold') > 0) {
  console.log(`Smelting ${lib.count('raw_gold')} raw_gold in furnace...`);
  try {
    await lib.smelt('raw_gold', '*_planks', lib.count('raw_gold'));
  } catch (e) {
    console.log('Smelt notice:', e.message);
  }
}

console.log(`Gold ingots currently in inventory: ${lib.count('gold_ingot')}`);

// Step 4: If gold ingots < 4, obtain gold ingots using lib.obtain
if (lib.count('gold_ingot') < 4 && !isCancelled()) {
  const needed = 4 - lib.count('gold_ingot');
  console.log(`Obtaining ${needed} gold_ingot using lib.obtain...`);
  try {
    const obtainRes = await lib.obtain('gold_ingot', 4);
    console.log('lib.obtain result:', JSON.stringify(obtainRes));
    bot.chat(`Beta: Successfully obtained gold ingots! Total: ${lib.count('gold_ingot')}!`);
  } catch (e) {
    console.log('lib.obtain notice:', e.message);
  }
}

// Ensure golden boots still on feet
if (bot.inventory.slots[8]?.name !== 'golden_boots') {
  const gb = bot.inventory.items().find(i => i.name === 'golden_boots');
  if (gb) { try { await bot.equip(gb, 'feet'); } catch (e) {} }
}

console.log('=== Program 819 Summary ===');
console.log('Pos:', lib.fmt(bot.entity.position));
console.log('HP:', bot.health, 'Food:', bot.food);
console.log('Gold ingots in inv:', lib.count('gold_ingot'));
console.log('Golden boots equipped:', bot.inventory.slots[8]?.name === 'golden_boots');
console.log('Inventory:', lib.inv());

return {
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  gold_ingots: lib.count('gold_ingot'),
  golden_boots: bot.inventory.slots[8]?.name === 'golden_boots'
};
