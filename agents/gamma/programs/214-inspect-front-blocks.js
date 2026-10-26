// programs/214-inspect-front-blocks.js
console.log('--- INSPECT FRONT BLOCKS AT (44, 65, -163) ---');
console.log('Current pos:', lib.fmt(bot.entity.position));

// Check blocks at z=-163 to -167 along x=43..45
for (let z = -163; z >= -167; z--) {
  const row = [];
  for (let x = 43; x <= 45; x++) {
    const f = bot.blockAt(new Vec3(x, 64, z));
    const feet = bot.blockAt(new Vec3(x, 65, z));
    const head = bot.blockAt(new Vec3(x, 66, z));
    const r = bot.blockAt(new Vec3(x, 67, z));
    row.push(`x=${x}:[flr=${f?.name || 'air'},feet=${feet?.name || 'air'},head=${head?.name || 'air'},roof=${r?.name || 'air'}]`);
  }
  console.log(`z=${z}: ${row.join(' | ')}`);
}

// Check towards West (x=43 down to 32 at z=-163)
console.log('West scan at z=-163 (x=43 down to 38):');
for (let x = 43; x >= 38; x--) {
  const f = bot.blockAt(new Vec3(x, 64, -163));
  const feet = bot.blockAt(new Vec3(x, 65, -163));
  const head = bot.blockAt(new Vec3(x, 66, -163));
  console.log(`x=${x}: flr=${f?.name || 'air'}, feet=${feet?.name || 'air'}, head=${head?.name || 'air'}`);
}
