// programs/286-scan-resources-and-coordinate.js
console.log('=== SCAN RESOURCES & COORDINATE ===');
console.log('Current pos:', lib.fmt(bot.entity.position));

// 1. Check delta's position and gear if visible
const deltaPlayer = bot.players.delta;
if (deltaPlayer && deltaPlayer.entity) {
  console.log('Delta visible at:', lib.fmt(deltaPlayer.entity.position));
  const held = deltaPlayer.entity.heldItem;
  console.log('Delta held item:', held ? `${held.name}x${held.count}` : 'none');
} else {
  console.log('Delta entity not visible');
}

// 2. Scan for exposed iron ore, coal ore
const ironOres = bot.findBlocks({
  matching: b => b && (b.name === 'iron_ore' || b.name === 'deepslate_iron_ore'),
  maxDistance: 48,
  count: 10
});
console.log('Iron ores found:', ironOres.map(p => `${lib.fmt(p)} (dist: ${bot.entity.position.distanceTo(p).toFixed(1)}m)`));

const coalOres = bot.findBlocks({
  matching: b => b && (b.name === 'coal_ore' || b.name === 'deepslate_coal_ore'),
  maxDistance: 48,
  count: 10
});
console.log('Coal ores found:', coalOres.map(p => `${lib.fmt(p)} (dist: ${bot.entity.position.distanceTo(p).toFixed(1)}m)`));

// 3. Scan for animals (cows, pigs, sheep, chickens)
const animals = Object.values(bot.entities).filter(e => {
  if (!e || !e.name) return false;
  return ['cow', 'pig', 'sheep', 'chicken'].includes(e.name);
});
console.log('Animals nearby:', animals.map(e => `${e.name} at ${lib.fmt(e.position)} (dist: ${bot.entity.position.distanceTo(e.position).toFixed(1)}m)`));

// 4. Scan for surface trees / logs
const logs = bot.findBlocks({
  matching: b => b && b.name.includes('log'),
  maxDistance: 48,
  count: 10
});
console.log('Trees/logs nearby:', logs.map(p => `${bot.blockAt(p).name} at ${lib.fmt(p)} (dist: ${bot.entity.position.distanceTo(p).toFixed(1)}m)`));

// 5. Check time
const t = lib.time();
console.log(`Time: ${t.timeOfDay} (${t.phase}), night in ${t.secondsUntilNight}s`);
