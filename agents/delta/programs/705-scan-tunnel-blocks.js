console.log('=== PROGRAM 705: SCAN BLOCKS X=57 DOWN TO 40 AT Z=-7 ===');
for (let x = 57; x >= 40; x--) {
  const feet = bot.blockAt(new Vec3(x, 65, -7));
  const head = bot.blockAt(new Vec3(x, 66, -7));
  const floor = bot.blockAt(new Vec3(x, 64, -7));
  console.log(`x=${x}: floor=${floor?.name}, feet=${feet?.name}, head=${head?.name}`);
}

// Where is Gamma?
for (const p of Object.values(bot.entities).filter(e => e.type === 'player' && e.username !== bot.username)) {
  console.log(`Player ${p.username}: pos=${lib.fmt(p.position)} (dist: ${bot.entity.position.distanceTo(p.position).toFixed(1)}m)`);
}
