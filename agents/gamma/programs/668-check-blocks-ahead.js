// programs/668-check-blocks-ahead.js
globalThis.isProgramCancelled = isCancelled;

console.log('=== PROGRAM 668: CHECK BLOCKS AHEAD ===');
console.log('Gamma Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);

for (let x = 50; x >= 40; x--) {
  const f = bot.blockAt(new Vec3(x, 65, -7));
  const h = bot.blockAt(new Vec3(x, 66, -7));
  const f6 = bot.blockAt(new Vec3(x, 65, -6));
  const h6 = bot.blockAt(new Vec3(x, 66, -6));
  console.log(`x=${x} z=-7: feet=${f ? f.name : 'null'}, head=${h ? h.name : 'null'} | z=-6: feet=${f6 ? f6.name : 'null'}, head=${h6 ? h6.name : 'null'}`);
}

return { pos: bot.entity.position };
