// programs/548-sprint-to-base-camp.js
console.log('=== Step: Sprint 87m to Base Camp, Enter Shelter, Set Spawn ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

bot.clearControlStates();
bot.pathfinder.stop();
await sleep(100);

const waypoints = [
  new Vec3(245, 66, -45),
  new Vec3(285, 72, -54)
];

bot.chat('beta: Sprinting 87m to Base Camp...');

for (const wp of waypoints) {
  if (isCancelled()) break;
  console.log(`Running to ${lib.fmt(wp)}...`);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2));
    console.log(`Reached ${lib.fmt(wp)}: ${lib.fmt(bot.entity.position)}`);
  } catch (err) {
    console.log(`Path note at ${lib.fmt(wp)}, sprinting direct:`, err.message);
    await bot.lookAt(new Vec3(wp.x, bot.entity.position.y, wp.z), true);
    bot.setControlState('forward', true);
    bot.setControlState('sprint', true);
    bot.setControlState('jump', true);
    await sleep(2500);
    bot.clearControlStates();
  }
}

console.log('Near Base Camp at:', lib.fmt(bot.entity.position));

// Enter base through door at (294, 72, -54)
const doorPos = new Vec3(294, 72, -54);
const doorBlock = bot.blockAt(doorPos) || bot.findBlock({ matching: b => b.name.includes('door'), maxDistance: 6 });
if (doorBlock) {
  console.log('Entering base shelter via door...');
  try {
    await lib.goThroughDoor(doorBlock.position.x, doorBlock.position.y, doorBlock.position.z);
    console.log('Inside base at:', lib.fmt(bot.entity.position));
  } catch (e) {
    console.log('goThroughDoor error:', e.message);
    try { await lib.goTo(292, 72, -56, 1); } catch (e2) {}
  }
} else {
  try { await lib.goTo(292, 72, -56, 1); } catch (e) {}
}

// Ensure door is closed
if (doorBlock) {
  const d = bot.blockAt(doorBlock.position);
  if (d && d._properties && d._properties.open) {
    try { await lib.door(doorBlock.position.x, doorBlock.position.y, doorBlock.position.z, false); } catch (e) {}
  }
}

// Lock bed spawn point
try {
  await lib.setSpawn();
  console.log('SUCCESS: Bed spawn point locked!');
  bot.chat('beta: Inside Base Camp! Bed spawn set.');
} catch (e) {
  console.log('setSpawn note:', e.message);
}

// Inspect base chest at (293, 72, -57)
const chests = bot.findBlocks({ matching: mcData.blocksByName.chest.id, maxDistance: 6, count: 5 });
for (const cp of chests) {
  try {
    const c = await bot.openChest(bot.blockAt(cp));
    const items = c.items();
    console.log(`Chest at ${lib.fmt(cp)}:`, items.map(i => `${i.name}x${i.count}`).join(', ') || 'empty');
    for (const it of items) {
      if (['cooked_porkchop', 'stone_pickaxe', 'iron_pickaxe', 'stone_sword', 'iron_sword', 'cobblestone', 'shield', 'oak_log', 'oak_planks', 'stick'].includes(it.name)) {
        console.log(`Withdrawing ${it.name} x${it.count}...`);
        try { await c.withdraw(it.type, null, it.count); } catch (e) {}
      }
    }
    await c.close();
  } catch (e) {}
}

// Eat if we got cooked porkchop
const food = bot.inventory.items().find(i => i.name.startsWith('cooked_') || i.name === 'bread');
if (food && bot.food < 20) {
  try {
    await bot.equip(food, 'hand');
    await bot.consume();
    console.log('Ate food! Food level:', bot.food);
  } catch (e) {}
}

console.log('Beta inv:', bot.inventory.items().map(i => `${i.name}x${i.count}`).join(', ') || 'empty');
console.log('Final Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);

return {
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  inv: bot.inventory.items().map(i => `${i.name}x${i.count}`).join(', ')
};
