// programs/498-walk-ridge-slope-to-bunker.js
console.log('Delta starting direct descent to bunker from:', lib.fmt(bot.entity.position));

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

const SLOPE_WPS = [
  { x: 37, y: 76, z: -28 },
  { x: 38, y: 76, z: -23 },
  { x: 39, y: 76, z: -18 },
  { x: 40, y: 73, z: -13 },
  { x: 41, y: 68, z: -8 },
  { x: 41, y: 65, z: -6 }
];

for (let i = 0; i < SLOPE_WPS.length; i++) {
  const wp = SLOPE_WPS[i];
  console.log(`Walking to slope WP ${i + 1}/${SLOPE_WPS.length} (${wp.x}, ${wp.y}, ${wp.z})...`);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 1.2));
    console.log(`Reached WP ${i + 1}! Pos: ${lib.fmt(bot.entity.position)}`);
  } catch (e) {
    console.log(`Slope WP ${i + 1} note:`, e.message);
    try {
      await bot.lookAt(new Vec3(wp.x, wp.y, wp.z), true);
      bot.setControlState('forward', true);
      if (wp.y > bot.entity.position.y) bot.setControlState('jump', true);
      await sleep(1000);
      bot.setControlState('jump', false);
      bot.setControlState('forward', false);
    } catch (e2) {}
  }
}

console.log('Delta arrived at:', lib.fmt(bot.entity.position));

// 1. Locate Crafting Table inside bunker
const ct = bot.findBlock({ matching: b => b && b.name === 'crafting_table', maxDistance: 8 });
console.log('Crafting table found:', ct ? lib.fmt(ct.position) : 'none');

if (ct && lib.count('gold_nugget') >= 9) {
  try {
    console.log('Crafting gold_ingot at Crafting Table...');
    await lib.craft('gold_ingot', Math.floor(lib.count('gold_nugget') / 9));
    console.log(`Crafted gold_ingot! Ingots in inv: ${lib.count('gold_ingot')}`);
    bot.chat(`delta: Crafted gold ingot at Nether Bunker! Total ingots: ${lib.count('gold_ingot')}.`);
  } catch (e) {
    console.log('Craft ingot error:', e.message);
  }
}

// 2. Report teammates
const players = Object.values(bot.players).filter(p => p.username !== bot.username && p.entity);
for (const p of players) {
  console.log(`Teammate ${p.username}: pos=${lib.fmt(p.entity.position)}`);
}

bot.chat(`delta: Arrived at Nether Base Camp bunker (41, 65, -6)! United with team for Milestone 9 bartering.`);

return {
  pos: bot.entity.position,
  dim: bot.game.dimension,
  nuggets: lib.count('gold_nugget'),
  ingots: lib.count('gold_ingot'),
  hp: bot.health,
  food: bot.food,
  inv: lib.inv()
};
