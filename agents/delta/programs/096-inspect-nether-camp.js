// programs/096-inspect-nether-camp.js
console.log('Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('Health:', bot.health, 'Food:', bot.food);

// 1. Players in the Nether
console.log('Players in loaded area:');
for (const [name, p] of Object.entries(bot.players)) {
  if (p && p.entity) {
    const d = Math.round(bot.entity.position.distanceTo(p.entity.position));
    console.log(`- ${name} at ${lib.fmt(p.entity.position)} (dist ${d})`);
  } else {
    console.log(`- ${name} (not loaded)`);
  }
}

// 2. Mobs / Entities
const mobs = [];
for (const id in bot.entities) {
  const e = bot.entities[id];
  if (!e || e.type !== 'mob') continue;
  const d = Math.round(bot.entity.position.distanceTo(e.position));
  mobs.push({ name: e.name, pos: lib.fmt(e.position), dist: d });
}
mobs.sort((a,b) => a.dist - b.dist);
console.log(`Found ${mobs.length} mobs nearby:`);
for (const m of mobs.slice(0, 10)) {
  console.log(`- ${m.name} at ${m.pos} (dist ${m.dist})`);
}

// 3. Inspect portal & bunker cobblestone
const portals = bot.findBlocks({ matching: b => b.name === 'nether_portal', maxDistance: 12, count: 10 });
console.log(`Nether portal blocks: ${portals.length}`);
for (const p of portals) {
  console.log(`  portal at ${lib.fmt(p)}`);
}

const cobbles = bot.findBlocks({ matching: b => b.name === 'cobblestone', maxDistance: 12, count: 100 });
console.log(`Cobblestone blocks in bunker: ${cobbles.length}`);

// Check roof above portal (y = 68)
let roofBlocks = 0;
for (let x = 39; x <= 42; x++) {
  for (let z = -8; z <= -6; z++) {
    const blk = bot.blockAt(new Vec3(x, 68, z));
    if (blk && blk.name === 'cobblestone') roofBlocks++;
  }
}
console.log(`Bunker roof cobblestones: ${roofBlocks}/12`);

// Check nearby gold ore
const goldOres = bot.findBlocks({
  matching: b => ['nether_gold_ore', 'gilded_blackstone'].includes(b.name),
  maxDistance: 16,
  count: 10
});
console.log(`Found ${goldOres.length} nether_gold_ore veins within 16 blocks`);
for (const g of goldOres.slice(0, 5)) {
  console.log(`  gold ore at ${lib.fmt(g)} (dist ${Math.round(bot.entity.position.distanceTo(g))})`);
}

bot.chat(`delta: Nether camp inspection: ${cobbles.length} bunker cobble, ${portals.length} portal blocks, ${goldOres.length} gold veins nearby.`);
