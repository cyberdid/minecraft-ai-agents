for (const p of Object.values(bot.players)) {
  if (p.entity) {
    console.log(`Player ${p.username}: pos=${lib.fmt(p.entity.position)}, HP=${p.entity.health || '?'}`);
  }
}
