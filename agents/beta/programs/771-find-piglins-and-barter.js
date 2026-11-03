// programs/771-find-piglins-and-barter.js
console.log('=== Program 771: Find Piglins & Barter Gold Ingot ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);
console.log('Gold ingots on Beta:', lib.count('gold_ingot'));

bot.clearControlStates();
bot.pathfinder.stop();

const moves = new Movements(bot, mcData);
moves.canDig = true;
moves.allowParkour = false;
if (mcData.blocksByName.fire) moves.blocksToAvoid.add(mcData.blocksByName.fire.id);
if (mcData.blocksByName.soul_fire) moves.blocksToAvoid.add(mcData.blocksByName.soul_fire.id);
if (mcData.blocksByName.lava) moves.blocksToAvoid.add(mcData.blocksByName.lava.id);
bot.pathfinder.setMovements(moves);

// Step 1: Scan for all entities within 64m
const allEntities = Object.values(bot.entities).filter(e => e.isValid);
const piglins = allEntities.filter(e => e.name === 'piglin');
const endermen = allEntities.filter(e => e.name === 'enderman');
const teammates = allEntities.filter(e => e.type === 'player' && e.username !== bot.username);

console.log(`Entities within range: Piglins: ${piglins.length}, Endermen: ${endermen.length}, Teammates: ${teammates.length}`);

for (const tm of teammates) {
  console.log(`Teammate ${tm.username} at ${lib.fmt(tm.position)}, dist: ${bot.entity.position.distanceTo(tm.position).toFixed(1)}m`);
}
for (const pig of piglins) {
  console.log(`Piglin at ${lib.fmt(pig.position)}, dist: ${bot.entity.position.distanceTo(pig.position).toFixed(1)}m`);
}
for (const em of endermen) {
  console.log(`Enderman at ${lib.fmt(em.position)}, dist: ${bot.entity.position.distanceTo(em.position).toFixed(1)}m`);
}

// Step 2: If a Piglin is found and Beta has a gold_ingot, barter!
if (piglins.length > 0 && lib.count('gold_ingot') > 0) {
  // Sort by nearest
  piglins.sort((a, b) => bot.entity.position.distanceTo(a.position) - bot.entity.position.distanceTo(b.position));
  const targetPiglin = piglins[0];
  console.log(`Navigating to nearest Piglin at ${lib.fmt(targetPiglin.position)} (dist: ${bot.entity.position.distanceTo(targetPiglin.position).toFixed(1)}m)...`);

  try {
    await bot.pathfinder.goto(new goals.GoalNear(targetPiglin.position.x, targetPiglin.position.y, targetPiglin.position.z, 3.5));
    await bot.lookAt(targetPiglin.position.offset(0, 1.2, 0), true);
    console.log('Tossing gold ingot to Piglin...');
    bot.chat('Beta: Tossing gold ingot to neutral Piglin for bartering!');
    await bot.toss(mcData.itemsByName.gold_ingot.id, null, 1);

    console.log('Waiting 7.5s for Piglin inspection and barter drop...');
    await sleep(7500);
    await lib.pickup(5.0);

    const pearls = lib.count('ender_pearl');
    console.log(`Ender Pearls on Beta now: ${pearls}`);
    if (pearls > 0) {
      bot.chat(`Beta: BARTER SUCCESS! Secured ${pearls} Ender Pearls for Milestone 9!`);
    }
  } catch (err) {
    console.log('Barter navigation error:', err.message);
  }
} else if (piglins.length === 0) {
  console.log('No Piglins within 64m. Advancing along East Ridge trail toward fortress courtyard (z=-120..-176)...');
  // March toward next trail waypoint
  const wp = new Vec3(63, 65, -20);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2.5));
  } catch (e) {
    console.log('Goto trail WP note:', e.message);
  }

  // Scan again at new position
  const newPiglins = Object.values(bot.entities).filter(e => e.name === 'piglin' && e.isValid);
  console.log(`Piglins at new position: ${newPiglins.length}`);
}

// Step 3: Scan for any dropped items nearby (e.g. from teammate barters)
await lib.pickup(6.0);

console.log('=== Final Status ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('HP:', bot.health, 'Food:', bot.food);
console.log('Ender Pearls on Beta:', lib.count('ender_pearl'));
console.log('Gold ingots:', lib.count('gold_ingot'), 'nuggets:', lib.count('gold_nugget'));
console.log('Inventory:', lib.inv());

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  golden_boots: bot.inventory.slots[8]?.name === 'golden_boots',
  ender_pearls: lib.count('ender_pearl'),
  gold_ingots: lib.count('gold_ingot'),
  piglins_found: piglins.length
};
