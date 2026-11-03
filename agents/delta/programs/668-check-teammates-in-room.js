console.log('=== INSPECT PLAYERS IN ROOM ===');
const players = Object.values(bot.entities).filter(e => e.type === 'player' && e.username !== bot.username);
console.log(`Players in room: ${players.length}`);
for (const p of players) {
  console.log(`  ${p.username} at ${lib.fmt(p.position)} (dist ${bot.entity.position.distanceTo(p.position).toFixed(1)}m)`);
  if (p.heldItem) {
    console.log(`    Holding: ${p.heldItem.name} x${p.heldItem.count}`);
  }
}
bot.chat('delta: Alpha/Beta, do you have any spare cooked food you can toss me? Food is at 3/20.');
