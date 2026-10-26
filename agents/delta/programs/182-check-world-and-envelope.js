// programs/182-check-world-and-envelope.js
console.log('Delta pos:', lib.fmt(bot.entity.position));

// 1. Check players
console.log('--- PLAYERS ---');
for (const name in bot.players) {
  const p = bot.players[name];
  if (p && p.entity) {
    console.log(`Player ${name}: pos=${lib.fmt(p.entity.position)}, dist=${bot.entity.position.distanceTo(p.entity.position).toFixed(1)}m`);
  } else {
    console.log(`Player ${name}: entity not loaded`);
  }
}

// 2. Check blocks along corridor and bridge z=-134 to z=-141
console.log('--- BLOCKS along x=44, y=64..67 ---');
for (let z = -134; z >= -141; z--) {
  let line = `z=${z}: `;
  for (let y = 67; y >= 64; y--) {
    const b = bot.blockAt(new Vec3(44, y, z));
    line += `y${y}:${b?.name || 'none'} `;
  }
  console.log(line);
}

// 3. Check side blocks at z=-135, -136
console.log('--- SIDE BLOCKS z=-135 to -137 ---');
for (let z = -135; z >= -137; z--) {
  for (let y = 66; y >= 65; y--) {
    const bW = bot.blockAt(new Vec3(43, y, z));
    const bE = bot.blockAt(new Vec3(45, y, z));
    console.log(`z=${z} y=${y}: West(x43)=${bW?.name || 'none'}, East(x45)=${bE?.name || 'none'}`);
  }
}
