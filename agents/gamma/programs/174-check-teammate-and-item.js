// programs/174-check-teammate-and-item.js
console.log('--- CHECK NEARBY PLAYER AND DROPPED ITEM ---');
console.log('Pos:', lib.fmt(bot.entity.position));

// 1. Identify player in base
for (const p of Object.values(bot.players)) {
  if (p.username !== bot.username) {
    const ent = p.entity;
    console.log(`Player ${p.username}: ${ent ? `${lib.fmt(ent.position)} (dist: ${bot.entity.position.distanceTo(ent.position).toFixed(1)}m)` : 'far'}`);
  }
}

// 2. Ask teammate in chat for food if they have any
bot.chat('team: gamma is at 0 food, 12 HP! Does anyone have spare food or wheat/apples at base?');

// 3. Inspect and pick up dropped item at (291, 70, -78)
const itemEnt = Object.values(bot.entities).find(e => e.name === 'item' && e.position.distanceTo(bot.entity.position) < 35);
if (itemEnt) {
  console.log(`Found item entity at ${lib.fmt(itemEnt.position)}! Moving to pick up...`);
  try {
    await lib.goTo(itemEnt.position.x, itemEnt.position.y, itemEnt.position.z, 1, { timeoutMs: 15000 });
    await lib.pickup(5);
    console.log('Item picked up! Inventory now:', JSON.stringify(lib.inv()));
  } catch (e) {
    console.log('Item pickup note:', e.message);
  }
}

// 4. Return to base if we went outside
console.log('Returning inside base...');
try {
  await lib.goTo(294, 72, -53, 1);
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {}

console.log('Final inv:', JSON.stringify(lib.inv()));
console.log('Final HP:', bot.health, 'Food:', bot.food);
