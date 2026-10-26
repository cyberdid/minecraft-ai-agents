// programs/203-harvest-wood-craft-tools-mine-cobble.js
console.log('Delta pos:', lib.fmt(bot.entity.position));
console.log('Health:', bot.health, 'Food:', bot.food);

// 1. Step outside base door
const doorPos = new Vec3(294, 73, -54);
console.log('Stepping outside door...');
try {
  await lib.goThroughDoor(doorPos.x, doorPos.y, doorPos.z);
} catch (e) {
  console.log('Door notice:', e.message);
  await lib.goTo(296, 73, -54, 1);
}

// 2. Harvest 4 logs
console.log('Harvesting 4 logs...');
bot.chat('Delta: Harvesting wood and mining cobblestone for Nether mountain expedition.');
try {
  const wood = await lib.collect('*_log', 4);
  console.log('Wood collected:', JSON.stringify(wood));
} catch (e) {
  console.log('Log collect error:', e.message);
}

// 3. Craft planks, sticks, wooden pickaxe
try {
  if (lib.count('birch_log') > 0) await lib.craft('birch_planks', lib.count('birch_log') * 4);
  if (lib.count('oak_log') > 0) await lib.craft('oak_planks', lib.count('oak_log') * 4);
  await lib.craft('stick', 8);
  await lib.craft('wooden_pickaxe', 1);
  console.log('Crafted wooden pickaxe!');
} catch (e) {
  console.log('Wood craft error:', e.message);
}

// 4. Mine 8 stone with wooden pickaxe
console.log('Mining 8 stone...');
try {
  const stone = await lib.collect('stone', 8);
  console.log('Stone collected:', JSON.stringify(stone));
} catch (e) {
  console.log('Stone collect error:', e.message);
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
} catch (e) {
  console.log('Stone craft error:', e.message);
}

// 6. Mine 35 cobblestone with stone pickaxe
if (lib.count('stone_pickaxe') > 0) {
  console.log('Mining 35 building cobblestone with stone pickaxe...');
  try {
    const extraCobble = await lib.collect('stone', 35);
    console.log('Cobblestone collected:', JSON.stringify(extraCobble));
  } catch (e) {
    console.log('Extra stone error:', e.message);
  }
}

// 7. Check for passive animals nearby for food
for (const id in bot.entities) {
  const e = bot.entities[id];
  if (e && ['cow', 'pig', 'sheep'].includes(e.name)) {
    const dist = bot.entity.position.distanceTo(e.position);
    if (dist < 20) {
      console.log(`Hunting nearby ${e.name} at dist ${dist.toFixed(1)}m...`);
      try {
        await lib.hunt(e.name, 1);
      } catch (err) {}
      break;
    }
  }
}

// 8. Return inside base shelter
console.log('Returning inside base shelter...');
try {
  await lib.goThroughDoor(doorPos.x, doorPos.y, doorPos.z);
} catch (e) {
  console.log('Return door error:', e.message);
  await lib.goTo(293, 72, -54, 1);
}

console.log('Final pos:', lib.fmt(bot.entity.position));
console.log('Final inventory:', JSON.stringify(lib.inv()));
console.log('Final tools:', JSON.stringify(lib.tools()));
bot.chat(`Delta: Armed with stone pickaxe, sword, and ${lib.count('cobblestone')} cobblestone! Ready for Nether advance.`);
