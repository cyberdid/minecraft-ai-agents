// programs/490-scan-and-mine-gold.js
console.log('Delta pos:', lib.fmt(bot.entity.position));

const goldOreId = mcData.blocksByName.nether_gold_ore?.id;
const ores = bot.findBlocks({
  matching: goldOreId,
  maxDistance: 32,
  count: 30
}).map(p => bot.blockAt(p));

console.log(`Found ${ores.length} nether_gold_ore blocks within 32m:`);
for (const b of ores) {
  const p = b.position;
  console.log(`- ore at ${lib.fmt(p)} (dist: ${bot.entity.position.distanceTo(p).toFixed(1)}m)`);
}

// Check for Piglins nearby
const piglins = Object.values(bot.entities).filter(e => e.name === 'piglin' && e.isValid);
console.log(`Nearby Piglins (${piglins.length}):`, piglins.map(p => `${lib.fmt(p.position)} (dist: ${bot.entity.position.distanceTo(p.position).toFixed(1)}m)`).join(', '));

// Advance to WP (63, 66, -35) and WP (62, 67, -50)
const nextWPs = [
  { x: 63, y: 66, z: -35 },
  { x: 62, y: 67, z: -50 }
];

const moves = new Movements(bot, mcData);
moves.canDig = false;
moves.allowParkour = true;
const fireIds = [mcData.blocksByName.fire?.id, mcData.blocksByName.soul_fire?.id].filter(Boolean);
for (const id of fireIds) moves.blocksToAvoid.add(id);
bot.pathfinder.setMovements(moves);

for (const wp of nextWPs) {
  console.log(`Advancing to (${wp.x}, ${wp.y}, ${wp.z})...`);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 1.5));
    console.log(`Reached (${wp.x}, ${wp.y}, ${wp.z})! Current pos: ${lib.fmt(bot.entity.position)}`);
  } catch (e) {
    console.log(`Path error to (${wp.x}, ${wp.y}, ${wp.z}):`, e.message);
  }
}

return { pos: bot.entity.position, oresCount: ores.length, piglinsCount: piglins.length };
