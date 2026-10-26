// programs/503-locate-gamma.js
console.log('=== Program 503: Locate Gamma & Teammates ===');
console.log('Alpha at:', lib.fmt(bot.entity.position));

for (const [name, p] of Object.entries(bot.players)) {
  if (p && p.entity) {
    const d = bot.entity.position.distanceTo(p.entity.position);
    console.log(`Teammate ${name} at ${lib.fmt(p.entity.position)} (dist ${d.toFixed(1)}m)`);
  } else {
    console.log(`Teammate ${name} not in visual range`);
  }
}
