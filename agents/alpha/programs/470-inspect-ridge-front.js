// programs/470-inspect-ridge-front.js
console.log('=== Program 470: Inspect Ridge Ahead ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

for (let dz = 0; dz >= -8; dz--) {
  const z = Math.round(bot.entity.position.z) + dz;
  const x = Math.round(bot.entity.position.x);
  const floor = bot.blockAt(new Vec3(x, 64, z))?.name;
  const feet = bot.blockAt(new Vec3(x, 65, z))?.name;
  const head = bot.blockAt(new Vec3(x, 66, z))?.name;
  const up = bot.blockAt(new Vec3(x, 67, z))?.name;
  console.log(`z=${z}: floor(64)=${floor}, feet(65)=${feet}, head(66)=${head}, roof(67)=${up}`);
}

for (const [name, p] of Object.entries(bot.players)) {
  if (p && p.entity && name !== 'alpha') {
    console.log(`Teammate ${name} at ${lib.fmt(p.entity.position)}`);
  }
}
