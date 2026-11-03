const players = Object.values(bot.entities).filter(e => e.type === 'player' && e.username !== bot.username);
for (const p of players) {
  console.log(`Player ${p.username}: pos=${lib.fmt(p.position)}, held=${p.heldItem ? p.heldItem.name : 'empty'}`);
}
bot.chat('beta: Beta! Toss your empty bucket to me at (299, 73, -52)! I will fetch the lava safely!');
