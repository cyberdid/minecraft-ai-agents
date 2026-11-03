// programs/678-inspect-path-to-portal1.js
globalThis.isProgramCancelled = isCancelled;

console.log('=== PROGRAM 678: INSPECT EXACT BLOCKS TO PORTAL 1 ===');
console.log('Pos:', lib.fmt(bot.entity.position));

const target = new Vec3(46.5, 66.0, 2.0);
console.log(`Checking line from ${lib.fmt(bot.entity.position)} to ${lib.fmt(target)}:`);

for (let z = -5; z <= 3; z++) {
  for (let x = 46; x <= 50; x++) {
    const f = bot.blockAt(new Vec3(x, 65, z));
    const h = bot.blockAt(new Vec3(x, 66, z));
    const u = bot.blockAt(new Vec3(x, 67, z));
    if ((f && f.name !== 'air') || (h && h.name !== 'air') || (u && u.name !== 'air')) {
      console.log(`(${x}, z=${z}): y65=${f?.name}, y66=${h?.name}, y67=${u?.name}`);
    }
  }
}

return { pos: bot.entity.position };
