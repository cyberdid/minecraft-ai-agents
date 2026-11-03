// programs/779-equip-boots-and-bunker-piglin.js
console.log('=== Program 779: Equip Golden Boots & Return to Tunnel Piglin ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

bot.clearControlStates();
bot.pathfinder.stop();

// Step 1: Equip golden_boots into feet slot IMMEDIATELY
const gb = bot.inventory.items().find(i => i.name === 'golden_boots');
if (gb) {
  console.log('Equipping golden_boots into feet slot...');
  await bot.equip(gb, 'feet');
  console.log('Equipped golden_boots! Feet slot:', bot.inventory.slots[8]?.name);
}

// Raise offhand shield
if (bot.inventory.slots[45]?.name !== 'shield') {
  const sh = bot.inventory.items().find(i => i.name === 'shield');
  if (sh) await bot.equip(sh, 'off-hand');
}
bot.activateItem(true); // Raise shield against Blazes

// Step 2: Step South into covered tunnel away from Blaze spawner to (44, 65, -145)
const tunnelWaypoints = [
  new Vec3(44, 65, -169),
  new Vec3(44, 65, -160),
  new Vec3(44, 65, -145)
];

for (const wp of tunnelWaypoints) {
  if (isCancelled()) break;
  console.log(`Walking South along covered tunnel to ${lib.fmt(wp)}...`);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 1.8));
  } catch (e) {
    try {
      await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2.5));
    } catch (e2) {}
  }
}

// Step 3: Vacuum drops at (46, 65, -143) from previous barter
console.log('Vacuuming items at barter location (46, 65, -143)...');
await lib.pickup(8.0);

const pearls = lib.count('ender_pearl');
console.log(`Ender Pearls currently on Beta: ${pearls}`);
if (pearls > 0) {
  bot.chat(`Beta: SECURED ${pearls} ENDER PEARLS FOR MILESTONE 9!`);
}

// Step 4: Scan for Piglins and teammates nearby
const nearbyMobs = Object.values(bot.entities).filter(e =>
  e.isValid && bot.entity.position.distanceTo(e.position) <= 24
);

const piglins = nearbyMobs.filter(e => e.name === 'piglin');
const teammates = nearbyMobs.filter(e => e.type === 'player' && e.username !== bot.username);

console.log(`At covered tunnel (44, 65, -145): Piglins: ${piglins.length}, Teammates: ${teammates.length}`);
for (const pig of piglins) {
  console.log(`Piglin at ${lib.fmt(pig.position)}, dist: ${bot.entity.position.distanceTo(pig.position).toFixed(1)}m`);
}
for (const tm of teammates) {
  console.log(`Teammate ${tm.username} at ${lib.fmt(tm.position)}, dist: ${bot.entity.position.distanceTo(tm.position).toFixed(1)}m`);
}

bot.chat(`Beta: Safe inside covered tunnel (44, 65, -145) with Piglin nearby! Gamma/Alpha, bring the 5 gold ingots here to barter!`);

// Step 5: Check if Beta has any gold ingots or nuggets to barter
if (lib.count('gold_ingot') > 0 && piglins.length > 0) {
  const piglin = piglins[0];
  console.log('Bartering remaining gold ingot with Piglin...');
  try {
    await bot.lookAt(piglin.position.offset(0, 1.2, 0), true);
    await bot.toss(mcData.itemsByName.gold_ingot.id, null, 1);
    await sleep(8500);
    await lib.pickup(5.0);
    console.log(`Ender Pearls after extra barter: ${lib.count('ender_pearl')}`);
  } catch (e) {}
}

bot.activateItem(true); // Keep shield raised

console.log('=== Program 779 Summary ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('HP:', bot.health, 'Food:', bot.food);
console.log('Feet slot:', bot.inventory.slots[8]?.name);
console.log('Ender Pearls on Beta:', lib.count('ender_pearl'));
console.log('Inventory:', lib.inv());

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  golden_boots_worn: bot.inventory.slots[8]?.name === 'golden_boots',
  ender_pearls: lib.count('ender_pearl'),
  piglins_nearby: piglins.length,
  teammates_nearby: teammates.length
};
