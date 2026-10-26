// programs/408-scout-animals-and-resources.js
console.log('=== Program 408: Scout Animals, Ores, and Team in Base ===');
console.log('Alpha at:', lib.fmt(bot.entity.position));

// 1. Check teammates nearby
for (const name of ['beta', 'gamma', 'delta']) {
  const p = bot.players[name];
  if (p && p.entity) {
    console.log(`Teammate ${name}: pos=${lib.fmt(p.entity.position)}, held=${p.entity.heldItem?.name || 'none'}`);
  } else {
    console.log(`Teammate ${name}: not in visual range`);
  }
}

// 2. Scan for passive animals within 64 blocks
const animals = Object.values(bot.entities).filter(e => 
  ['cow', 'pig', 'sheep', 'chicken'].includes(e.name) &&
  bot.entity.position.distanceTo(e.position) <= 64
);
console.log(`Animals found within 64m: ${animals.length}`);
for (const a of animals.slice(0, 10)) {
  console.log(`- ${a.name} at ${lib.fmt(a.position)} (dist: ${bot.entity.position.distanceTo(a.position).toFixed(1)}m)`);
}

// 3. Scan for exposed iron_ore / coal_ore / logs within 48 blocks
const ores = bot.findBlocks({
  matching: b => ['iron_ore', 'deepslate_iron_ore', 'coal_ore', 'deepslate_coal_ore'].includes(b.name),
  maxDistance: 48,
  count: 10
});
console.log(`Ores found within 48m: ${ores.length}`);
for (const o of ores) {
  const b = bot.blockAt(o);
  console.log(`- ${b.name} at ${lib.fmt(o)} (dist: ${bot.entity.position.distanceTo(o).toFixed(1)}m)`);
}

// 4. Check wheat / seeds / apples / food sources
const crops = bot.findBlocks({
  matching: b => ['wheat', 'carrots', 'potatoes', 'hay_block'].includes(b.name),
  maxDistance: 48,
  count: 5
});
console.log(`Crops found within 48m: ${crops.length}`);
for (const c of crops) {
  const b = bot.blockAt(c);
  console.log(`- ${b.name} at ${lib.fmt(c)}`);
}

// 5. Ask Gamma for some cobblestone
bot.chat('team: Morning team! Alpha is at base preparing food & gear before entering Nether to join Delta at Blaze spawner.');

console.log('Alpha status:', JSON.stringify(lib.status()));
