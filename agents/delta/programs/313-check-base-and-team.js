// programs/313-check-base-and-team.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);

// Check all chests within 10m
const chests = bot.findBlocks({ matching: b => b.name === 'chest', maxDistance: 10, count: 5 });
for (const p of chests) {
  try {
    const cb = bot.blockAt(p);
    const c = await bot.openContainer(cb);
    console.log(`Chest at ${lib.fmt(p)}:`);
    for (const item of c.containerItems()) {
      console.log(`  ${item.name} x${item.count}`);
    }
    c.close();
  } catch (e) {
    console.log(`Chest ${lib.fmt(p)} error:`, e.message);
  }
}

// Check players within 40m
for (const [name, p] of Object.entries(bot.players)) {
  if (p && p.entity) {
    const dist = bot.entity.position.distanceTo(p.entity.position);
    console.log(`Player ${name} at ${lib.fmt(p.entity.position)} (dist: ${dist.toFixed(1)}m, HP: ${p.entity.metadata?.[9] ?? '?'})`);
  }
}

// Check nearby animals (cow, sheep, pig, chicken) within 40m
const animals = Object.values(bot.entities).filter(e => e && (e.name === 'cow' || e.name === 'sheep' || e.name === 'pig' || e.name === 'chicken') && bot.entity.position.distanceTo(e.position) < 40);
console.log(`Nearby animals: ${animals.length}`);
for (const a of animals) {
  console.log(`  Animal ${a.name} at ${lib.fmt(a.position)} (dist: ${bot.entity.position.distanceTo(a.position).toFixed(1)}m)`);
}
