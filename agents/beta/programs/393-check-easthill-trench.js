// programs/393-check-easthill-trench.js
console.log('=== Step: Inspect East hill slope (350, 55, -35) for iron ore and animals ===');
console.log('Current pos:', lib.fmt(bot.entity.position));

// 1. Move to (350, 55, -35) with small steps
try {
  await lib.goTo(350, 56, -35, 2);
  console.log('Reached slope pos:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Move to slope note:', e.message);
}

// 2. Scan for iron ore within 25 blocks
const ironOres = bot.findBlocks({
  matching: b => b.name === 'iron_ore' || b.name === 'deepslate_iron_ore',
  maxDistance: 25,
  count: 30
});
console.log(`Iron ore blocks found (${ironOres.length}):`);
for (const ip of ironOres) {
  console.log(`  Iron ore at ${lib.fmt(ip)}`);
}

// 3. Scan for coal ore
const coalOres = bot.findBlocks({
  matching: b => b.name === 'coal_ore' || b.name === 'deepslate_coal_ore',
  maxDistance: 15,
  count: 10
});
console.log(`Coal ore blocks found: ${coalOres.length}`);

// 4. Scan for animals within 30 blocks
const animals = Object.values(bot.entities).filter(e => 
  ['cow', 'sheep', 'pig', 'chicken'].includes(e.name) &&
  bot.entity.position.distanceTo(e.position) < 30
);
console.log(`Animals found within 30m (${animals.length}):`);
for (const a of animals) {
  console.log(`  ${a.name} at ${lib.fmt(a.position)}, dist=${bot.entity.position.distanceTo(a.position).toFixed(1)}m`);
}

// 5. Scan for nearby players
for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity && name !== 'beta') {
    console.log(`Player ${name} at ${lib.fmt(p.entity.position)}, dist=${bot.entity.position.distanceTo(p.entity.position).toFixed(1)}m`);
  }
}

// 6. If iron ore is found, mine up to 5 blocks
let mined = 0;
for (const ip of ironOres) {
  if (isCancelled() || mined >= 5) break;
  try {
    console.log(`Mining iron at ${lib.fmt(ip)}...`);
    await lib.goTo(ip.x, ip.y, ip.z, 2);
    await lib.dig(ip.x, ip.y, ip.z);
    mined++;
    console.log(`Mined iron ore #${mined}! raw_iron count: ${lib.count('raw_iron')}`);
  } catch (err) {
    console.log('Mine error:', err.message);
  }
}

bot.chat(`beta: At East hill slope ${lib.fmt(bot.entity.position)}. Found ${ironOres.length} iron ore, mined ${mined}. raw_iron in inv: ${lib.count('raw_iron')}.`);
