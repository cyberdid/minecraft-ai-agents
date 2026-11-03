// programs/811-inspect-wall-to-bunker.js
const p = bot.entity.position;
console.log('Pos:', p);

// Check pillar / mountain structure from y=24 to y=65
for (let y = 24; y <= 35; y++) {
  const b = bot.blockAt(new Vec3(46, y, -124));
  const b45 = bot.blockAt(new Vec3(45, y, -124));
  const b44 = bot.blockAt(new Vec3(44, y, -124));
  console.log(`y=${y}: x46=${b ? b.name : 'null'}, x45=${b45 ? b45.name : 'null'}, x44=${b44 ? b44.name : 'null'}`);
}
