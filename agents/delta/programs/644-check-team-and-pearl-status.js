const players = Object.values(bot.entities).filter(e => e.type === 'player' && e.username !== bot.username);
for (const p of players) {
  console.log(`Teammate ${p.username}: pos=${lib.fmt(p.position)}, dist=${p.position.distanceTo(bot.entity.position).toFixed(1)}m, held=${p.heldItem?.name || 'none'}`);
}
bot.chat('delta: All 4 players armed & neutral! Wearing golden_boots with 2 gold ingots! Team pearl count?');
