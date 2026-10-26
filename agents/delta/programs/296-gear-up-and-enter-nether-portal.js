// programs/296-gear-up-and-enter-nether-portal.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('Health:', bot.health, 'Food:', bot.food);

// 1. Exit base through door
console.log('Exiting base through door at (294, 72, -54)...');
try {
  await lib.goThroughDoor(294, 72, -54);
  console.log('Exited door, new pos:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Door passage note:', e.message);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(294, 72, -54, 1));
    await lib.goThroughDoor(294, 72, -54);
  } catch (e2) {}
}

// 2. Gather logs if we don't have enough
if (lib.count('*_log') < 2 && lib.count('*_planks') < 4) {
  console.log('Collecting 3 logs...');
  try {
    await lib.collect('*_log', 3);
    console.log('Logs collected! Count:', lib.count('*_log'));
  } catch (e) {
    console.log('Log collect error:', e.message);
  }
}

// 3. Craft planks and sticks
const logItem = bot.inventory.items().find(i => i.name.endsWith('_log'));
if (logItem && lib.count('*_planks') < 4) {
  const plankName = logItem.name.replace('_log', '_planks');
  try {
    await lib.craft(plankName, 8);
    console.log('Planks crafted:', lib.count('*_planks'));
  } catch (e) {}
}

if (lib.count('stick') < 4) {
  try {
    await lib.craft('stick', 4);
    console.log('Sticks crafted:', lib.count('stick'));
  } catch (e) {}
}

// 4. Craft wooden pickaxe if needed
if (lib.count('*_pickaxe') === 0) {
  try {
    await lib.craft('wooden_pickaxe', 1);
    console.log('Wooden pickaxe crafted!');
  } catch (e) {}
}

// 5. Gather 24 cobblestone
if (lib.count('cobblestone') < 20) {
  console.log('Collecting 20 cobblestone...');
  try {
    await lib.collect('cobblestone', 20);
    console.log('Cobblestone collected! Count:', lib.count('cobblestone'));
  } catch (e) {
    console.log('Cobble collect error:', e.message);
  }
}

// 6. Craft stone pickaxe and stone sword
if (lib.count('stone_pickaxe') === 0 && lib.count('cobblestone') >= 3 && lib.count('stick') >= 2) {
  try {
    await lib.craft('stone_pickaxe', 1);
    console.log('Stone pickaxe crafted!');
  } catch (e) {}
}

if (lib.count('stone_sword') === 0 && lib.count('cobblestone') >= 2 && lib.count('stick') >= 1) {
  try {
    await lib.craft('stone_sword', 1);
    console.log('Stone sword crafted!');
  } catch (e) {}
}

// Equip stone_sword
const sword = bot.inventory.items().find(i => i.name === 'stone_sword' || i.name.endsWith('_sword'));
if (sword) {
  await bot.equip(sword, 'hand');
  console.log('Equipped sword:', sword.name);
}

console.log('Gear preparation done! Current inventory:');
for (const item of bot.inventory.items()) {
  console.log(`  ${item.name} x${item.count}`);
}

// 7. Move to Nether Portal at (299.5, 73.0, -53.5)
console.log('Navigating to Nether Portal at (299.5, 73.0, -53.5)...');
try {
  await lib.goTo(299, 72, -52, 1);
} catch (e) {
  console.log('goTo portal near:', e.message);
}

// Step precisely into portal frame (y=73 sill)
console.log('Stepping into portal frame...');
bot.setControlState('jump', true);
await lib.walkTo(299.5, -53.5, 3000);
bot.clearControlStates();

console.log('Standing inside portal frame at:', lib.fmt(bot.entity.position), 'waiting for teleport...');
const t0 = Date.now();
while (!isCancelled() && !String(bot.game.dimension).includes('nether') && (Date.now() - t0 < 15000)) {
  await sleep(500);
}

console.log('Dimension now:', bot.game.dimension, 'pos:', lib.fmt(bot.entity.position));
if (String(bot.game.dimension).includes('nether')) {
  bot.chat(`delta: Back in Nether at ${lib.fmt(bot.entity.position)} armed with ${sword ? sword.name : 'weapon'} & ${lib.count('cobblestone')} cobble! Advancing to Spawner front!`);
}
