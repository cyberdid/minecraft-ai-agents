// programs/361-retreat-to-base-and-arm.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health);

bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();

// 1. Immediately sprint to base at (294, 72, -56) to escape witch
console.log('Moving into base shelter at (294, 72, -56)...');
try {
  await lib.goTo(294, 72, -56, 1, { timeoutMs: 8000 });
} catch (e) {
  console.log('goTo note:', e.message);
  await bot.lookAt(new Vec3(294, 72, -56), true);
  bot.setControlState('forward', true);
  bot.setControlState('sprint', true);
  await sleep(2000);
  bot.clearControlStates();
}

console.log('Inside base! Pos:', lib.fmt(bot.entity.position));

// Lock spawn point at bed
try {
  await lib.setSpawn();
  console.log('Spawn point locked at base bed!');
} catch (e) {}

// Check chest at (293, 72, -57)
const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
if (chestBlock) {
  try {
    const chest = await bot.openContainer(chestBlock);
    const items = chest.containerItems();
    console.log(`Chest has ${items.length} items:`);
    for (const item of items) {
      console.log(`  ${item.name} x${item.count}`);
      if (item.name.includes('sword') || item.name.includes('pickaxe') || item.name.includes('shield') || item.name === 'cobblestone' || item.name.includes('cooked') || item.name.includes('planks')) {
        try { await chest.withdraw(item.type, null, item.count); } catch (err) {}
      }
    }
    chest.close();
  } catch (e) {}
}

// Pickup drops inside base
try {
  const drops = await lib.pickup(6);
  console.log('Base drops picked up:', drops);
} catch (e) {}

// 2. Gather wood and quarry cobblestone safely
if (lib.count('*_pickaxe') === 0) {
  console.log('Gathering 1 log for wooden pickaxe...');
  try {
    await lib.collect('*_log', 1);
  } catch (e) {
    console.log('Log collect error:', e.message);
  }
  
  const log = bot.inventory.items().find(i => i.name.endsWith('_log'));
  if (log) {
    try { await lib.craft(log.name.replace('_log', '_planks'), 4); } catch (e) {}
  }
  if (lib.count('stick') < 2) try { await lib.craft('stick', 4); } catch (e) {}
  if (lib.count('*_planks') >= 3) {
    try { await lib.craft('wooden_pickaxe', 1); console.log('Crafted wooden_pickaxe!'); } catch (e) {}
  }
}

// Mine 24 cobblestone from mine shaft at (302, 71, -44)
if (lib.count('*_pickaxe') > 0 && lib.count('cobblestone') < 24) {
  const needed = 24 - lib.count('cobblestone');
  console.log(`Mining ${needed} cobblestone...`);
  try {
    await lib.collect('cobblestone', needed);
    console.log('Cobblestone count:', lib.count('cobblestone'));
  } catch (e) {
    console.log('Mine cobble note:', e.message);
  }
}

// Craft stone tools
if (lib.count('cobblestone') >= 3 && lib.count('stone_pickaxe') === 0) {
  if (lib.count('stick') < 2) try { await lib.craft('stick', 4); } catch (e) {}
  try { await lib.craft('stone_pickaxe', 1); console.log('Crafted stone_pickaxe!'); } catch (e) {}
}

if (lib.count('cobblestone') >= 2 && lib.count('*_sword') === 0) {
  if (lib.count('stick') < 1) try { await lib.craft('stick', 4); } catch (e) {}
  try { await lib.craft('stone_sword', 1); console.log('Crafted stone_sword!'); } catch (e) {}
}

const sword = bot.inventory.items().find(i => i.name.includes('sword'));
if (sword) try { await bot.equip(sword, 'hand'); } catch (e) {}

console.log('Delta inventory:');
for (const item of bot.inventory.items()) {
  console.log(`  ${item.name} x${item.count}`);
}

bot.chat(`delta: Safely rearmed in base! Cobble: ${lib.count('cobblestone')}, Sword: ${lib.count('*_sword')}, HP: ${bot.health}/20.`);
