// programs/477-return-to-base-and-setspawn.js
console.log('=== GAMMA: SPRINT TO BASE & LOCK SPAWN ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health);

bot.chat('gamma: Heading to base (293, 72, -55) from spawn area to lock spawn and gear for Milestone 9!');

// 1. Configure surface movements
const moves = new Movements(bot, mcData);
moves.canDig = true;
moves.allowParkour = true;
bot.pathfinder.setMovements(moves);

// 2. Sprint toward base door
try {
  await bot.pathfinder.goto(new goals.GoalNear(294, 72, -52.5, 1.5));
} catch (e) {
  try {
    await lib.goTo(294, 72, -52.5, 2.0, { timeoutMs: 35000 });
  } catch (e2) {}
}

console.log('Reached outside base house! Pos:', lib.fmt(bot.entity.position));

// 3. Open south door and enter base
try {
  await lib.door(294, 72, -54, true);
  await bot.pathfinder.goto(new goals.GoalNear(294, 72, -55.5, 0.5));
  await lib.door(294, 72, -54, false);
} catch (e) {
  try { await lib.goThroughDoor(294, 72, -54); } catch (e2) {}
}

console.log('Inside base house! Pos:', lib.fmt(bot.entity.position));

// 4. Set spawn on Bed 1 at (294, 72, -55)
try {
  const bedBlock = bot.findBlock({
    matching: b => b && b.name.includes('bed'),
    maxDistance: 6
  });
  if (bedBlock) {
    console.log('Found bed at:', lib.fmt(bedBlock.position));
    await lib.setSpawn();
    bot.chat('gamma: Spawn permanently locked at base bed!');
  }
} catch (e) {
  console.log('Set spawn warning:', e.message);
}

// 5. Equip armor and weapon
try { await lib.equipArmor(); } catch (e) {}
try { await lib.equipWeapon(); } catch (e) {}
const shield = bot.inventory.items().find(i => i.name === 'shield');
if (shield && bot.inventory.slots[45]?.name !== 'shield') {
  try { await bot.equip(shield, 'off-hand'); } catch (e) {}
}

// 6. Inspect Base Chest at (293, 72, -57)
const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
if (chestBlock) {
  const chest = await bot.openContainer(chestBlock);
  console.log('--- BASE CHEST CONTENTS ---');
  for (const item of chest.containerItems()) {
    console.log(`- ${item.name} x${item.count}`);
  }
  chest.close();
}

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  offhand: bot.inventory.slots[45]?.name,
  inv: lib.inv()
};
