// programs/087-locate-food.js
const targets = ['cow', 'sheep', 'chicken'];
for (const t of targets) {
  const ents = Object.values(bot.entities).filter(e => e.name === t);
  for (const e of ents) {
    console.log(`${t} at ${lib.fmt(e.position)} (dist: ${Math.round(e.position.distanceTo(bot.entity.position))})`);
  }
}
