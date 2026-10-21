bot.chat("Hi alpha! I just spawned at " + lib.fmt(bot.entity.position) + ". Ready to build!");
const players = Object.keys(bot.players).map(name => {
  const p = bot.players[name];
  return { name, pos: p.entity ? lib.fmt(p.entity.position) : 'unknown' };
});
console.log('Players online:', JSON.stringify(players));
return lib.status();
