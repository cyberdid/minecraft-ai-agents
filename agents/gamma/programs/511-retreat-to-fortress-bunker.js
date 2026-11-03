// programs/511-retreat-to-fortress-bunker.js
console.log('=== GAMMA: RETREAT TO FORTRESS WORKSHOP BUNKER (44, 65, -127) ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);

bot.chat('gamma: HP low (5.1/20), stepping 17m back into fortified Fortress Workshop Bunker at (44, 65, -127) for 100% blast cover!');

const moves = new Movements(bot, mcData);
if (mcData.blocksByName.fire) moves.blocksToAvoid.add(mcData.blocksByName.fire.id);
if (mcData.blocksByName.soul_fire) moves.blocksToAvoid.add(mcData.blocksByName.soul_fire.id);
if (mcData.blocksByName.lava) moves.blocksToAvoid.add(mcData.blocksByName.lava.id);
moves.canDig = false;
moves.allowParkour = false;
bot.pathfinder.setMovements(moves);

// South waypoints along enclosed high ridge: -140 -> -135 -> -128
const waypoints = [
  new Vec3(44.5, 65.0, -140.0),
  new Vec3(44.5, 65.0, -135.0),
  new Vec3(44.5, 65.0, -130.0),
  new Vec3(44.5, 65.0, -128.0)
];

for (const wp of waypoints) {
  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 0.8));
    console.log(`Reached ${lib.fmt(bot.entity.position)}`);
  } catch (e) {
    try { await lib.goTo(wp.x, wp.y, wp.z, 1.2, { timeoutMs: 4000 }); } catch (e2) {}
  }
}

console.log('Inside Fortress Workshop Bunker! Final pos:', lib.fmt(bot.entity.position));

// Vacuum any dropped food or items in bunker
await lib.pickup(4.0);

// Check if any food was picked up
const foodItem = bot.inventory.items().find(i =>
  i.name.includes('cooked_') || i.name === 'bread' || i.name === 'apple' || i.name === 'baked_potato'
);
if (foodItem) {
  try {
    await lib.eat();
    console.log(`Ate food! New Food: ${bot.food}, HP: ${bot.health}`);
  } catch (e) {}
}

// Check nearby entities
const nearby = Object.values(bot.entities).filter(e =>
  e && e.isValid && bot.entity.position.distanceTo(e.position) <= 12
).map(e => `${e.name || e.username} at ${lib.fmt(e.position)}`);
console.log('Entities nearby in bunker:', nearby.join('; ') || 'none');

bot.chat(`gamma: Secure in Fortress Bunker at ${lib.fmt(bot.entity.position)}. HP: ${bot.health.toFixed(1)}, Food: ${bot.food}/20. Boots: golden_boots (worn), Ingots: ${lib.count('gold_ingot')}`);

return {
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  inv: lib.inv()
};
