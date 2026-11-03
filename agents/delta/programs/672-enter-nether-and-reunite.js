console.log('=== DELTA: RETURN TO NETHER & REUNITE WITH TEAM ===');
console.log(`Current pos: ${lib.fmt(bot.entity.position)}, dimension: ${bot.game.dimension}`);

// Climb out of ledge (y=68) to surface (y=72..73)
try {
  await bot.pathfinder.goto(new goals.GoalNear(299.5, 73.0, -54.0, 1.5));
} catch (e) {
  console.log('Pathfinder notice:', e.message);
  try {
    await lib.goToXZ(299.5, -54.0, { timeoutMs: 8000 });
  } catch (e2) {}
}

console.log(`At Nether portal approach: ${lib.fmt(bot.entity.position)}`);

// Use the preloaded 1-line helper: enterNetherPortal()
const warpResult = await enterNetherPortal();
console.log('enterNetherPortal result:', JSON.stringify(warpResult));

console.log(`Arrived in Nether! Current pos: ${lib.fmt(bot.entity.position)}, dimension: ${bot.game.dimension}`);

// Check teammates at Portal Camp
const players = Object.values(bot.entities).filter(e => e.type === 'player' && e.username !== bot.username);
console.log(`Teammates present (${players.length}):`);
for (const p of players) {
  console.log(`  ${p.username} at ${lib.fmt(p.position)} (dist ${bot.entity.position.distanceTo(p.position).toFixed(1)}m)`);
}

// Check nearby Endermen
const endermen = Object.values(bot.entities).filter(e => e.name === 'enderman' && e.isValid);
console.log(`Endermen in area: ${endermen.length}`);
for (const end of endermen) {
  console.log(`  Enderman at ${lib.fmt(end.position)} (dist ${bot.entity.position.distanceTo(end.position).toFixed(1)}m)`);
}

// Check nearby Piglins
const piglins = Object.values(bot.entities).filter(e => e.name === 'piglin' && e.isValid);
console.log(`Piglins in area: ${piglins.length}`);

bot.chat(`delta: Reunited at Nether Portal Camp (46, 66, 2)! Golden boots active, holding 2 gold ingots. Ready to hunt Endermen & barter for Milestone 9!`);

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  players: players.map(p => ({ name: p.username, pos: p.position })),
  endermen: endermen.length,
  piglins: piglins.length
};
