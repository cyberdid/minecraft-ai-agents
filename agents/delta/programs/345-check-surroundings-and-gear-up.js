// programs/345-check-surroundings-and-gear-up.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);

// 1. Check nearby items on ground
const drops = await lib.pickup(16);
console.log('Ground pickups near base:', drops);

// 2. Check nearby ores within 32 blocks
const ironOres = lib.find(['iron_ore', 'deepslate_iron_ore'], { maxDistance: 32, count: 5 });
console.log(`Iron ores nearby: ${ironOres.length}`);
for (const o of ironOres) {
  console.log(`  ${o.name} at ${lib.fmt(o.position)}`);
}

const coalOres = lib.find(['coal_ore', 'deepslate_coal_ore'], { maxDistance: 32, count: 5 });
console.log(`Coal ores nearby: ${coalOres.length}`);

// 3. Check trees/logs nearby
const trees = lib.find('*_log', { maxDistance: 32, count: 5 });
console.log(`Logs nearby: ${trees.length}`);
for (const t of trees) {
  console.log(`  ${t.name} at ${lib.fmt(t.position)}`);
}

// 4. Check nearby animals for food
const animals = Object.values(bot.entities).filter(e => e && ['cow', 'pig', 'sheep', 'chicken'].includes(e.name));
console.log(`Animals nearby: ${animals.length}`);
for (const a of animals.slice(0, 5)) {
  console.log(`  ${a.name} at ${lib.fmt(a.position)}, dist: ${bot.entity.position.distanceTo(a.position).toFixed(1)}m`);
}

// 5. Check what other players have in chat / inventory
for (const p of Object.values(bot.players)) {
  if (p.username !== bot.username && p.entity) {
    console.log(`Teammate ${p.username} at ${lib.fmt(p.entity.position)}`);
  }
}

bot.chat('delta: Respawned at base! Rearming with wood, stone tools, shield & food before re-entering Nether.');
