// programs/425-mine-gold-and-scout-north.js
console.log('=== Step: Mine gold ore on ridge and scout North for Nether Fortress ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension);

// 1. Check for nearby teammates
for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity && name !== 'beta') {
    const d = bot.entity.position.distanceTo(p.entity.position).toFixed(1);
    console.log(`Player ${name} at ${lib.fmt(p.entity.position)}, dist=${d}m`);
  }
}

// 2. Scan and mine nether_gold_ore nearby
const goldOres = bot.findBlocks({
  matching: b => b.name === 'nether_gold_ore',
  maxDistance: 16,
  count: 10
});
console.log(`Nether gold ores found nearby: ${goldOres.length}`);

for (const gp of goldOres) {
  if (isCancelled()) break;
  try {
    const pick = bot.inventory.items().find(i => i.name.endsWith('_pickaxe'));
    if (pick) await bot.equip(pick, 'hand');
    console.log(`Mining gold ore at ${lib.fmt(gp)}...`);
    await lib.goTo(gp.x, gp.y, gp.z, 2);
    await lib.dig(gp.x, gp.y, gp.z);
    console.log(`Mined gold ore! Nuggets now: ${lib.count('gold_nugget')}`);
  } catch (e) {
    console.log('Gold mine error:', e.message);
  }
}

// Pick up any nugget drops
const drops = Object.values(bot.entities).filter(e => 
  e.name === 'item' && bot.entity.position.distanceTo(e.position) < 8
);
for (const d of drops) {
  try {
    await lib.goTo(d.position.x, d.position.y, d.position.z, 0.8);
  } catch (e) {}
}
console.log(`Gold nuggets in inventory: ${lib.count('gold_nugget')}`);

// 3. Scout North along the ridge: (62, 68, -20) -> (62, 68, -40)
const northWaypoints = [
  new Vec3(62, 68, -20),
  new Vec3(62, 68, -35),
  new Vec3(62, 68, -50)
];

for (const wp of northWaypoints) {
  if (isCancelled()) break;
  try {
    console.log(`Scouting North to ${lib.fmt(wp)}...`);
    await lib.goTo(wp.x, wp.y, wp.z, 2);
    console.log(`Reached ${lib.fmt(wp)}, pos=${lib.fmt(bot.entity.position)}`);
  } catch (err) {
    console.log(`North nav note to ${lib.fmt(wp)}:`, err.message);
  }

  // Scan 64 blocks for fortress blocks
  const fortressBlocks = bot.findBlocks({
    matching: b => b.name.includes('nether_brick') || b.name === 'spawner',
    maxDistance: 64,
    count: 10
  });
  if (fortressBlocks.length > 0) {
    console.log(`*** NETHER FORTRESS SPOTTED AT ${lib.fmt(fortressBlocks[0])}! ***`);
    bot.chat(`beta: NETHER FORTRESS SPOTTED AT ${lib.fmt(fortressBlocks[0])}!`);
    break;
  }
}

console.log(`Scouting phase complete. Pos: ${lib.fmt(bot.entity.position)}, gold_nuggets: ${lib.count('gold_nugget')}, cobble: ${lib.count('cobblestone')}`);
bot.chat(`beta: North scout report: Pos=${lib.fmt(bot.entity.position)}, gold_nuggets=${lib.count('gold_nugget')}, HP=${bot.health}/20, Food=${bot.food}/20.`);
