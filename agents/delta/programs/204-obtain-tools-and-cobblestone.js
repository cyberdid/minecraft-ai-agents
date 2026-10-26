// programs/204-obtain-tools-and-cobblestone.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('Health:', bot.health, 'Food:', bot.food);
console.log('Inventory:', JSON.stringify(lib.inv()));

bot.chat('delta: Obtaining stone pickaxe, stone sword, and 32 cobblestone via lib.obtain...');

// 1. Obtain stone_pickaxe
console.log('Obtaining stone_pickaxe...');
try {
  const resPick = await lib.obtain('stone_pickaxe', 1);
  console.log('Obtained stone_pickaxe:', JSON.stringify(resPick));
} catch (err) {
  console.log('obtain stone_pickaxe error:', err.message);
}

// 2. Obtain stone_sword
console.log('Obtaining stone_sword...');
try {
  const resSword = await lib.obtain('stone_sword', 1);
  console.log('Obtained stone_sword:', JSON.stringify(resSword));
} catch (err) {
  console.log('obtain stone_sword error:', err.message);
}

// 3. Obtain 32 cobblestone
console.log('Obtaining 32 cobblestone for Nether fortifications...');
try {
  const resCobble = await lib.obtain('cobblestone', 32);
  console.log('Obtained cobblestone:', JSON.stringify(resCobble));
} catch (err) {
  console.log('obtain cobblestone error:', err.message);
}

// 4. Return to base area
const doorPos = new Vec3(294, 73, -54);
console.log('Returning to base entrance...');
try {
  await lib.goTo(doorPos.x, doorPos.y, doorPos.z, 2);
} catch (e) {
  console.log('goTo base notice:', e.message);
}

console.log('Final pos:', lib.fmt(bot.entity.position));
console.log('Final inventory:', JSON.stringify(lib.inv()));
console.log('Final tools:', JSON.stringify(lib.tools()));
bot.chat(`delta: Equipped with stone pickaxe, sword, and ${lib.count('cobblestone')} cobblestone! Ready for Nether advance.`);
