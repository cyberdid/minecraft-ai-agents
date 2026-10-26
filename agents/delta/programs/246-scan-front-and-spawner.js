// programs/246-scan-front-and-spawner.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('Health:', bot.health, 'Food:', bot.food);

bot.pathfinder.stop();

// 1. Check surrounding blocks
console.log('--- SURROUNDING BLOCKS AT (44, 65, -170) ---');
for (let dy = -1; dy <= 2; dy++) {
  const f = bot.blockAt(bot.entity.position.offset(0, dy, 0));
  const l = bot.blockAt(bot.entity.position.offset(-1, dy, 0));
  const r = bot.blockAt(bot.entity.position.offset(1, dy, 0));
  const a = bot.blockAt(bot.entity.position.offset(0, dy, -1));
  console.log(`dy=${dy}: center=${f?.name} left(-x)=${l?.name} right(+x)=${r?.name} ahead(-z)=${a?.name}`);
}

// 2. Check nearby hostiles (especially Blazes!)
console.log('--- HOSTILES ---');
const hostiles = Object.values(bot.entities).filter(e => e.type === 'mob' && bot.entity.position.distanceTo(e.position) < 32);
for (const h of hostiles) {
  console.log(`Hostile: ${h.name} at ${lib.fmt(h.position)} (dist: ${bot.entity.position.distanceTo(h.position).toFixed(1)}m)`);
}

// 3. Check dropped items (Alpha drops!)
console.log('--- DROPPED ITEMS ---');
const items = Object.values(bot.entities).filter(e => e.name === 'item' && bot.entity.position.distanceTo(e.position) < 20);
for (const it of items) {
  console.log(`Item at ${lib.fmt(it.position)} dist: ${bot.entity.position.distanceTo(it.position).toFixed(1)}m`);
}

// 4. Distance to Spawner at (32, 68, -190)
const spawner = new Vec3(32, 68, -190);
console.log('Distance to Blaze Spawner (32, 68, -190):', bot.entity.position.distanceTo(spawner).toFixed(1) + 'm');
