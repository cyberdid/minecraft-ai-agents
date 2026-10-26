// programs/188-gather-wood-and-stone.js
console.log('Delta pos:', lib.fmt(bot.entity.position));
console.log('Time info:', JSON.stringify(lib.time()));

// 1. Go through door to outside
const doorPos = new Vec3(294, 73, -54);
console.log('Going outside through door...');
try {
  await lib.goThroughDoor(doorPos.x, doorPos.y, doorPos.z);
  console.log('Outside at:', lib.fmt(bot.entity.position));
} catch (err) {
  console.log('Door error:', err.message);
  await lib.goTo(296, 73, -54, 1);
}

// 2. Collect logs (6 logs)
console.log('Collecting logs...');
bot.chat('Delta: Harvesting wood and stone outside base for tools and Nether building blocks.');
try {
  const woodGained = await lib.collect('*_log', 6);
  console.log('Wood gained:', JSON.stringify(woodGained));
} catch (err) {
  console.log('Log collect error:', err.message);
}

// 3. Craft basic wooden tools if needed
const logCount = lib.count('*_log');
console.log('Total logs:', logCount);
if (logCount > 0 && lib.count('stone_pickaxe') === 0) {
  try {
    await lib.craft('*_planks', 12);
    await lib.craft('stick', 4);
    if (lib.count('wooden_pickaxe') === 0 && lib.count('stone_pickaxe') === 0) {
      await lib.craft('wooden_pickaxe', 1);
      console.log('Crafted wooden pickaxe!');
    }
  } catch (err) {
    console.log('Crafting wooden tools error:', err.message);
  }
}

// 4. Collect cobblestone (16 cobblestone)
console.log('Collecting stone/cobblestone...');
try {
  const stoneGained = await lib.collect('stone', 12);
  console.log('Stone gained:', JSON.stringify(stoneGained));
} catch (err) {
  console.log('Stone collect error:', err.message);
}

// 5. Craft stone tools
try {
  if (lib.count('stone_pickaxe') === 0 && lib.count('cobblestone') >= 3) {
    await lib.craft('stone_pickaxe', 1);
    console.log('Crafted stone pickaxe!');
  }
  if (lib.count('stone_sword') === 0 && lib.count('cobblestone') >= 2) {
    await lib.craft('stone_sword', 1);
    console.log('Crafted stone sword!');
  }
  if (lib.count('stone_axe') === 0 && lib.count('cobblestone') >= 3) {
    await lib.craft('stone_axe', 1);
    console.log('Crafted stone axe!');
  }
} catch (err) {
  console.log('Crafting stone tools error:', err.message);
}

// 6. Collect more cobblestone with stone pickaxe for building in Nether
if (lib.count('stone_pickaxe') > 0) {
  try {
    console.log('Mining building cobblestone...');
    await lib.collect('stone', 16);
  } catch (err) {
    console.log('Mining extra stone error:', err.message);
  }
}

// 7. Return to base
console.log('Returning to base shelter...');
try {
  await lib.goThroughDoor(doorPos.x, doorPos.y, doorPos.z);
  console.log('Returned inside base at:', lib.fmt(bot.entity.position));
} catch (err) {
  console.log('Return door error:', err.message);
  await lib.goTo(293, 72, -54, 1);
}

console.log('Final inventory:', JSON.stringify(lib.inv()));
bot.chat('Delta: Armed with stone tools & ' + lib.count('cobblestone') + ' cobble. Ready for next step!');
