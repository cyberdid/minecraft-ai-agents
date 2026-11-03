// programs/677-check-players.js
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);

for (const name of ['beta', 'gamma', 'delta']) {
  const p = bot.players[name];
  if (p && p.entity) {
    console.log(`Player ${name}: pos = ${lib.fmt(p.entity.position)}, held = ${p.entity.heldItem?.name}`);
  } else {
    console.log(`Player ${name}: not in visual range or not logged in`);
  }
}

bot.chat('alpha: Checking in with team! Beta, confirm if you are holding the 8 Blaze Rods!');
