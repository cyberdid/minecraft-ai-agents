// programs/162-track-portal-arrivals.js
console.log('Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);

const startTime = Date.now();
let newArrival = null;

while (Date.now() - startTime < 25000) {
  if (isCancelled()) break;
  for (const name of ['alpha', 'beta']) {
    const p = bot.players[name];
    if (p && p.entity) {
      newArrival = { name, pos: p.entity.position };
      const d = Math.round(bot.entity.position.distanceTo(p.entity.position));
      console.log(`NEW ARRIVAL: Player ${name} active in Nether at ${lib.fmt(p.entity.position)} (dist ${d}m)!`);
      bot.chat(`delta: Welcome ${name}! Follow East Ridge Trail (x=63) to Fortress Bunker (44, 65, -127). Delta & Gamma are waiting inside advance tunnel.`);
      break;
    }
  }
  if (newArrival) break;
  await sleep(3000);
}

if (!newArrival) {
  console.log('Alpha and Beta still loading chunks or transiting portal. Standing by with Gamma at (44, 65, -133).');
}

console.log('Delta Health:', bot.health, 'Food:', bot.food);
