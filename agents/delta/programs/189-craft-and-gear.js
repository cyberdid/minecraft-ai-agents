// programs/189-craft-and-gear.js
console.log('Delta pos:', lib.fmt(bot.entity.position));
console.log('Inventory before:', JSON.stringify(lib.inv()));

// 1. Craft birch_planks, sticks, and wooden pickaxe
try {
  await lib.craft('birch_planks', 16);
  console.log('Crafted birch planks! Total:', lib.count('birch_planks'));
  await lib.craft('stick', 8);
  console.log('Crafted sticks! Total:', lib.count('stick'));
  await lib.craft('wooden_pickaxe', 1);
  console.log('Crafted wooden pickaxe!');
} catch (err) {
  console.log('Crafting error:', err.message);
}

// 2. Go outside through door to mine stone
const doorPos = new Vec3(294, 73, -54);
console.log('Stepping outside to mine stone...');
try {
  await lib.goThroughDoor(doorPos.x, doorPos.y, doorPos.z);
  console.log('Outside at:', lib.fmt(bot.entity.position));
} catch (err) {
  console.log('Door error:', err.message);
  await lib.goTo(296, 73, -54, 1);
}

// 3. Collect stone to get cobblestone
console.log('Mining stone with wooden pickaxe...');
try {
  const mined = await lib.collect('stone', 12);
  console.log('Stone mined:', JSON.stringify(mined));
} catch (err) {
  console.log('Collect stone error:', err.message);
}

// 4. Return to crafting table inside base to craft stone tools
try {
  await lib.goThroughDoor(doorPos.x, doorPos.y, doorPos.z);
  console.log('Inside base at:', lib.fmt(bot.entity.position));
} catch (err) {
  console.log('Return door error:', err.message);
  await lib.goTo(293, 72, -54, 1);
}

// 5. Craft stone pickaxe, stone sword, stone axe
try {
  if (lib.count('cobblestone') >= 3 && lib.count('stone_pickaxe') === 0) {
    await lib.craft('stone_pickaxe', 1);
    console.log('Crafted stone pickaxe!');
  }
  if (lib.count('cobblestone') >= 2 && lib.count('stone_sword') === 0) {
    await lib.craft('stone_sword', 1);
    console.log('Crafted stone sword!');
  }
  if (lib.count('cobblestone') >= 3 && lib.count('stone_axe') === 0) {
    await lib.craft('stone_axe', 1);
    console.log('Crafted stone axe!');
  }
} catch (err) {
  console.log('Stone tool crafting error:', err.message);
}

// 6. Mine 24 more cobblestone for building in Nether
if (lib.count('stone_pickaxe') > 0) {
  try {
    await lib.goThroughDoor(doorPos.x, doorPos.y, doorPos.z);
    console.log('Mining 24 building cobblestone...');
    const cobble = await lib.collect('stone', 24);
    console.log('Building cobble mined:', JSON.stringify(cobble));
    await lib.goThroughDoor(doorPos.x, doorPos.y, doorPos.z);
  } catch (err) {
    console.log('Building stone error:', err.message);
  }
}

// 7. Check inventory
console.log('Final inventory:', JSON.stringify(lib.inv()));
console.log('Gear:', JSON.stringify(lib.tools()));

// 8. Check players
for (const name in bot.players) {
  const p = bot.players[name];
  if (p && p.entity && p !== bot.entity) {
    console.log(`Player ${name} at ${lib.fmt(p.entity.position)}`);
  }
}

bot.chat(`Delta: Armed with stone pickaxe, stone sword, and ${lib.count('cobblestone')} cobblestone!`);
