// programs/669-test-path-to-wp1.js
console.log('Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);

const moves = new Movements(bot, mcData);
const fireIds = [mcData.blocksByName.fire?.id, mcData.blocksByName.soul_fire?.id].filter(Boolean);
for (const id of fireIds) moves.blocksToAvoid.add(id);
if (mcData.blocksByName.lava) moves.blocksToAvoid.add(mcData.blocksByName.lava.id);
moves.canDig = false;
moves.allowParkour = false;
bot.pathfinder.setMovements(moves);

console.log('Attempting goto WP 1 (46, 65, -7)...');
try {
  await bot.pathfinder.goto(new goals.GoalNear(46, 65, -7, 2));
  console.log('Success reaching WP 1! Current pos:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Failed goto WP 1:', e.message);
  console.log('Let us inspect the terrain between here and WP 1...');
}
console.log('Pos after attempt:', lib.fmt(bot.entity.position));
