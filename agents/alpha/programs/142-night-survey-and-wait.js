// programs/142-night-survey-and-wait.js
console.log('--- Base Night Survey & Coordination ---');

// 1. Check bed and spawn
const bedPos = bot.findBlocks({ matching: b => b.name.includes('bed'), maxDistance: 8 })[0];
if (bedPos) {
  const bedBlock = bot.blockAt(bedPos);
  console.log(`Bed at ${lib.fmt(bedPos)}: ${bedBlock.name}`);
  // If no one is in bed, set spawn / try sleeping
  let betaInBed = false;
  for (const p of Object.values(bot.players)) {
    if (p && p.entity && p.username !== bot.username) {
      if (p.entity.position.distanceTo(bedPos) < 1.5) {
        betaInBed = true;
      }
    }
  }
  console.log('Beta in bed:', betaInBed);
}

// 2. Scan for surface water sources (water with air above it)
const waterSources = bot.findBlocks({
  matching: b => b.name === 'water' && b.metadata === 0,
  maxDistance: 64,
  count: 200
}).map(p => bot.blockAt(p))
  .filter(b => b && bot.blockAt(b.position.offset(0, 1, 0))?.name === 'air')
  .sort((a, b) => a.position.distanceTo(bot.entity.position) - b.position.distanceTo(bot.entity.position));

console.log(`Found ${waterSources.length} surface water sources within 64 blocks.`);
if (waterSources.length > 0) {
  for (let i = 0; i < Math.min(3, waterSources.length); i++) {
    console.log(`  Water source ${i + 1}: ${lib.fmt(waterSources[i].position)} (dist: ${waterSources[i].position.distanceTo(bot.entity.position).toFixed(1)})`);
  }
}

// 3. Scan for surface / near-surface iron ore
const ironOres = bot.findBlocks({
  matching: b => b.name === 'iron_ore' || b.name === 'deepslate_iron_ore',
  maxDistance: 64,
  count: 100
}).map(p => bot.blockAt(p))
  .sort((a, b) => a.position.distanceTo(bot.entity.position) - b.position.distanceTo(bot.entity.position));

console.log(`Found ${ironOres.length} iron ore blocks within 64 blocks.`);
const reachableIron = ironOres.filter(b => b.position.y >= 50);
console.log(`Found ${reachableIron.length} iron ores at y >= 50:`);
for (const fe of reachableIron.slice(0, 5)) {
  console.log(`  Iron at ${lib.fmt(fe.position)} (dist: ${fe.position.distanceTo(bot.entity.position).toFixed(1)})`);
}

// 4. Scan for lava
const lavaSources = bot.findBlocks({
  matching: b => b.name === 'lava',
  maxDistance: 64,
  count: 50
}).map(p => bot.blockAt(p));
console.log(`Found ${lavaSources.length} lava blocks within 64 blocks.`);
for (const l of lavaSources.slice(0, 3)) {
  console.log(`  Lava at ${lib.fmt(l.position)}`);
}

// 5. Scan for gravel
const gravelBlocks = bot.findBlocks({
  matching: b => b.name === 'gravel',
  maxDistance: 64,
  count: 20
});
console.log(`Found ${gravelBlocks.length} gravel blocks nearby.`);
for (const g of gravelBlocks.slice(0, 3)) {
  console.log(`  Gravel at ${lib.fmt(g)}`);
}

// 6. Report time remaining until dawn
const curTime = lib.time().timeOfDay;
console.log(`Current time: ${curTime} | Dawn at 23460 (${23460 - curTime} ticks left, ~${Math.round((23460 - curTime)/20)}s)`);
