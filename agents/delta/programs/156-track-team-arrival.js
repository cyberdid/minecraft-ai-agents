// programs/156-track-team-arrival.js
console.log('Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);

const startTime = Date.now();
let detectedTeammate = null;

while (Date.now() - startTime < 25000) {
  if (isCancelled()) break;
  for (const [name, p] of Object.entries(bot.players)) {
    if (name !== 'delta' && p && p.entity) {
      detectedTeammate = { name, pos: p.entity.position };
      const d = Math.round(bot.entity.position.distanceTo(p.entity.position));
      console.log(`Teammate ${name} detected in Nether at ${lib.fmt(p.entity.position)} (dist ${d}m)!`);
      bot.chat(`delta: Welcome ${name}! Follow East Ridge Trail to Fortress Bunker (44, 65, -127). Bunker is 100% fortified and ready.`);
      break;
    }
  }
  if (detectedTeammate) break;
  await sleep(3000);
}

if (!detectedTeammate) {
  console.log('Teammates still transiting portal frame. Standing by at bridgehead.');
}

console.log('Health:', bot.health, 'Food:', bot.food);
