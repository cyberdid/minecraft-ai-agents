// programs/380-rearm-stone-and-transit-nether.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'food:', bot.food);

// 1. Mine 24 cobblestone from the stone hillside near (301..310, 70..72, -60..-70)
const stoneIds = [mcData.blocksByName.stone?.id, mcData.blocksByName.cobblestone?.id, mcData.blocksByName.andesite?.id, mcData.blocksByName.diorite?.id].filter(Boolean);

console.log('Mining stone for tools and building blocks...');
let mined = 0;
while (!isCancelled() && lib.count('cobblestone') < 24 && mined < 30) {
  const blocks = bot.findBlocks({
    matching: stoneIds,
    maxDistance: 16,
    count: 10
  });
  
  let target = null;
  for (const p of blocks) {
    // Only mine outside base (x >= 300 or z < -60)
    if (p.x >= 299 || p.z < -60 || p.z > -40) {
      target = p;
      break;
    }
  }
  
  if (!target) {
    console.log('No stone target found outside base, moving to (302, 71, -63)...');
    try { await lib.goTo(302, 71, -63, 1, { timeoutMs: 5000 }); } catch (e) {}
    continue;
  }
  
  const b = bot.blockAt(target);
  if (b && bot.canDigBlock(b)) {
    try {
      await bot.dig(b);
      mined++;
    } catch (e) {
      console.log(`Dig error at ${lib.fmt(target)}: ${e.message}`);
    }
  }
  await lib.pickup(4);
}

console.log(`Mined ${mined} stone blocks. Cobble count: ${lib.count('cobblestone')}`);

// 2. Return to crafting table inside base (295, 72, -56)
console.log('Returning to base crafting table...');
try {
  await lib.goTo(294, 72, -56, 1, { timeoutMs: 8000 });
} catch (e) {
  console.log('Go to crafting table note:', e.message);
}

// Craft planks & sticks
const logItem = bot.inventory.items().find(i => i.name.endsWith('_log'));
if (logItem) {
  try { await lib.craft(logItem.name.replace('_log', '_planks'), 4); } catch (e) {}
}
if (lib.count('stick') < 4) {
  try { await lib.craft('stick', 4); } catch (e) {}
}

// Craft stone_sword
if (lib.count('cobblestone') >= 2 && lib.count('stone_sword') === 0) {
  try {
    await lib.craft('stone_sword', 1);
    console.log('Crafted stone_sword!');
  } catch (e) {
    console.log('Craft sword note:', e.message);
  }
}

// Craft spare stone_pickaxe if needed
if (lib.count('cobblestone') >= 3 && lib.count('stone_pickaxe') === 0) {
  try {
    await lib.craft('stone_pickaxe', 1);
    console.log('Crafted spare stone_pickaxe!');
  } catch (e) {
    console.log('Craft pickaxe note:', e.message);
  }
}

// Equip stone_sword
const sword = bot.inventory.items().find(i => i.name.includes('sword'));
if (sword) await bot.equip(sword, 'hand');

console.log('Rearmed inventory:');
for (const item of bot.inventory.items()) {
  console.log(`  ${item.name} x${item.count}`);
}

bot.chat(`delta: Rearmed with stone sword & ${lib.count('cobblestone')} cobble! Entering Nether to reinforce Spawner Pillbox!`);

// 3. Enter Nether portal at (299.5, 73.0, -54.0)
console.log('Entering Nether portal at (299.5, 73.0, -54.0)...');
try {
  await lib.goTo(299, 73, -54, 0.5, { timeoutMs: 8000 });
} catch (e) {
  await bot.lookAt(new Vec3(299.5, 73.0, -54.0), true);
  bot.setControlState('forward', true);
  await sleep(1500);
  bot.setControlState('forward', false);
}

// Await Nether dimension change
console.log('Awaiting Nether dimension change...');
const portalStart = Date.now();
while (!isCancelled() && bot.game.dimension !== 'the_nether' && Date.now() - portalStart < 15000) {
  await sleep(250);
}

console.log('Current dimension:', bot.game.dimension, 'pos:', lib.fmt(bot.entity.position));
