// programs/785-unite-at-fortress-bunker.js
console.log('=== Program 785: Unite at Fortress Workshop Bunker & Coordinate Barter ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

bot.clearControlStates();
bot.pathfinder.stop();

// Ensure golden_boots on feet and shield in offhand
if (bot.inventory.slots[8]?.name !== 'golden_boots') {
  const gb = bot.inventory.items().find(i => i.name === 'golden_boots');
  if (gb) await bot.equip(gb, 'feet');
}
if (bot.inventory.slots[45]?.name !== 'shield') {
  const sh = bot.inventory.items().find(i => i.name === 'shield');
  if (sh) await bot.equip(sh, 'off-hand');
}
bot.activateItem(true); // Raise shield

// Equip iron weapon
const sword = bot.inventory.items().find(i => i.name === 'iron_sword') || bot.inventory.items().find(i => i.name.includes('sword'));
if (sword) await bot.equip(sword, 'hand');

// Walk South along covered tunnel to Fortress Workshop Bunker (44, 65, -128)
const tunnelWps = [
  new Vec3(41, 65, -172),
  new Vec3(44, 65, -165),
  new Vec3(44, 65, -155),
  new Vec3(44, 65, -145),
  new Vec3(44, 65, -128)
];

for (const wp of tunnelWps) {
  if (isCancelled()) break;
  console.log(`Walking to bunker WP: ${lib.fmt(wp)}...`);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 1.8));
  } catch (e) {
    try {
      await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2.5));
    } catch (e2) {}
  }
}

console.log('Arrived at Fortress Workshop Bunker! Pos:', lib.fmt(bot.entity.position));

// Vacuum any dropped items from teammates
await lib.pickup(6.0);
console.log(`Gold ingots on Beta: ${lib.count('gold_ingot')}, nuggets: ${lib.count('gold_nugget')}`);
console.log(`Ender pearls on Beta: ${lib.count('ender_pearl')}/12`);

// Scan for teammates and report
const nearbyTeammates = Object.values(bot.entities).filter(e =>
  e.type === 'player' && e.username !== bot.username && bot.entity.position.distanceTo(e.position) <= 20
);

console.log(`Teammates inside/near bunker: ${nearbyTeammates.length}`);
for (const tm of nearbyTeammates) {
  console.log(` - ${tm.username} at ${lib.fmt(tm.position)}, dist: ${bot.entity.position.distanceTo(tm.position).toFixed(1)}m`);
}

bot.chat(`Beta: United at Fortress Bunker (44, 65, -128)! Two Piglins confirmed at (18, 57, -176)! Pool gold ingots here to barter!`);

bot.activateItem(true); // Keep shield raised

console.log('=== Program 785 Summary ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('HP:', bot.health, 'Food:', bot.food);
console.log('Feet slot:', bot.inventory.slots[8]?.name);
console.log('Inventory:', lib.inv());

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  golden_boots: bot.inventory.slots[8]?.name === 'golden_boots',
  ender_pearls: lib.count('ender_pearl'),
  gold_ingots: lib.count('gold_ingot'),
  teammates_at_bunker: nearbyTeammates.length
};
