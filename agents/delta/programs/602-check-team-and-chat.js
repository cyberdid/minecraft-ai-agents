const sill = bot.blockAt(new Vec3(299, 72, -54));
console.log('Sill (299, 72, -54):', sill ? sill.name : 'null');

const players = Object.values(bot.entities).filter(e => e.type === 'player' && e.username !== bot.username);
for (const p of players) {
  console.log(`Player ${p.username}: pos=${lib.fmt(p.position)}, held=${p.heldItem ? p.heldItem.name : 'empty'}`);
}
