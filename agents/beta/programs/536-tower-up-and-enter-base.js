// programs/536-tower-up-and-enter-base.js
console.log('=== Step: Tower up from Trench & Enter Base Shelter ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

bot.clearControlStates();
bot.pathfinder.stop();
await sleep(100);

// Equip dirt
const dirt = bot.inventory.items().find(i => i.name === 'dirt');
if (dirt) {
  await bot.equip(dirt, 'hand');
  console.log('Equipped dirt, count:', dirt.count);
}

// Tower up 4 blocks if y < 70
while (bot.entity.position.y < 70.5 && !isCancelled()) {
  const currentY = bot.entity.position.y;
  console.log(`Current Y=${currentY.toFixed(1)}, towering up...`);
  
  const refBlock = bot.blockAt(bot.entity.position.floored().offset(0, -1, 0));
  if (refBlock) {
    try {
      bot.setControlState('jump', true);
      await sleep(250);
      await bot.placeBlock(refBlock, new Vec3(0, 1, 0));
      bot.setControlState('jump', false);
      await sleep(250);
    } catch (e) {
      console.log('Tower place note:', e.message);
      bot.setControlState('jump', false);
      break;
    }
  } else {
    break;
  }
}

bot.clearControlStates();
console.log('Pos after towering:', lib.fmt(bot.entity.position));

// Walk to Base Camp door at (294, 72, -54)
const doorPos = new Vec3(294, 72, -54);
console.log(`Pathfinding to base door at ${lib.fmt(doorPos)}...`);

try {
  await lib.goTo(doorPos.x, doorPos.y, doorPos.z, 1.5, { dig: true });
} catch (e) {
  console.log('goTo door note:', e.message);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(doorPos.x, doorPos.y, doorPos.z, 2));
  } catch (e2) {
    console.log('pathfinder to door note:', e2.message);
  }
}

console.log('Near door at:', lib.fmt(bot.entity.position));

// Enter through door
const doorBlock = bot.blockAt(doorPos) || bot.findBlock({ matching: b => b.name.includes('door'), maxDistance: 5 });
if (doorBlock) {
  console.log('Entering base door...');
  try {
    await lib.goThroughDoor(doorBlock.position.x, doorBlock.position.y, doorBlock.position.z);
    console.log('Inside base at:', lib.fmt(bot.entity.position));
  } catch (e) {
    console.log('goThroughDoor error:', e.message);
    try { await lib.goTo(292, 72, -56, 1); } catch (e2) {}
  }
}

// Lock spawn point at bed
try {
  await lib.setSpawn();
  console.log('SUCCESS: Bed spawn point locked!');
} catch (e) {
  console.log('setSpawn note:', e.message);
}

// Check chests for gear from teammates
const chests = bot.findBlocks({ matching: mcData.blocksByName.chest.id, maxDistance: 6, count: 5 });
for (const cp of chests) {
  try {
    const cBlock = bot.blockAt(cp);
    const chest = await bot.openChest(cBlock);
    const items = chest.items();
    console.log(`Chest at ${lib.fmt(cp)}:`, items.map(i => `${i.name}x${i.count}`).join(', ') || 'empty');
    for (const it of items) {
      if (['stone_pickaxe', 'iron_pickaxe', 'stone_sword', 'iron_sword', 'shield', 'cobblestone', 'cooked_beef', 'bread'].includes(it.name)) {
        console.log(`Withdrawing ${it.name} x${it.count}...`);
        try { await chest.withdraw(it.type, null, it.count); } catch (e) {}
      }
    }
    await chest.close();
  } catch (e) {}
}

// Check teammates in base
for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity && name !== 'beta') {
    const d = bot.entity.position.distanceTo(p.entity.position);
    console.log(`Teammate ${name} at ${lib.fmt(p.entity.position)} (dist ${d.toFixed(1)}m)`);
  }
}

bot.chat(`beta: Safely back inside Base Camp (${lib.fmt(bot.entity.position)})! Ready to sleep at dusk and gear up.`);
console.log('Time of day:', bot.time.timeOfDay, 'Seconds until night:', lib.time().secondsUntilNight);

return {
  pos: bot.entity.position,
  hp: bot.health,
  timeOfDay: bot.time.timeOfDay
};
