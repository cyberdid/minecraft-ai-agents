// programs/362-craft-gear-and-enter-nether.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health);

bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();

// 1. Gather 2 logs
console.log('Finding and collecting 2 logs...');
try {
  await lib.collect('*_log', 2);
  console.log('Logs collected! Log count:', lib.count('*_log'));
} catch (e) {
  console.log('Collect log note:', e.message);
}

// 2. Craft planks and sticks
const logs = bot.inventory.items().filter(i => i.name.endsWith('_log'));
for (const l of logs) {
  try {
    await lib.craft(l.name.replace('_log', '_planks'), l.count * 4);
  } catch (e) {}
}
console.log('Planks count:', lib.count('*_planks'));

if (lib.count('stick') < 2) {
  try {
    await lib.craft('stick', 4);
    console.log('Sticks crafted!');
  } catch (e) {}
}

// 3. Craft wooden pickaxe
if (lib.count('*_pickaxe') === 0 && lib.count('*_planks') >= 3) {
  console.log('Crafting wooden_pickaxe...');
  try {
    await lib.craft('wooden_pickaxe', 1);
    console.log('Wooden pickaxe crafted!');
  } catch (e) {
    console.log('Craft wood pick note:', e.message);
  }
}

const wPick = bot.inventory.items().find(i => i.name.includes('pickaxe'));
if (wPick) try { await bot.equip(wPick, 'hand'); } catch (e) {}

// 4. Quarry 20 cobblestone
if (lib.count('*_pickaxe') > 0 && lib.count('cobblestone') < 20) {
  const needed = 20 - lib.count('cobblestone');
  console.log(`Mining ${needed} cobblestone...`);
  try {
    await lib.collect('cobblestone', needed);
    console.log('Cobblestone count:', lib.count('cobblestone'));
  } catch (e) {
    console.log('Collect cobble note:', e.message);
  }
}

// 5. Craft stone tools: stone pickaxe and stone sword
if (lib.count('cobblestone') >= 3 && lib.count('stone_pickaxe') === 0) {
  if (lib.count('stick') < 2) try { await lib.craft('stick', 4); } catch (e) {}
  try {
    await lib.craft('stone_pickaxe', 1);
    console.log('Stone pickaxe crafted!');
  } catch (e) {}
}

if (lib.count('cobblestone') >= 2 && lib.count('*_sword') === 0) {
  if (lib.count('stick') < 1) try { await lib.craft('stick', 4); } catch (e) {}
  try {
    await lib.craft('stone_sword', 1);
    console.log('Stone sword crafted!');
  } catch (e) {}
}

const sword = bot.inventory.items().find(i => i.name.includes('sword'));
if (sword) try { await bot.equip(sword, 'hand'); } catch (e) {}

console.log('Delta armed inventory:');
for (const item of bot.inventory.items()) {
  console.log(`  ${item.name} x${item.count}`);
}

// 6. Enter Nether portal at (299.5, 73.0, -54.0)
console.log('Moving into Nether portal at (299.5, 73.0, -54.0)...');
try {
  await lib.goTo(299, 73, -54, 0.5, { timeoutMs: 12000 });
} catch (e) {
  await bot.lookAt(new Vec3(299.5, 73.0, -54.0), true);
  bot.setControlState('forward', true);
  await sleep(2000);
  bot.setControlState('forward', false);
}

// Await Nether dimension change
console.log('Awaiting Nether dimension change...');
const portalStart = Date.now();
while (!isCancelled() && bot.game.dimension !== 'the_nether' && Date.now() - portalStart < 15000) {
  await sleep(250);
}

console.log('Current dimension:', bot.game.dimension, 'pos:', lib.fmt(bot.entity.position));
if (bot.game.dimension !== 'the_nether') {
  console.log('Nether transit incomplete, retry.');
  return;
}

bot.chat(`delta: Armed with stone sword & ${lib.count('cobblestone')} cobble! Advancing to Spawner Balcony!`);
