// programs/081-check-players.js
for (const [name, p] of Object.entries(bot.players)) {
  if (p && p.entity) {
    const pos = p.entity.position;
    const dist = Math.round(bot.entity.position.distanceTo(pos));
    console.log(`Player ${name}: pos ${lib.fmt(pos)} dist ${dist}`);
  } else {
    console.log(`Player ${name}: not in loaded range`);
  }
}
