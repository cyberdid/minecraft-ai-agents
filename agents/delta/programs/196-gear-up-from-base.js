// programs/196-gear-up-from-base.js
console.log('Delta pos:', lib.fmt(bot.entity.position));
console.log('Health:', bot.health, 'Food:', bot.food);

// 1. Step outside base through door
const doorPos = new Vec3(294, 73, -54);
console.log('Stepping outside through door...');
try {
  await lib.goThroughDoor(doorPos.x, doorPos.y, doorPos.z);
  console.log('Outside at:', lib.fmt(bot.entity.position));
} catch (err) {
  console.log('Door notice:', err.message);
  await lib.goTo(296, 73, -54, 1);
}

// 2. Harvest 6 logs
console.log('Harvesting 6 logs for planks and tools...');
bot.chat('Delta: Harvesting wood and stone for weapons and Nether cobblestone.');
try {
  const wood = await lib.collect('*_log', 6);
  console.log('Wood collected:', JSON.stringify(wood));
} catch (err) {
  console.log('Wood collect error:', err.message);
}

// 3. Craft planks (check exact plank type)
try {
  if (lib.count('birch_log') > 0) {
    await lib.craft('birch_planks', lib.count('birch_log') * 4);
    console.log('Crafted birch planks! Count:', lib.count('birch_planks'));
  }
  if (lib.count('oak_log') > 0) {
    await lib.craft('oak_planks', lib.count('oak_log') * 4);
    console.log('Crafted oak planks! Count:', lib.count('oak_planks'));
  }
  await lib.craft('stick', 8);
  console.log('Crafted sticks! Count:', lib.count('stick'));
  await lib.craft('wooden_pickaxe', 1);
  console.log('Crafted wooden pickaxe!');
} catch (err) {
  console.log('Crafting wooden tools error:', err.message);
}

// 4. Collect 12 stone to get cobblestone
console.log('Mining 12 stone with wooden pickaxe...');
try {
  const stone = await lib.collect('stone', 12);
  console.log('Stone collected:', JSON.stringify(stone));
} catch (err) {
  console.log('Stone collect error:', err.message);
}

// 5. Craft stone pickaxe and stone sword
try {
  if (lib.count('cobblestone') >= 3 && lib.count('stone_pickaxe') === 0) {
    await lib.craft('stone_pickaxe', 1);
    console.log('Crafted stone pickaxe!');
  }
  if (lib.count('cobblestone') >= 2 && lib.count('stone_sword') === 0) {
    await lib.craft('stone_sword', 1);
    console.log('Crafted stone sword!');
  }
} catch (err) {
  console.log('Stone tool crafting error:', err.message);
}

// 6. Mine 30 more cobblestone with stone pickaxe
if (lib.count('stone_pickaxe') > 0) {
  console.log('Mining 30 building cobblestone with stone pickaxe...');
  try {
    const extraCobble = await lib.collect('stone', 30);
    console.log('Building cobblestone mined:', JSON.stringify(extraCobble));
  } catch (err) {
    console.log('Extra stone error:', err.message);
  }
}

// 7. Return to base shelter
console.log('Returning to base shelter...');
try {
  await lib.goThroughDoor(doorPos.x, doorPos.y, doorPos.z);
  console.log('Safely inside base at:', lib.fmt(bot.entity.position));
} catch (err) {
  console.log('Return door error:', err.message);
  await lib.goTo(293, 72, -54, 1);
}

console.log('Final inventory:', JSON.stringify(lib.inv()));
console.log('Final gear:', JSON.stringify(lib.tools()));
bot.chat(`Delta: Armed with stone pickaxe, stone sword, and ${lib.count('cobblestone')} cobblestone! Ready for Nether mountain tunnel.`);
