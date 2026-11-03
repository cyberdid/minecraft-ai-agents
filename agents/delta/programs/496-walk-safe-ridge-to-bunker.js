// programs/496-walk-safe-ridge-to-bunker.js
console.log('Delta descending from:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);

bot.clearControlStates();
bot.pathfinder.stop();
bot.pathfinder.setGoal(null);

const moves = new Movements(bot, mcData);
moves.canDig = false;
moves.allowParkour = true;
const fireIds = [mcData.blocksByName.fire?.id, mcData.blocksByName.soul_fire?.id].filter(Boolean);
for (const id of fireIds) moves.blocksToAvoid.add(id);
if (mcData.blocksByName.lava) moves.blocksToAvoid.add(mcData.blocksByName.lava.id);
bot.pathfinder.setMovements(moves);

const DESCENT_WPS = [
  { x: 50.0, y: 70.0, z: -40.0 },
  { x: 61.5, y: 67.0, z: -48.5 },
  { x: 63.0, y: 65.0, z: -20.0 },
  { x: 63.0, y: 64.0, z: -7.0 },
  { x: 46.0, y: 65.0, z: -7.0 },
  { x: 41.0, y: 65.0, z: -6.0 } // Bunker with Crafting Table & Portal!
];

for (let i = 0; i < DESCENT_WPS.length; i++) {
  const wp = DESCENT_WPS[i];
  console.log(`Walking to waypoint ${i + 1}/${DESCENT_WPS.length} (${wp.x}, ${wp.y}, ${wp.z})...`);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 1.8));
    console.log(`Reached WP ${i + 1}! Pos: ${lib.fmt(bot.entity.position)}`);
  } catch (e) {
    console.log(`WP ${i + 1} note:`, e.message);
  }
}

console.log('Delta arrived at:', lib.fmt(bot.entity.position));

// Check nearby teammates
const players = Object.values(bot.players).filter(p => p.username !== bot.username && p.entity);
for (const p of players) {
  console.log(`Teammate ${p.username}: pos=${lib.fmt(p.entity.position)}`);
}

// Check for crafting table in bunker
const ct = bot.findBlock({ matching: b => b && b.name === 'crafting_table', maxDistance: 6 });
console.log('Crafting table found:', ct ? lib.fmt(ct.position) : 'none');

if (ct && lib.count('gold_nugget') >= 9) {
  try {
    console.log('Crafting gold_ingot at Crafting Table...');
    await lib.craft('gold_ingot', Math.floor(lib.count('gold_nugget') / 9));
    console.log('Crafted gold ingots! Total:', lib.count('gold_ingot'));
    bot.chat(`delta: Crafted gold ingot at Nether Bunker! Ingots: ${lib.count('gold_ingot')}.`);
  } catch (e) {
    console.log('Craft ingot error:', e.message);
  }
}

bot.chat(`delta: United with team at Nether Bunker (41, 65, -6)! Holding ${lib.count('gold_ingot')} ingots, ${lib.count('gold_nugget')} nuggets.`);

return {
  pos: bot.entity.position,
  dim: bot.game.dimension,
  nuggets: lib.count('gold_nugget'),
  ingots: lib.count('gold_ingot'),
  hp: bot.health,
  food: bot.food,
  inv: lib.inv()
};
