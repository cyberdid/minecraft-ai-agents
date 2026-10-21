// programs/001-init-check.js
const status = lib.status();
console.log('alpha pos:', lib.fmt(status.pos));
console.log('health:', status.health, 'food:', status.food);
console.log('time:', status.timeOfDay, status.phase, 'night in:', status.secondsUntilNight);

const players = Object.keys(bot.players);
console.log('players online:', players.join(', '));
const beta = bot.players['beta'];
if (beta && beta.entity) {
  console.log('beta pos:', lib.fmt(beta.entity.position));
} else {
  console.log('beta entity not visible/nearby');
}

bot.chat('alpha here at ' + lib.fmt(status.pos) + '. Checking surroundings for base.');
return { pos: status.pos, time: status.secondsUntilNight, players };
