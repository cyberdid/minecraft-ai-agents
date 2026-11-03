// programs/698-check-teammate-positions.js
for (const [name, p] of Object.entries(bot.players)) {
  if (name === bot.username) continue;
  const e = p.entity;
  if (e) {
    console.log(`Teammate ${name} is at ${lib.fmt(e.position)}, dist=${bot.entity.position.distanceTo(e.position).toFixed(1)}m`);
  } else {
    console.log(`Teammate ${name} not rendered in local chunks.`);
  }
}
